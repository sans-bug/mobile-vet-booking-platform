"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Password is only required if googleId is not present
        },
        minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
        type: String,
        enum: ['pet_owner', 'veterinarian', 'admin'],
        default: 'pet_owner',
    },
    phone: {
        type: String,
        trim: true,
    },
    avatarUrl: {
        type: String,
        default: '',
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
    },
    googleId: {
        type: String,
        default: '',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (err) {
        next(err);
    }
});
// Helper method to compare passwords
userSchema.methods.comparePassword = async function (passwordToCheck) {
    if (!this.password)
        return false;
    return await bcryptjs_1.default.compare(passwordToCheck, this.password);
};
exports.User = mongoose_1.default.model('User', userSchema);
