import { Router } from 'express';
import { getVeterinarians, createBooking, confirmPayment, getBookings, updateBookingStatus, addPrescription, uploadReport } from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Publicly fetch doctors list (filtering, specialization)
router.get('/vets', protect, getVeterinarians);

router.use(protect); // Secure remaining endpoints

router.route('/')
  .post(createBooking)
  .get(getBookings);

router.post('/confirm-payment', confirmPayment);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/prescription', addPrescription);
router.post('/:id/report', uploadReport);

export default router;
