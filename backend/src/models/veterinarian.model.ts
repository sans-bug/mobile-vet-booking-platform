import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  slots: {
    type: [String], // Array of time strings, e.g. ["09:00", "10:00", "14:00"]
    required: true,
  },
});

const veterinarianSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: 0,
    },
    clinicName: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true,
    },
    clinicAddress: {
      type: String,
      required: [true, 'Clinic address is required'],
    },
    consultingFee: {
      type: Number,
      required: [true, 'Consulting fee is required'],
      min: 0,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
    },
    bio: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    coordinates: {
      lat: { type: Number, required: true, default: 28.6139 }, // Default coordinates (e.g. New Delhi or user's town)
      lng: { type: Number, required: true, default: 77.2090 },
    },
    availability: [availabilitySchema],
    services: {
      type: [String],
      default: ['General Check-up'],
    },
  },
  {
    timestamps: true,
  }
);

export const Veterinarian = mongoose.model('Veterinarian', veterinarianSchema);
