
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const supportTicketSchema = new Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true,
        default: () => `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    },
    username: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    category: {
        type: String,
        required: true,
        enum: ['Technical Issue', 'Account Related', 'Billing', 'Mentorship', 'Feature Request', 'Other']
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'in_progress', 'resolved', 'closed'],
        default: 'pending'
    },
    response: {
        type: String,
        default: null
    },
    respondedBy: {
        type: String,
        default: null
    },
    respondedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
supportTicketSchema.index({ username: 1, status: 1 });
// supportTicketSchema.index({ ticketId: 1 });

const SupportTicket = model('SupportTicket', supportTicketSchema);

export default SupportTicket;