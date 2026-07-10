"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVetAnalytics = exports.getAdminAnalytics = void 0;
const appointment_model_1 = require("../models/appointment.model");
const user_model_1 = require("../models/user.model");
const veterinarian_model_1 = require("../models/veterinarian.model");
const pet_model_1 = require("../models/pet.model");
const getAdminAnalytics = async (req, res) => {
    try {
        // 1. Core counters
        const usersCount = await user_model_1.User.countDocuments();
        const petOwnersCount = await user_model_1.User.countDocuments({ role: 'pet_owner' });
        const vetsCount = await user_model_1.User.countDocuments({ role: 'veterinarian' });
        const petsCount = await pet_model_1.Pet.countDocuments();
        const bookingsCount = await appointment_model_1.Appointment.countDocuments();
        // 2. Earnings summation
        const totalPayments = await appointment_model_1.Appointment.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$consultingFee' } } },
        ]);
        const revenue = totalPayments.length > 0 ? totalPayments[0].total : 0;
        // 3. Monthly Revenue Trend (for the last 6 months)
        const monthlyRevenue = await appointment_model_1.Appointment.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                    },
                    revenue: { $sum: '$consultingFee' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 6 },
        ]);
        // 4. Pet species distribution
        const petSpecies = await pet_model_1.Pet.aggregate([
            { $group: { _id: '$species', count: { $sum: 1 } } },
        ]);
        // 5. Booking service categorization
        const servicesCount = await appointment_model_1.Appointment.aggregate([
            { $group: { _id: '$service', count: { $sum: 1 } } },
        ]);
        // 6. Active emergency SOS counts
        const activeSOS = await appointment_model_1.Appointment.countDocuments({ service: 'Emergency Visit', status: { $in: ['pending', 'confirmed'] } });
        res.status(200).json({
            success: true,
            summary: {
                usersCount,
                petOwnersCount,
                vetsCount,
                petsCount,
                bookingsCount,
                revenue,
                activeSOS,
            },
            charts: {
                monthlyRevenue: monthlyRevenue.map((item) => ({
                    label: `${item._id.month}/${item._id.year}`,
                    revenue: item.revenue,
                    bookings: item.count,
                })),
                petDistribution: petSpecies.map((item) => ({
                    label: item._id,
                    count: item.count,
                })),
                serviceDistribution: servicesCount.map((item) => ({
                    label: item._id,
                    count: item.count,
                })),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAdminAnalytics = getAdminAnalytics;
const getVetAnalytics = async (req, res) => {
    try {
        const vetProfile = await veterinarian_model_1.Veterinarian.findOne({ userId: req.user._id });
        if (!vetProfile) {
            return res.status(404).json({ success: false, message: 'Veterinarian profile not found.' });
        }
        const vetId = vetProfile._id;
        // 1. Total Completed Bookings
        const completedCount = await appointment_model_1.Appointment.countDocuments({ vetId, status: 'completed' });
        // 2. Total Confirmed/Pending Bookings
        const upcomingCount = await appointment_model_1.Appointment.countDocuments({
            vetId,
            status: { $in: ['pending', 'confirmed'] },
            date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        });
        // 3. Earnings summation
        const totalPayments = await appointment_model_1.Appointment.aggregate([
            { $match: { vetId, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$consultingFee' } } },
        ]);
        const earnings = totalPayments.length > 0 ? totalPayments[0].total : 0;
        // 4. Monthly earnings profile
        const monthlyEarnings = await appointment_model_1.Appointment.aggregate([
            { $match: { vetId, paymentStatus: 'paid' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                    },
                    earnings: { $sum: '$consultingFee' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 6 },
        ]);
        // 5. Booking status distribution
        const statusDistribution = await appointment_model_1.Appointment.aggregate([
            { $match: { vetId } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        res.status(200).json({
            success: true,
            summary: {
                completedCount,
                upcomingCount,
                earnings,
                rating: vetProfile.rating,
                reviewsCount: vetProfile.reviewsCount,
            },
            charts: {
                monthlyEarnings: monthlyEarnings.map((item) => ({
                    label: `${item._id.month}/${item._id.year}`,
                    earnings: item.earnings,
                })),
                statusDistribution: statusDistribution.map((item) => ({
                    label: item._id,
                    count: item.count,
                })),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getVetAnalytics = getVetAnalytics;
