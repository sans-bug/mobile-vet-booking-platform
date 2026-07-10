"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyVet = exports.getVets = exports.deleteUser = exports.getUsers = void 0;
const user_model_1 = require("../models/user.model");
const veterinarian_model_1 = require("../models/veterinarian.model");
const notification_model_1 = require("../models/notification.model");
const getUsers = async (req, res) => {
    try {
        const users = await user_model_1.User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUsers = getUsers;
const deleteUser = async (req, res) => {
    try {
        const user = await user_model_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role === 'veterinarian') {
            await veterinarian_model_1.Veterinarian.findOneAndDelete({ userId: user._id });
        }
        await user_model_1.User.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully.',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteUser = deleteUser;
const getVets = async (req, res) => {
    try {
        const vets = await veterinarian_model_1.Veterinarian.find()
            .populate('userId', 'name email phone avatarUrl address')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            veterinarians: vets,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVets = getVets;
const verifyVet = async (req, res) => {
    try {
        const { status } = req.body; // approved, rejected
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Verification status must be approved or rejected.' });
        }
        const vet = await veterinarian_model_1.Veterinarian.findById(req.params.id);
        if (!vet) {
            return res.status(404).json({ success: false, message: 'Veterinarian profile not found' });
        }
        vet.verificationStatus = status;
        await vet.save();
        // Notify Vet user
        await new notification_model_1.Notification({
            recipientId: vet.userId,
            title: `License Verification Update`,
            message: `Your professional license has been reviewed by admins and marked as: ${status.toUpperCase()}.`,
            type: 'system',
        }).save();
        res.status(200).json({
            success: true,
            veterinarian: vet,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.verifyVet = verifyVet;
