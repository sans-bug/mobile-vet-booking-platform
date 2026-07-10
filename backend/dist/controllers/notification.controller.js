"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllRead = exports.getNotifications = void 0;
const notification_model_1 = require("../models/notification.model");
const getNotifications = async (req, res) => {
    try {
        const notifications = await notification_model_1.Notification.find({ recipientId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ success: true, notifications });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getNotifications = getNotifications;
const markAllRead = async (req, res) => {
    try {
        await notification_model_1.Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.markAllRead = markAllRead;
