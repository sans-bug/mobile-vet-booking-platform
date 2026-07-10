"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadReport = exports.addPrescription = exports.updateBookingStatus = exports.getBookings = exports.confirmPayment = exports.createBooking = exports.getVeterinarians = void 0;
const appointment_model_1 = require("../models/appointment.model");
const veterinarian_model_1 = require("../models/veterinarian.model");
const pet_model_1 = require("../models/pet.model");
const stripe_1 = require("../config/stripe");
const azure_1 = require("../config/azure");
const notification_model_1 = require("../models/notification.model");
const getVeterinarians = async (req, res) => {
    try {
        const { specialization, service, isVerified } = req.query;
        const filter = {};
        if (isVerified) {
            filter.verificationStatus = isVerified;
        }
        else {
            // By default, only show approved vets to non-admins
            filter.verificationStatus = 'approved';
        }
        if (specialization) {
            filter.specialization = new RegExp(specialization, 'i');
        }
        if (service) {
            filter.services = { $in: [service] };
        }
        // Populate user profile info (name, email, phone, avatarUrl)
        const vets = await veterinarian_model_1.Veterinarian.find(filter).populate('userId', 'name email phone avatarUrl');
        res.status(200).json({
            success: true,
            veterinarians: vets,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVeterinarians = getVeterinarians;
const createBooking = async (req, res) => {
    try {
        const { vetId, petId, service, date, timeSlot, visitType, reason } = req.body;
        const ownerId = req.user._id;
        // Validate Vet
        const vet = await veterinarian_model_1.Veterinarian.findById(vetId).populate('userId');
        if (!vet) {
            return res.status(404).json({ success: false, message: 'Veterinarian profile not found' });
        }
        // Validate Pet
        const pet = await pet_model_1.Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }
        // Validate scheduling conflict (duplicate timeSlot, date, and vet)
        const existingBooking = await appointment_model_1.Appointment.findOne({
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
        const payment = await (0, stripe_1.createPaymentIntent)(vet.consultingFee, 'usd');
        const appointment = new appointment_model_1.Appointment({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createBooking = createBooking;
const confirmPayment = async (req, res) => {
    try {
        const { appointmentId, paymentIntentId } = req.body;
        const appointment = await appointment_model_1.Appointment.findById(appointmentId).populate('vetId');
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
        const doctorUser = appointment.vetId.userId;
        await new notification_model_1.Notification({
            recipientId: req.user._id,
            title: 'Booking Confirmed!',
            message: `Your booking for ${appointment.service} on ${appointment.date.toDateString()} has been scheduled successfully.`,
            type: 'booking',
        }).save();
        await new notification_model_1.Notification({
            recipientId: doctorUser,
            title: 'New Confirmed Appointment',
            message: `A client has paid and confirmed a booking for ${appointment.service} on ${appointment.date.toDateString()}.`,
            type: 'booking',
        }).save();
        res.status(200).json({
            success: true,
            appointment,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.confirmPayment = confirmPayment;
const getBookings = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'pet_owner') {
            filter.ownerId = req.user._id;
        }
        else if (req.user.role === 'veterinarian') {
            const vet = await veterinarian_model_1.Veterinarian.findOne({ userId: req.user._id });
            if (!vet) {
                return res.status(404).json({ success: false, message: 'Veterinarian profile not found' });
            }
            filter.vetId = vet._id;
        }
        const bookings = await appointment_model_1.Appointment.find(filter)
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getBookings = getBookings;
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body; // confirmed, completed, cancelled
        const appointment = await appointment_model_1.Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        const vetProfile = await veterinarian_model_1.Veterinarian.findOne({ userId: req.user._id });
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
            ? (vetProfile ? req.user._id : appointment.vetId.userId)
            : appointment.ownerId;
        await new notification_model_1.Notification({
            recipientId: alertId,
            title: `Booking Status Update`,
            message: `Your booking for ${appointment.service} on ${appointment.date.toDateString()} is now ${status}.`,
            type: 'booking',
        }).save();
        res.status(200).json({
            success: true,
            appointment,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateBookingStatus = updateBookingStatus;
const addPrescription = async (req, res) => {
    try {
        const { notes, medicines } = req.body; // { name, dosage, frequency, duration }
        const appointment = await appointment_model_1.Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        // Only vet can update prescription
        const vetProfile = await veterinarian_model_1.Veterinarian.findOne({ userId: req.user._id });
        if (!vetProfile || appointment.vetId.toString() !== vetProfile._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the assigned veterinarian can write a prescription' });
        }
        appointment.prescription = { notes, medicines };
        appointment.status = 'completed'; // Auto complete when prescription is issued
        await appointment.save();
        // Create Notification
        await new notification_model_1.Notification({
            recipientId: appointment.ownerId,
            title: 'Digital Prescription Received',
            message: `Dr. has issued a digital prescription for your pet's appointment.`,
            type: 'booking',
        }).save();
        res.status(200).json({
            success: true,
            appointment,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addPrescription = addPrescription;
const uploadReport = async (req, res) => {
    try {
        if (!req.files || !req.files.report) {
            return res.status(400).json({ success: false, message: 'Please attach a file under name: "report"' });
        }
        const appointment = await appointment_model_1.Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        const file = req.files.report;
        const reportUrl = await (0, azure_1.uploadBlob)(file.data, file.name, file.mimetype);
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.uploadReport = uploadReport;
