"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emergency = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const emergencySchema = new mongoose_1.default.Schema({
    ownerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    petId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Veterinarian',
    },
    notes: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});
exports.Emergency = mongoose_1.default.model('Emergency', emergencySchema);
