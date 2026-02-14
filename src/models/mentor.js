import mongoose from "mongoose";

const { Schema, model } = mongoose;

const mentorSchema = new Schema(
    {
        // Section 1: About You
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        isBlock: {
            type: Boolean,
            default: false,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        phone: {
            type: String,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
        },
        location: {
            type: String,
            trim: true,
        },
        motivationStatement: {
            type: String,
            required: [true, "Motivation statement is required"],
        },



        // Free Trial Tracking (Multiple)
        freeTrial: {
            totalAllowed: {
                type: Number,
                default: 1, // change to 2, 3 if needed
                min: 0
            },
            usedCount: {
                type: Number,
                default: 0,
                min: 0
            },
            trials: [
                {
                    mentorId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Mentor",
                        required: true
                    },
                    bookedDate: {
                        type: Date,
                        required: true
                    },
                    timeSlot: {
                        type: String,
                        required: true
                    },
                    status: {
                        type: String,
                        enum: ["booked", "completed", "cancelled", "expired"],
                        default: "booked"
                    }
                }
            ]
        },


        // Section 2: Profile
        areasOfInterest: {
            type: String,
            required: [true, "Areas of interest are required"],
        },
        mentoringStyle: {
            type: String,
            enum: ["One-on-One", "Group Sessions", "Online", "In-Person", "Any"],
        },
        mentoringFrequency: {
            type: String,
            enum: ["Weekly", "Bi-Weekly", "Monthly", "Any"],
        },
        availability: [
            {
                day: {
                    type: String,
                    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    required: true
                },
                slots: [
                    {
                        startTime: {
                            type: String,
                            required: true
                        },
                        endTime: {
                            type: String,
                            required: true
                        },
                        isBooked: {
                            type: Boolean,
                            default: false
                        }
                    }
                ]
            }
        ],


        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        accountCreated: {
            type: Boolean,
            default: false
        },

        // Password reset fields
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        tempPassword: String,


        mentorCategory: {
            type: String,
            enum: [
                "Engineering Mentors",
                "Top Mentors",
                "Startup Mentors",
                "Product Mentors",
                "Marketing Mentors",
                "Leadership Mentors",
                "Career Mentors",
                "AI Mentors"
            ],
            default: "Engineering Mentors",
            trim: true,
        },

        timeSlots: {
            type: String,
            enum: ["Mornings", "Afternoons", "Evenings", "Weekends", ""],
        },
        linkedinUrl: {
            type: String,
            trim: true,
        },
        instagramUrl: {
            type: String,
            trim: true,
        },

        hourlyRate: {
            type: Number,
            default: 1500,
            min: 0
        },
        languages: {
            type: [String],
            default: ["English"]
        },
        alternativeEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },

        // Section 3: Education
        highestDegree: {
            type: String,
            required: [true, "Highest degree is required"],
            trim: true,
        },
        fieldOfStudy: {
            type: String,
            trim: true,
        },
        schoolName: {
            type: String,
            trim: true,
        },
        additionalCourses: {
            type: String,
        },

        // Section 4: Experience
        currentRole: {
            type: String,
            required: [true, "Current role is required"],
            trim: true,
        },
        companyName: {
            type: String,
            trim: true,
        },
        yearsOfExperience: {
            type: Number,
            min: 0,
            default: 0
        },
        currentSkills: {
            type: String,
        },
        resumeLink: {
            type: String,
            trim: true,
        },
        introVideoLink: {
            type: String,
            trim: true,
        },
        whyMentor: {
            type: String,
        },
        greatestAchievement: {
            type: String,
        },
        featuredArticle: {
            type: String,
            trim: true,
        },

        // Terms & Status
        agreeToTerms: {
            type: Boolean,
            required: [true, "Must agree to terms"],
        },
        consentToShare: {
            type: Boolean,
            required: [true, "Must consent to share profile"],
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "onhold", "under_review"],
            default: "pending",
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Index for faster queries
mentorSchema.index({ email: 1, status: 1 });

// Optional: pre-save to adjust timestamps like your Otp schema
mentorSchema.pre("save", async function () {
    const ISTOffset = 5.5 * 60 * 60 * 1000;
    this.createdAt = new Date(Date.now() + ISTOffset);
    this.updatedAt = new Date(Date.now() + ISTOffset);
});

const Mentors = model("Mentors", mentorSchema);

export default Mentors;
