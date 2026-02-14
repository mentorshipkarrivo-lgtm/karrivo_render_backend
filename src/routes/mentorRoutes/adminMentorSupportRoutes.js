import express from 'express';
import AdminMentorSupportController from '../../controllers/mentorprofiles/adminMentorSupportController.js';


const router = express.Router();




router.get(
    '/get-all-tickets',
    AdminMentorSupportController.getAllMentorSupportTickets
);

router.get(
    '/get-ticket/:ticketId',

    AdminMentorSupportController.getMentorSupportTicketById
);

router.patch(
    '/update-ticket/:ticketId',
    AdminMentorSupportController.updateMentorSupportTicket
);

router.post(
    '/respond/:ticketId',
    AdminMentorSupportController.respondToMentorTicket
);

router.get(
    '/statistics',
    AdminMentorSupportController.getMentorTicketStatistics
);

export default router;
