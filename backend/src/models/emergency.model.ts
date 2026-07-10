import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: 'Current User Location' },
    },
    contactPhone: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: ['high', 'critical'],
      default: 'high',
    },
    status: {
      type: String,
      enum: ['pending', 'dispatched', 'resolved', 'cancelled'],
      default: 'pending',
    },
    assignedVetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Veterinarian',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Emergency = mongoose.model('Emergency', emergencySchema);
