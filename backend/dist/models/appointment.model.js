"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const prescriptionItemSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    dosage: { type: String, required: true }, // e.g. "5ml", "1 tablet"
    frequency: { type: String, required: true }, // e.g. "Twice daily"
    duration: { type: String, required: true }, // e.g. "5 days"
});
const appointmentSchema = new mongoose_1.default.Schema({
    ownerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    vetId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Veterinarian',
        required: true,
    },
    petId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
exports.Appointment = mongoose_1.default.model('Appointment', appointmentSchema);
