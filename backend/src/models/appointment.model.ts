import mongoose from 'mongoose';

const prescriptionItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g. "5ml", "1 tablet"
  frequency: { type: String, required: true }, // e.g. "Twice daily"
  duration: { type: String, required: true }, // e.g. "5 days"
});

const appointmentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Veterinarian',
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    service: {
      type: String,
      required: true,
      enum: [
        'General Check-up',
        'Vaccination',
        'Surgery Consultation',
        'Emergency Visit',
        'Grooming',
        'Dental Care',
        'Pet Nutrition',
        'Online Consultation',
        'Pet Adoption Consultation',
        'Pet Health Certificate',
      ],
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    visitType: {
      type: String,
      enum: ['clinic', 'home_visit', 'online'],
      default: 'clinic',
    },
    reason: {
      type: String,
      default: '',
    },
    consultingFee: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentId: {
      type: String, // Stripe Payment Intent ID or transaction reference
      default: '',
    },
    prescription: {
      notes: { type: String, default: '' },
      medicines: [prescriptionItemSchema],
    },
    medicalReports: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);
