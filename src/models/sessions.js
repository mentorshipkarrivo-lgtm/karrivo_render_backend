


// models/sessions.js - Updated version
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sessionBookingSchema = new Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  email: {
    type: String,
    trim: true,
    lowercase: true
  },

  menteeName: {
    type: String,
    trim: true
  },

  phone: {
    type: String,
    trim: true
  },

  // Mentor Information
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentee',
    required: true,
    index: true
  },

  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  menteeEmail: {
    type: String,
    trim: true,
    lowercase: true
  },

  // Session Details
  topic: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  sessionDate: {
    type: Date,
    required: true,
    index: true
  },

  startTime: {
    type: String,
    required: true
  },

  endTime: {
    type: String,
    required: true
  },

  durationMinutes: {
    type: Number,
    required: true,
    enum: [30, 60, 90]
  },

  sessionType: {
    type: String,
    enum: ['One-on-One', 'Group Session'],
    default: 'video'
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
    index: true
  },

  // FREE SESSION TRACKING
  isFreeSession: {
    type: Boolean,
    default: false,
    index: true
  },

  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded', 'failed'],
    default: 'unpaid',
  },

  price: {
    type: Number,
    required: true
  },

  currency: {
    type: String,
    default: 'INR'
  },

  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet', 'free'],
    default: 'upi'
  },

  transactionId: {
    type: String,
    trim: true
  },

  phoneNumber: {
    type: String,
    trim: true
  },

  amountPaid: {
    type: Number
  },

  paymentDate: {
    type: Date
  },

  // Zoom Meeting Integration
  zoomMeetingId: {
    type: String,
    sparse: true
  },

  meetingLink: {
    type: String,
    trim: true
  },

  zoomMeeting: {
    meetingId: {
      type: String
    },
    joinUrl: {
      type: String
    },
    startUrl: {
      type: String
    },
    password: {
      type: String
    },
    topic: {
      type: String
    }
  },

  // Additional Fields
  guests: {
    type: Number,
    default: 1,
    min: 1
  },

  cancellationReason: {
    type: String,
    trim: true
  },

  confirmedAt: {
    type: Date
  },

  completedAt: {
    type: Date
  },

  cancelledAt: {
    type: Date
  },

  createdBy: {
    type: String,
    enum: ['mentee', 'mentor', 'admin'],
    default: 'mentee'
  },

  // Notes and Feedback
  mentorNotes: {
    type: String,
    trim: true
  },

  menteeNotes: {
    type: String,
    trim: true
  },

  feedbackRating: {
    type: Number,
    min: 1,
    max: 5
  },

  feedbackComment: {
    type: String,
    trim: true
  }

}, {
  timestamps: true
});

// Indexes for better query performance
sessionBookingSchema.index({ userId: 1, sessionDate: -1 });
sessionBookingSchema.index({ mentorId: 1, sessionDate: -1 });
sessionBookingSchema.index({ status: 1, sessionDate: 1 });
sessionBookingSchema.index({ paymentStatus: 1 });
sessionBookingSchema.index({ zoomMeetingId: 1 });
sessionBookingSchema.index({ createdAt: -1 });
sessionBookingSchema.index({ isFreeSession: 1, userId: 1 });

// Virtual for checking if session is upcoming
sessionBookingSchema.virtual('isUpcoming').get(function () {
  return new Date() < this.sessionDate && this.status === 'confirmed';
});

// Virtual for checking if session is past
sessionBookingSchema.virtual('isPast').get(function () {
  return new Date() > this.sessionDate;
});

// Method to check if session can be cancelled
sessionBookingSchema.methods.canBeCancelled = function () {
  const hoursUntilSession = (this.sessionDate - new Date()) / (1000 * 60 * 60);
  return this.status === 'confirmed' && hoursUntilSession > 24;
};

// Method to format session date and time
sessionBookingSchema.methods.getFormattedDateTime = function () {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const dateStr = this.sessionDate.toLocaleDateString('en-US', options);
  return `${dateStr} at ${this.startTime}`;
};

// Pre-save middleware
sessionBookingSchema.pre('save', async function () {
  // Auto-set confirmed date when status changes to confirmed
  if (this.isModified('status') && this.status === 'confirmed' && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }

  // Auto-set completed date when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }

  // Auto-set cancelled date when status changes to cancelled
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
});

const SessionBooking = model('SessionBooking', sessionBookingSchema);

export default SessionBooking;



