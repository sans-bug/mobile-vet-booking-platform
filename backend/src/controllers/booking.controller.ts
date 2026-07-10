import { Response } from 'express';
import { Appointment } from '../models/appointment.model';
import { Veterinarian } from '../models/veterinarian.model';
import { Pet } from '../models/pet.model';
import { createPaymentIntent } from '../config/stripe';
import { uploadBlob } from '../config/azure';
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification } from '../models/notification.model';

export const getVeterinarians = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { specialization, service, isVerified } = req.query;
    const filter: any = {};

    if (isVerified) {
      filter.verificationStatus = isVerified;
    } else {
      // By default, only show approved vets to non-admins
      filter.verificationStatus = 'approved';
    }

    if (specialization) {
      filter.specialization = new RegExp(specialization as string, 'i');
    }

    if (service) {
      filter.services = { $in: [service as string] };
    }

    // Populate user profile info (name, email, phone, avatarUrl)
    const vets = await Veterinarian.find(filter).populate('userId', 'name email phone avatarUrl');

    res.status(200).json({
      success: true,
      veterinarians: vets,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { vetId, petId, service, date, timeSlot, visitType, reason } = req.body;
    const ownerId = req.user._id;

    // Validate Vet
    const vet = await Veterinarian.findById(vetId).populate('userId');
    if (!vet) {
      return res.status(404).json({ success: false, message: 'Veterinarian profile not found' });
    }

    // Validate Pet
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Validate scheduling conflict (duplicate timeSlot, date, and vet)
    const existingBooking = await Appointment.findOne({
      vetId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for this doctor. Please pick another time.',
      });
    }

    // Initiate Stripe Payment Intent
    const payment = await createPaymentIntent(vet.consultingFee, 'usd');

    const appointment = new Appointment({
      ownerId,
      vetId,
      petId,
      service,
      date: new Date(date),
      timeSlot,
      visitType: visitType || 'clinic',
      reason,
      consultingFee: vet.consultingFee,
      paymentStatus: 'pending',
      paymentId: payment.id,
      status: 'pending',
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      appointment,
      clientSecret: payment.clientSecret,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { appointmentId, paymentIntentId } = req.body;
    
    const appointment = await Appointment.findById(appointmentId).populate('vetId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Validate user owns it
    if (appointment.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized confirmation request' });
    }

    appointment.paymentStatus = 'paid';
    appointment.paymentId = paymentIntentId || appointment.paymentId;
    appointment.status = 'confirmed';
    await appointment.save();

    // Create notifications for both client and veterinarian
    const doctorUser: any = (appointment.vetId as any).userId;
    
    await new Notification({
      recipientId: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your booking for ${appointment.service} on ${appointment.date.toDateString()} has been scheduled successfully.`,
      type: 'booking',
    }).save();

    await new Notification({
      recipientId: doctorUser,
      title: 'New Confirmed Appointment',
      message: `A client has paid and confirmed a booking for ${appointment.service} on ${appointment.date.toDateString()}.`,
      type: 'booking',
    }).save();

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookings = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    let filter: any = {};

    if (req.user.role === 'pet_owner') {
      filter.ownerId = req.user._id;
    } else if (req.user.role === 'veterinarian') {
      const vet = await Veterinarian.findOne({ userId: req.user._id });
      if (!vet) {
        return res.status(404).json({ success: false, message: 'Veterinarian profile not found' });
      }
      filter.vetId = vet._id;
    }

    const bookings = await Appointment.find(filter)
      .populate({
        path: 'vetId',
        populate: { path: 'userId', select: 'name email phone avatarUrl' },
      })
      .populate('ownerId', 'name email phone avatarUrl')
      .populate('petId', 'name species breed imageUrl weightHistory')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { status } = req.body; // confirmed, completed, cancelled
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const vetProfile = await Veterinarian.findOne({ userId: req.user._id });
    const isVetOwner = vetProfile && appointment.vetId.toString() === vetProfile._id.toString();
    const isClientOwner = appointment.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isVetOwner && !isClientOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized status modify attempt' });
    }

    appointment.status = status;
    await appointment.save();

    // Trigger Notification
    const alertId = isClientOwner 
      ? (vetProfile ? req.user._id : (appointment.vetId as any).userId)
      : appointment.ownerId;
      
    await new Notification({
      recipientId: alertId,
      title: `Booking Status Update`,
      message: `Your booking for ${appointment.service} on ${appointment.date.toDateString()} is now ${status}.`,
      type: 'booking',
    }).save();

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPrescription = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { notes, medicines } = req.body; // { name, dosage, frequency, duration }
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Only vet can update prescription
    const vetProfile = await Veterinarian.findOne({ userId: req.user._id });
    if (!vetProfile || appointment.vetId.toString() !== vetProfile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the assigned veterinarian can write a prescription' });
    }

    appointment.prescription = { notes, medicines };
    appointment.status = 'completed'; // Auto complete when prescription is issued
    await appointment.save();

    // Create Notification
    await new Notification({
      recipientId: appointment.ownerId,
      title: 'Digital Prescription Received',
      message: `Dr. has issued a digital prescription for your pet's appointment.`,
      type: 'booking',
    }).save();

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadReport = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.files || !(req.files as any).report) {
      return res.status(400).json({ success: false, message: 'Please attach a file under name: "report"' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const file = (req.files as any).report;
    const reportUrl = await uploadBlob(file.data, file.name, file.mimetype);

    appointment.medicalReports.push({
      name: file.name,
      url: reportUrl,
      uploadedAt: new Date(),
    });
    await appointment.save();

    res.status(200).json({
      success: true,
      medicalReports: appointment.medicalReports,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
