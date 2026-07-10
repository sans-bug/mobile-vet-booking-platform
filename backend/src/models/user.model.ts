import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
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
      required: function (this: any) {
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
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Helper method to compare passwords
userSchema.methods.comparePassword = async function (passwordToCheck: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(passwordToCheck, this.password);
};

export const User = mongoose.model('User', userSchema);
