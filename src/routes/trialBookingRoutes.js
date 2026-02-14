
import express from "express";
import TrailBookingController from "../controllers/trailbookingController.js";

const router = express.Router();

// Check free session eligibility
router.post("/check-free-session", TrailBookingController.checkFreeSessionEligibility);

// Get available slots
router.get("/slots", TrailBookingController.getAvailableSlots);

// Legacy trial bookings
router.post("/free", TrailBookingController.bookFreeTrial);
router.post("/premium", TrailBookingController.bookPremiumTrial);

// My bookings
router.post("/my-bookings", TrailBookingController.myBookings);

// OTP for booking
router.post('/get_booksession_Otp', TrailBookingController.sendBookSessionOtp);

// Main booking flow
router.post("/bookings_session", TrailBookingController.BookSession);
router.post('/bookings/:bookingId/complete', TrailBookingController.CompleteBookingWithPayment);

// Cancel booking
router.post('/bookings/:bookingId/cancel', TrailBookingController.cancelBooking);

export default router;