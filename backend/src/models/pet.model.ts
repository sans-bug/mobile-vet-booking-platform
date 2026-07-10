import mongoose from 'mongoose';

const weightLogSchema = new mongoose.Schema({
  weight: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const medicalHistorySchema = new mongoose.Schema({
  condition: { type: String, required: true },
  date: { type: Date, required: true },
  notes: { type: String, default: '' },
  diagnosedBy: { type: String, default: '' },
});

const vaccinationRecordSchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  dateAdministered: { type: Date, required: true },
  nextDueDate: { type: Date, required: true },
  administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const petSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Pet species is required'],
      enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Reptile', 'Other'],
      default: 'Dog',
    },
    breed: {
      type: String,
      required: [true, 'Pet breed is required'],
      trim: true,
    },
    birthDate: {
      type: Date,
      required: [true, 'Pet birth date is required'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    weightHistory: [weightLogSchema],
    medicalHistory: [medicalHistorySchema],
    vaccinationRecords: [vaccinationRecordSchema],
  },
  {
    timestamps: true,
  }
);

export const Pet = mongoose.model('Pet', petSchema);
