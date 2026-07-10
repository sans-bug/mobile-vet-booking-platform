import { Response } from 'express';
import { User } from '../models/user.model';
import { Veterinarian } from '../models/veterinarian.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification } from '../models/notification.model';

export const getUsers = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'veterinarian') {
      await Veterinarian.findOneAndDelete({ userId: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVets = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const vets = await Veterinarian.find()
      .populate('userId', 'name email phone avatarUrl address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      veterinarians: vets,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyVet = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { status } = req.body; // approved, rejected
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Verification status must be approved or rejected.' });
    }

    const vet = await Veterinarian.findById(req.params.id);
    if (!vet) {
      return res.status(404).json({ success: false, message: 'Veterinarian profile not found' });
    }

    vet.verificationStatus = status;
    await vet.save();

    // Notify Vet user
    await new Notification({
      recipientId: vet.userId,
      title: `License Verification Update`,
      message: `Your professional license has been reviewed by admins and marked as: ${status.toUpperCase()}.`,
      type: 'system',
    }).save();

    res.status(200).json({
      success: true,
      veterinarian: vet,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
