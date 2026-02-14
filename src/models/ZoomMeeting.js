// models/ZoomMeeting.js


import mongoose from "mongoose";

const { Schema, model } = mongoose;


const zoomMeetingSchema = new Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Zoom Meeting ID (returned by Zoom API)
  zoomMeetingId: {
    type: String,
    sparse: true,
  },

  // Meeting UUID (returned by Zoom API)
  uuid: {
    type: String
  },

  // Basic Meeting Info
  topic: {
    type: String,
    required: true,
    trim: true
  },

  type: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 8],
    // 1 = Instant meeting
    // 2 = Scheduled meeting
    // 3 = Recurring meeting with no fixed time
    // 8 = Recurring meeting with fixed time
    default: 2
  },

  startTime: {
    type: Date,
    required: function () {
      return this.type === 2 || this.type === 8;
    }
  },

  duration: {
    type: Number, // Duration in minutes
    required: true,
    default: 60
  },

  timezone: {
    type: String,
    default: 'UTC'
  },

  password: {
    type: String,
    default: ''
  },

  agenda: {
    type: String,
    default: ''
  },

  // Join URLs from Zoom
  joinUrl: {
    type: String
  },

  startUrl: {
    type: String
  },

  // Meeting Settings
  settings: {
    hostVideo: {
      type: Boolean,
      default: false
    },
    participantVideo: {
      type: Boolean,
      default: false
    },
    cnMeeting: {
      type: Boolean,
      default: false
    },
    inMeeting: {
      type: Boolean,
      default: false
    },
    joinBeforeHost: {
      type: Boolean,
      default: false
    },
    muteUponEntry: {
      type: Boolean,
      default: true
    },
    watermark: {
      type: Boolean,
      default: false
    },
    usePmi: {
      type: Boolean,
      default: false
    },
    approvalType: {
      type: Number,
      enum: [0, 1, 2],
      // 0 = Automatically approve
      // 1 = Manually approve
      // 2 = No registration required
      default: 2
    },
    registrationType: {
      type: Number,
      enum: [1, 2, 3],
      // 1 = Attendees register once and can attend any occurrence
      // 2 = Attendees need to register for each occurrence
      // 3 = Attendees register once and can choose occurrences to attend
      default: 1
    },
    audio: {
      type: String,
      enum: ['both', 'telephony', 'voip'],
      default: 'both'
    },
    autoRecording: {
      type: String,
      enum: ['local', 'cloud', 'none'],
      default: 'none'
    },
    waitingRoom: {
      type: Boolean,
      default: true
    },
    globalDialInNumbers: [{
      country: String,
      countryName: String,
      city: String,
      number: String,
      type: String
    }],
    contactName: {
      type: String
    },
    contactEmail: {
      type: String
    }
  },

  // Recurrence settings (for recurring meetings)
  recurrence: {
    type: {
      type: Number,
      enum: [1, 2, 3],
      // 1 = Daily
      // 2 = Weekly
      // 3 = Monthly
    },
    repeatInterval: {
      type: Number,
      min: 1,
      max: 90
    },
    weeklyDays: {
      type: String, // "1,2,3" for Sunday, Monday, Tuesday
    },
    monthlyDay: {
      type: Number,
      min: 1,
      max: 31
    },
    monthlyWeek: {
      type: Number,
      enum: [-1, 1, 2, 3, 4]
      // -1 = Last week, 1-4 = Week number
    },
    monthlyWeekDay: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7]
      // 1 = Sunday - 7 = Saturday
    },
    endTimes: {
      type: Number,
      min: 1,
      max: 50
    },
    endDateTime: {
      type: Date
    }
  },

  // Meeting Status
  status: {
    type: String,
    enum: ['waiting', 'started', 'finished', 'cancelled'],
    default: 'waiting',
    index: true
  },

  // Host Information
  hostId: {
    type: String
  },

  hostEmail: {
    type: String
  },

  // Tracking fields
  trackingFields: [{
    field: String,
    value: String
  }],

  // Response from Zoom API
  zoomResponse: {
    type: mongoose.Schema.Types.Mixed
  },

  // Meeting Occurrences (for recurring meetings)
  occurrences: [{
    occurrenceId: String,
    startTime: Date,
    duration: Number,
    status: String
  }]

}, {
  timestamps: true
});

// Indexes
zoomMeetingSchema.index({ userId: 1, startTime: -1 });
zoomMeetingSchema.index({ status: 1, startTime: 1 });
zoomMeetingSchema.index({ createdAt: -1 });

// Virtual for checking if meeting is upcoming
zoomMeetingSchema.virtual('isUpcoming').get(function () {
  if (!this.startTime) return false;
  return new Date() < this.startTime && this.status === 'waiting';
});

// Method to update status based on current time
zoomMeetingSchema.methods.updateMeetingStatus = function () {
  const now = new Date();

  if (this.status === 'cancelled') return this.status;

  if (!this.startTime) {
    this.status = 'waiting';
    return this.status;
  }

  const endTime = new Date(this.startTime.getTime() + this.duration * 60000);

  if (now < this.startTime) {
    this.status = 'waiting';
  } else if (now >= this.startTime && now <= endTime) {
    this.status = 'started';
  } else {
    this.status = 'finished';
  }

  return this.status;
};

const ZoomMeeting = model('ZoomMeeting', zoomMeetingSchema);

export default ZoomMeeting;