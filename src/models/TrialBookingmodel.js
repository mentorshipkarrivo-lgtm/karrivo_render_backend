import mongoose from "mongoose";

const trialBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },

  trialType: {
    type: String,
    enum: ["FREE", "PREMIUM"],
    required: true
  },

  date: { type: String, required: true }, // YYYY-MM-DD
  timeSlot: { type: String, required: true }, // 10:00 - 10:30

  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "NA"],
    default: "NA"
  },

  meetingLink: { type: String },

  status: {
    type: String,
    enum: ["BOOKED", "CANCELLED"],
    default: "BOOKED"
  }
}, { timestamps: true });

export default mongoose.model("TrialBooking", trialBookingSchema);
