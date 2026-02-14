// sessionBookingRoutes.js - Backend Routes for Session Bookings

import express from 'express';
import SessionBookingController from '../../controllers/mentorprofiles/SessionBookingController.js';
const router = express.Router();

// Get all session bookings (with pagination and search)
// Full URL: GET /api/Admin/get-session-bookings
router.get(
  '/get-session-bookings',
  SessionBookingController.getSessionBookings
);

// Get single session booking by ID
// Full URL: GET /api/Admin/view-session-booking/:bookingId
router.get(
  '/view-session-booking/:bookingId',
  SessionBookingController.getSessionBookingById
);

// Update session booking
// Full URL: PUT /api/Admin/update-session-booking/:bookingId
router.put(
  '/update-session-booking/:bookingId',
  SessionBookingController.updateSessionBooking
);

// Update session status
// Full URL: POST /api/Admin/update-session-status
router.post(
  '/update-session-status',
  SessionBookingController.updateSessionStatus
);

// Update payment status
// Full URL: POST /api/Admin/update-payment-status
router.post(
  '/update-payment-status',
  SessionBookingController.updatePaymentStatus
);

// Delete session booking
// Full URL: DELETE /api/Admin/delete-session-booking/:bookingId
router.delete(
  '/delete-session-booking/:bookingId',
  SessionBookingController.deleteSessionBooking
);

// Get booking statistics
// Full URL: GET /api/Admin/booking-stats
router.get(
  '/booking-stats',
  SessionBookingController.getBookingStats
);

export default router;
