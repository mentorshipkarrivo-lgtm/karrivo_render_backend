import express from 'express';
import MentorSupportController from '../../controllers/mentorprofiles/mentorSupportController.js';

const router = express.Router();

// =====================
// Mentor Routes
// =====================

router.post(
    '/create-ticket',
    MentorSupportController.createMentorSupportTicket
);

router.get(
    '/get-tickets/:mentorId',
    MentorSupportController.getMentorSupportTickets
);

router.get(
    '/get-ticket/:ticketId',
    MentorSupportController.getMentorSupportTicketById
);

router.patch(
    '/update-ticket/:ticketId',
    MentorSupportController.updateMentorSupportTicket
);

// =====================
// Admin Routes
// =====================

router.get(
    '/admin/all-tickets',
    MentorSupportController.getAllMentorSupportTickets
);

router.post(
    '/admin/respond/:ticketId',
    MentorSupportController.respondToMentorTicket
);

export default router;
