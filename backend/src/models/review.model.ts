import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    vetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Veterinarian',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: [true, 'Review content is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee only one review per appointment
reviewSchema.index({ appointmentId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
