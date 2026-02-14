import { Router } from "express";

import TicketController from "../controllers/ticketsController.js"

let router = Router();

// Get all tickets for a user
router.get('/get-tickets/:userId', TicketController.getSupportTickets);
router.get('/get-all-tickets', TicketController.getAllSupportTickets);

    
// Create a new ticket
router.post('/create-ticket', TicketController.createSupportTicket);

// Get single ticket by ID
router.get('/get-ticket/:ticketId', TicketController.getSupportTicketById);

// Update ticket (for admin responses)
router.patch('/update-ticket/:ticketId', TicketController.updateSupportTicket);

export default router;