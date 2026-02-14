import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    unique: true,
    required: true
  },

  // Personal Details (About Section)
  fullName: String,
  email: String,
  phone: String,

  country: String,
  city: String,
  state: String,
  linkedinUrl: String,

  // Experience Details
  role: String,
  domain: String,
  yearsOfExperience: Number,
  currentCompany: String,
  previousCompanies: [String],
  skills: [String],
  about: String,
  availability: String,
  timezone: String,
    profilePhotoUrl: String,


  // Education Details
  highestEducation: String,
  schoolCollegeName: String,

  // Goals & Expectations
  goals: String,
  targetDomains: [String],
  targetCompanies: [String],
  prepTimeline: String,
  expectations: String,

  // Resume
  resumeUrl: String,

  // Profile Status
  profileCompleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export default mongoose.model("UserProfile", userProfileSchema);