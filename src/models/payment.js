// menteePaymentSchema.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const menteePaymentSchema = new Schema({
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  menteeName: {
    type: String,
    required: true,
    trim: true,
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mentorName: {
    type: String,
    required: true,
    trim: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  transactionDate: {
    type: Date,
    required: true,
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
    required: true,
  },
  screenshotUrl: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedOn: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  currency: {
    type: String,
    default: "INR",
  },
  remarks: {
    type: String,
    default: "",
  },
});

// Middleware to adjust date to IST before saving
menteePaymentSchema.pre("save", function (next) {
  const ISTOffset = 5.5 * 60 * 60 * 1000;

  this.createdOn = new Date(Date.now() + ISTOffset);
  this.updatedOn = new Date(Date.now() + ISTOffset);
  this.transactionDate = new Date(this.transactionDate.getTime() + ISTOffset);

  next();
});

export default mongoose.model("MenteePayment", menteePaymentSchema);
