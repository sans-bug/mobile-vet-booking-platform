import { Response } from 'express';
import { Appointment } from '../models/appointment.model';
import { User } from '../models/user.model';
import { Veterinarian } from '../models/veterinarian.model';
import { Pet } from '../models/pet.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAdminAnalytics = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // 1. Core counters
    const usersCount = await User.countDocuments();
    const petOwnersCount = await User.countDocuments({ role: 'pet_owner' });
    const vetsCount = await User.countDocuments({ role: 'veterinarian' });
    const petsCount = await Pet.countDocuments();
    const bookingsCount = await Appointment.countDocuments();
    
    // 2. Earnings summation
    const totalPayments = await Appointment.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$consultingFee' } } },
    ]);
    const revenue = totalPayments.length > 0 ? totalPayments[0].total : 0;

    // 3. Monthly Revenue Trend (for the last 6 months)
    const monthlyRevenue = await Appointment.aggregate([
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
    const petSpecies = await Pet.aggregate([
      { $group: { _id: '$species', count: { $sum: 1 } } },
    ]);

    // 5. Booking service categorization
    const servicesCount = await Appointment.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
    ]);

    // 6. Active emergency SOS counts
    const activeSOS = await Appointment.countDocuments({ service: 'Emergency Visit', status: { $in: ['pending', 'confirmed'] } });

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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVetAnalytics = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const vetProfile = await Veterinarian.findOne({ userId: req.user._id });
    if (!vetProfile) {
      return res.status(404).json({ success: false, message: 'Veterinarian profile not found.' });
    }

    const vetId = vetProfile._id;

    // 1. Total Completed Bookings
    const completedCount = await Appointment.countDocuments({ vetId, status: 'completed' });

    // 2. Total Confirmed/Pending Bookings
    const upcomingCount = await Appointment.countDocuments({
      vetId,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    // 3. Earnings summation
    const totalPayments = await Appointment.aggregate([
      { $match: { vetId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$consultingFee' } } },
    ]);
    const earnings = totalPayments.length > 0 ? totalPayments[0].total : 0;

    // 4. Monthly earnings profile
    const monthlyEarnings = await Appointment.aggregate([
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
    const statusDistribution = await Appointment.aggregate([
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
