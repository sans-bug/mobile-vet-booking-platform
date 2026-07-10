"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    vetId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Veterinarian',
        required: true,
    },
    ownerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    appointmentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// Compound index to guarantee only one review per appointment
reviewSchema.index({ appointmentId: 1 }, { unique: true });
exports.Review = mongoose_1.default.model('Review', reviewSchema);
