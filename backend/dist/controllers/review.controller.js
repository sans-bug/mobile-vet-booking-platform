"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVetReviews = exports.createReview = void 0;
const review_model_1 = require("../models/review.model");
const appointment_model_1 = require("../models/appointment.model");
const veterinarian_model_1 = require("../models/veterinarian.model");
const createReview = async (req, res) => {
    try {
        const { appointmentId, rating, reviewText } = req.body;
        const ownerId = req.user._id;
        if (!appointmentId || !rating || !reviewText) {
            return res.status(400).json({
                success: false,
                message: 'Appointment ID, rating, and review text are required.',
            });
        }
        const appointment = await appointment_model_1.Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }
        // Verify ownership
        if (appointment.ownerId.toString() !== ownerId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized review request.' });
        }
        // Check if already completed
        if (appointment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'You can only review appointments that have been completed.',
            });
        }
        // Check if review already exists
        const existingReview = await review_model_1.Review.findOne({ appointmentId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a review for this appointment.',
            });
        }
        // Create Review
        const review = new review_model_1.Review({
            vetId: appointment.vetId,
            ownerId,
            appointmentId,
            rating,
            reviewText,
        });
        await review.save();
        // Mark appointment as reviewed
        appointment.isReviewed = true;
        await appointment.save();
        // Recalculate average rating for Vet
        const reviews = await review_model_1.Review.find({ vetId: appointment.vetId });
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = Number((totalRating / reviews.length).toFixed(1));
        await veterinarian_model_1.Veterinarian.findByIdAndUpdate(appointment.vetId, {
            rating: avgRating,
            reviewsCount: reviews.length,
        });
        res.status(201).json({
            success: true,
            review,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createReview = createReview;
const getVetReviews = async (req, res) => {
    try {
        const reviews = await review_model_1.Review.find({ vetId: req.params.vetId })
            .populate('ownerId', 'name avatarUrl')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            reviews,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVetReviews = getVetReviews;
