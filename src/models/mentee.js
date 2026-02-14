import mongoose from "mongoose";


const { Schema, model } = mongoose;

const menteeSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ===== BASIC DETAILS =====
    name: String,
    username: String,
    email: {
      type: String,
      lowercase: true,
      index: true,
    },
    phone: String,
    countryCode: String,

    // ===== AUTH STATUS =====
    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    // ===== PROFILE DETAILS =====
    profileImage: String,
    bio: String,
    gender: String,
    dateOfBirth: Date,

    // ===== ADDRESS =====
    address: {
      country: String,
      state: String,
      city: String,
      pincode: String,
      fullAddress: String,
    },

    // ===== EDUCATION / CAREER =====
    education: {
      qualification: String,
      college: String,
      specialization: String,
      yearOfCompletion: Number,
    },

    profession: String,
    company: String,
    experience: String,

    // ===== SOCIAL LINKS =====
    socialLinks: {
      linkedin: String,
      github: String,
      website: String,
    },

    // ===== APP DATA =====
    role: {
      type: String,
      default: "mentee",
    },

    registeredDate: Date,
    lastLogin: Date,

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    // ===== SYSTEM FLAGS =====
    isDeleted: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Mentees = model("Mentees", menteeSchema);

export default Mentees
