"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Publicly fetch doctors list (filtering, specialization)
router.get('/vets', auth_middleware_1.protect, booking_controller_1.getVeterinarians);
router.use(auth_middleware_1.protect); // Secure remaining endpoints
router.route('/')
    .post(booking_controller_1.createBooking)
    .get(booking_controller_1.getBookings);
router.post('/confirm-payment', booking_controller_1.confirmPayment);
router.put('/:id/status', booking_controller_1.updateBookingStatus);
router.put('/:id/prescription', booking_controller_1.addPrescription);
router.post('/:id/report', booking_controller_1.uploadReport);
exports.default = router;
