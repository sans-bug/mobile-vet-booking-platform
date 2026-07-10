import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Veterinarian } from '../models/veterinarian.model';
import { AuthRequest } from '../middleware/auth.middleware';

const signToken = (id: string): string => {
  const secret: Secret = process.env.JWT_SECRET || 'vetconnect_dev_jwt_signing_secret_key_987654321';
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'] };

  return jwt.sign({ id }, secret, options);
};

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email address already in use.',
      });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || 'pet_owner',
      phone,
    });
    await newUser.save();

    // If the registered role is veterinarian, create an incomplete Vet Profile
    if (role === 'veterinarian') {
      const { specialization, experience, clinicName, clinicAddress, licenseNumber, consultingFee } = req.body;
      
      const newVet = new Veterinarian({
        userId: newUser._id,
        specialization: specialization || 'General Vet',
        experience: Number(experience) || 0,
        clinicName: clinicName || 'Clinic Name',
        clinicAddress: clinicAddress || 'Clinic Address',
        consultingFee: Number(consultingFee) || 50,
        licenseNumber: licenseNumber || `LIC-${Date.now()}`,
        verificationStatus: 'pending',
      });
      await newVet.save();
    }

    const token = signToken(newUser._id.toString());

    // Clean password
    const userObject = newUser.toObject();
    delete userObject.password;

    res.status(201).json({
      success: true,
      token,
      user: userObject,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password.',
      });
    }

    // Use schema method to compare
    const isCorrect = await (user as any).comparePassword(password);
    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password.',
      });
    }

    const token = signToken(user._id.toString());

    // Clean password
    const userObject = user.toObject();
    delete userObject.password;

    // If vet, fetch status
    let vetProfile = null;
    if (user.role === 'veterinarian') {
      vetProfile = await Veterinarian.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: userObject,
      vetProfile,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, avatarUrl, googleId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google login requires email.',
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create user
      user = new User({
        name: name || 'Google User',
        email,
        avatarUrl: avatarUrl || '',
        googleId: googleId || `g_${Date.now()}`,
        role: 'pet_owner',
        isEmailVerified: true,
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google ID if email matches but Google ID wasn't set
      user.googleId = googleId || `g_${Date.now()}`;
      await user.save();
    }

    const token = signToken(user._id.toString());
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      success: true,
      token,
      user: userObject,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account associated with this email address.',
      });
    }

    // Mock reset token / email sending
    console.log(`Password reset link requested for email: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email. Active for 1 hour.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = req.user;
    let vetProfile = null;

    if (user.role === 'veterinarian') {
      vetProfile = await Veterinarian.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      vetProfile,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user._id;
    const { name, phone, avatarUrl, address, specialization, experience, clinicName, clinicAddress, consultingFee, services } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, avatarUrl, address },
      { new: true, runValidators: true }
    ).select('-password');

    let vetProfile = null;
    if (user && user.role === 'veterinarian') {
      vetProfile = await Veterinarian.findOneAndUpdate(
        { userId },
        { specialization, experience, clinicName, clinicAddress, consultingFee, services },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      user,
      vetProfile,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
