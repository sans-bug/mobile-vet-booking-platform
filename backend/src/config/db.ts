import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetconnect';

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.warn('MongoDB connection error:', error);
    console.warn('Continuing without a database connection. API routes that require persistence will fail until MongoDB is available.');
  }
};
