import { Response } from 'express';
import { Review } from '../models/review.model';
import { Appointment } from '../models/appointment.model';
import { Veterinarian } from '../models/veterinarian.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const createReview = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { appointmentId, rating, reviewText } = req.body;
    const ownerId = req.user._id;

    if (!appointmentId || !rating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID, rating, and review text are required.',
      });
    }

    const appointment = await Appointment.findById(appointmentId);
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
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this appointment.',
      });
    }

    // Create Review
    const review = new Review({
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
    const reviews = await Review.find({ vetId: appointment.vetId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / reviews.length).toFixed(1));

    await Veterinarian.findByIdAndUpdate(appointment.vetId, {
      rating: avgRating,
      reviewsCount: reviews.length,
    });

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVetReviews = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const reviews = await Review.find({ vetId: req.params.vetId })
      .populate('ownerId', 'name avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
