import MentorSupportTicket from "../../models/MentorSupportTicket.js";
import emailService from "../../helper/emailService.js";

class MentorSupportController {

    // 🔹 Create a new mentor support ticket
    static async createMentorSupportTicket(req, res) {
        try {
            const { mentorId, subject, category, priority, description } = req.body;

            if (!mentorId || !subject || !category || !priority || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required',
                });
            }

            const ticket = new MentorSupportTicket({
                mentorId,
                subject,
                category,
                priority,
                description,
                status: 'pending',
            });

            await ticket.save();


            // Send ticket creation email to mentor
            try {
                const mentor = await Mentor.findById(mentorId);
                if (mentor && mentor.email) {
                    await emailService.sendMentorTicketCreationEmail({
                        fullName: mentor.name || mentor.fullName || 'Mentor',
                        email: mentor.email,
                        ticketId: ticket._id,
                        subject: ticket.subject,
                        category: ticket.category,
                        priority: ticket.priority,
                        status: ticket.status
                    });
                    console.log('Mentor ticket creation email sent successfully');
                }
            } catch (emailError) {
                console.error('Failed to send mentor ticket creation email:', emailError);
                // Continue execution even if email fails
            }


            return res.status(201).json({
                success: true,
                message: 'Support ticket created successfully',
                data: ticket,
            });

        } catch (error) {
            console.error('Error creating mentor support ticket:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create support ticket',
                error: error.message,
            });
        }
    }

    // 🔹 Get all tickets for a specific mentor
    static async getMentorSupportTickets(req, res) {
        try {
            const { mentorId } = req.params;

            const tickets = await MentorSupportTicket.find({ mentorId })
                .sort({ createdAt: -1 })
                .populate('respondedBy', 'name email');

            return res.status(200).json({
                success: true,
                count: tickets.length,
                tickets,
            });

        } catch (error) {
            console.error('Error fetching mentor support tickets:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch support tickets',
                error: error.message,
            });
        }
    }

    // 🔹 Get single ticket by ID
    static async getMentorSupportTicketById(req, res) {
        try {
            const { ticketId } = req.params;

            const ticket = await MentorSupportTicket.findById(ticketId)
                .populate('mentorId', 'name email')
                .populate('respondedBy', 'name email');

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found',
                });
            }

            return res.status(200).json({
                success: true,
                data: ticket,
            });

        } catch (error) {
            console.error('Error fetching mentor support ticket:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch ticket',
                error: error.message,
            });
        }
    }

    // 🔹 Update a ticket (mentor/admin)
    // static async updateMentorSupportTicket(req, res) {
    //     try {
    //         const { ticketId } = req.params;
    //         const updates = req.body;

    //         const ticket = await MentorSupportTicket.findById(ticketId);

    //         if (!ticket) {
    //             return res.status(404).json({
    //                 success: false,
    //                 message: 'Ticket not found',
    //             });
    //         }

    //         Object.keys(updates).forEach(key => {
    //             ticket[key] = updates[key];
    //         });

    //         await ticket.save();

    //         return res.status(200).json({
    //             success: true,
    //             message: 'Ticket updated successfully',
    //             data: ticket,
    //         });

    //     } catch (error) {
    //         console.error('Error updating mentor support ticket:', error);
    //         return res.status(500).json({
    //             success: false,
    //             message: 'Failed to update ticket',
    //             error: error.message,
    //         });
    //     }
    // }



    static async updateMentorSupportTicket(req, res) {
        try {
            const { ticketId } = req.params;
            const updates = req.body;

            const ticket = await MentorSupportTicket.findById(ticketId);

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found',
                });
            }

            // Track if status is being changed
            const statusChanged = updates.status && updates.status !== ticket.status;
            const oldStatus = ticket.status;

            Object.keys(updates).forEach(key => {
                ticket[key] = updates[key];
            });

            await ticket.save();

            // Send email if status changed
            if (statusChanged) {
                try {
                    const mentor = await Mentor.findById(ticket.mentorId);
                    if (mentor && mentor.email) {
                        await EmailService.sendMentorTicketStatusUpdateEmail({
                            fullName: mentor.name || mentor.fullName || 'Mentor',
                            email: mentor.email,
                            ticketId: ticket._id,
                            subject: ticket.subject,
                            oldStatus: oldStatus,
                            newStatus: ticket.status
                        });
                        console.log('Mentor ticket status update email sent successfully');
                    }
                } catch (emailError) {
                    console.error('Failed to send mentor ticket status update email:', emailError);
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Ticket updated successfully',
                data: ticket,
            });

        } catch (error) {
            console.error('Error updating mentor support ticket:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update ticket',
                error: error.message,
            });
        }
    }


    // 🔹 Admin: Get all mentor tickets
    static async getAllMentorSupportTickets(req, res) {
        try {
            const { status, priority, page = 1, limit = 20 } = req.query;

            const filter = {};
            if (status) filter.status = status;
            if (priority) filter.priority = priority;

            const tickets = await MentorSupportTicket.find(filter)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('mentorId', 'name email')
                .populate('respondedBy', 'name email');

            const count = await MentorSupportTicket.countDocuments(filter);

            return res.status(200).json({
                success: true,
                totalTickets: count,
                totalPages: Math.ceil(count / limit),
                currentPage: Number(page),
                tickets,
            });

        } catch (error) {
            console.error('Error fetching all mentor support tickets:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch tickets',
                error: error.message,
            });
        }
    }




    static async respondToMentorTicket(req, res) {
        try {
            const { ticketId } = req.params;
            const { response, respondedBy } = req.body;

            const ticket = await MentorSupportTicket.findById(ticketId)
                .populate('mentorId', 'name email fullName');

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found',
                });
            }

            ticket.response = response;
            ticket.respondedBy = respondedBy;
            ticket.respondedAt = new Date();
            ticket.status = 'in_progress';

            await ticket.save();

            // Send response email to mentor
            try {
                if (ticket.mentorId && ticket.mentorId.email) {
                    await EmailService.sendMentorTicketResponseEmail({
                        fullName: ticket.mentorId.name || ticket.mentorId.fullName || 'Mentor',
                        email: ticket.mentorId.email,
                        ticketId: ticket._id,
                        subject: ticket.subject,
                        status: ticket.status,
                        response: response,
                        respondedBy: respondedBy
                    });
                    console.log('Mentor ticket response email sent successfully');
                }
            } catch (emailError) {
                console.error('Failed to send mentor ticket response email:', emailError);
                // Continue execution even if email fails
            }

            return res.status(200).json({
                success: true,
                message: 'Response added successfully',
                data: ticket,
            });

        } catch (error) {
            console.error('Error responding to mentor ticket:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to respond to ticket',
                error: error.message,
            });
        }
    }
}
export default MentorSupportController;
