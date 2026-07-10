"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.forgotPassword = exports.googleLogin = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const veterinarian_model_1 = require("../models/veterinarian.model");
const signToken = (id) => {
    const secret = process.env.JWT_SECRET || 'vetconnect_dev_jwt_signing_secret_key_987654321';
    const options = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') };
    return jsonwebtoken_1.default.sign({ id }, secret, options);
};
const register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email address already in use.',
            });
        }
        const newUser = new user_model_1.User({
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
            const newVet = new veterinarian_model_1.Veterinarian({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.',
            });
        }
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password.',
            });
        }
        // Use schema method to compare
        const isCorrect = await user.comparePassword(password);
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
            vetProfile = await veterinarian_model_1.Veterinarian.findOne({ userId: user._id });
        }
        res.status(200).json({
            success: true,
            token,
            user: userObject,
            vetProfile,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.login = login;
const googleLogin = async (req, res) => {
    try {
        const { email, name, avatarUrl, googleId } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Google login requires email.',
            });
        }
        let user = await user_model_1.User.findOne({ email });
        if (!user) {
            // Create user
            user = new user_model_1.User({
                name: name || 'Google User',
                email,
                avatarUrl: avatarUrl || '',
                googleId: googleId || `g_${Date.now()}`,
                role: 'pet_owner',
                isEmailVerified: true,
            });
            await user.save();
        }
        else if (!user.googleId) {
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.googleLogin = googleLogin;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await user_model_1.User.findOne({ email });
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const getMe = async (req, res) => {
    try {
        const user = req.user;
        let vetProfile = null;
        if (user.role === 'veterinarian') {
            vetProfile = await veterinarian_model_1.Veterinarian.findOne({ userId: user._id });
        }
        res.status(200).json({
            success: true,
            user,
            vetProfile,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phone, avatarUrl, address, specialization, experience, clinicName, clinicAddress, consultingFee, services } = req.body;
        const user = await user_model_1.User.findByIdAndUpdate(userId, { name, phone, avatarUrl, address }, { new: true, runValidators: true }).select('-password');
        let vetProfile = null;
        if (user && user.role === 'veterinarian') {
            vetProfile = await veterinarian_model_1.Veterinarian.findOneAndUpdate({ userId }, { specialization, experience, clinicName, clinicAddress, consultingFee, services }, { new: true, runValidators: true });
        }
        res.status(200).json({
            success: true,
            user,
            vetProfile,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProfile = updateProfile;
