import mongoose from "mongoose";

const { Schema, model } = mongoose;

const mentorSupportTicketSchema = new Schema(
    {
        ticketId: {
            type: String,
            required: true,
            unique: true,
            default: () =>
                `MNTR-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase()}`
        },

        mentorId: {
            type: Schema.Types.ObjectId,
            ref: "Mentor",
            required: true,
            index: true
        },

        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Technical Issue",
                "Session Management",
                "Mentee Related",
                "Payment/Billing",
                "Account Settings",
                "Platform Features",
                "Other"
            ]
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        status: {
            type: String,
            enum: ["pending", "in_progress", "resolved", "closed"],
            default: "pending"
        },

        response: {
            type: String,
            default: null
        },

        respondedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        respondedAt: {
            type: Date,
            default: null
        },

        userRemarks: {
            type: String,
            default: null
        },

        feedbackAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

// ✅ compound index only (NO duplicate ticketId index)
mentorSupportTicketSchema.index({ mentorId: 1, status: 1 });

const MentorSupportTicket = model(
    "MentorSupportTicket",
    mentorSupportTicketSchema
);

export default MentorSupportTicket;
