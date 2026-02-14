import SupportTicket from '../models/tickets.js';
import User from '../models/users.js';
import emailService from '../helper/emailService.js';

class TicketController {

    // Get all tickets for a user
    static async getSupportTickets(req, res) {
        try {
            const { userId } = req.params;

            const tickets = await SupportTicket.find({ username: userId })
                .sort({ createdAt: -1 })
                .lean();

            res.status(200).json({
                success: true,
                tickets: tickets,
                count: tickets.length
            });
        } catch (error) {
            console.error('Error fetching support tickets:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch support tickets',
                error: error.message
            });
        }
    }

    // Get all support tickets (Admin)
    static async getAllSupportTickets(req, res) {
        try {
            const tickets = await SupportTicket.find({})
                .sort({ createdAt: -1 })
                .lean();

            res.status(200).json({
                success: true,
                tickets,
                count: tickets.length
            });
        } catch (error) {
            console.error('Error fetching all support tickets:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch support tickets',
                error: error.message
            });
        }
    }

    // Create a new support ticket
    static async createSupportTicket(req, res) {
        try {
            const {
                username,
                subject,
                description,
                category,
                priority,
                status
            } = req.body;


            console.log(username,"username")

            // Validate required fields
            if (!username || !subject || !description || !category || !priority) {
                return res.status(400).json({
                    success: false,
                    message: 'All required fields must be provided'
                });
            }

            // Find user by username
            const user = await User.findOne({ username });

            console.log(user, 'user1')
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Create new ticket
            const newTicket = new SupportTicket({
                username,
                userId: user._id,
                subject,
                description,
                category,
                priority,
                status: status || 'pending'
            });

            await newTicket.save();


            try {
                await emailService.sendTicketCreationEmail({
                    fullName: user.fullName || username,
                    email: user.email,
                    ticketId: newTicket.ticketId,
                    subject: newTicket.subject,
                    category: newTicket.category,
                    priority: newTicket.priority,
                    status: newTicket.status
                });
            } catch (emailError) {
                console.error('Failed to send ticket creation email:', emailError);
                // Don't fail the request if email fails
            }


            res.status(201).json({
                success: true,
                message: 'Support ticket created successfully',
                ticket: newTicket
            });
        } catch (error) {
            console.error('Error creating support ticket:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create support ticket',
                error: error.message
            });
        }
    }

    // Get a single ticket by ID
    static async getSupportTicketById(req, res) {
        try {
            const { ticketId } = req.params;

            const ticket = await SupportTicket.findOne({ ticketId }).lean();

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            res.status(200).json({
                success: true,
                ticket: ticket
            });
        } catch (error) {
            console.error('Error fetching ticket:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch ticket',
                error: error.message
            });
        }
    }

    // Update a support ticket (for admin responses)
    static async updateSupportTicket(req, res) {
        try {
            const { ticketId } = req.params;
            const updates = req.body;

            console.log('Updating ticket:', ticketId, 'with:', updates);

            // If response is being added, update respondedAt and respondedBy
            if (updates.response) {
                updates.respondedAt = new Date();

                // Get admin username from authenticated user or request body
                if (req.user?.username) {
                    updates.respondedBy = req.user.username;
                } else if (req.body.respondedBy) {
                    updates.respondedBy = req.body.respondedBy;
                } else {
                    updates.respondedBy = 'Support Team';
                }
            }

            // Update the ticket
            const updatedTicket = await SupportTicket.findOneAndUpdate(
                { ticketId },
                {
                    ...updates,
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            );

            if (!updatedTicket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            console.log('Ticket updated successfully:', updatedTicket);


            if (updates.response || updates.status) {
                try {
                    const user = await User.findOne({ username: updatedTicket.username });
                    if (user) {
                        await emailService.sendTicketUpdateEmail({
                            fullName: user.fullName || updatedTicket.username,
                            email: user.email,
                            ticketId: updatedTicket.ticketId,
                            subject: updatedTicket.subject,
                            status: updatedTicket.status,
                            response: updates.response,
                            respondedBy: updates.respondedBy
                        });
                    }
                } catch (emailError) {
                    console.error('Failed to send ticket update email:', emailError);
                    // Don't fail the request if email fails
                }
            }

            res.status(200).json({
                success: true,
                message: 'Ticket updated successfully',
                ticket: updatedTicket
            });
        } catch (error) {
            console.error('Error updating ticket:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update ticket',
                error: error.message
            });
        }
    }

    // Delete a support ticket (Admin only)
    static async deleteSupportTicket(req, res) {
        try {
            const { ticketId } = req.params;

            const deletedTicket = await SupportTicket.findOneAndDelete({ ticketId });

            if (!deletedTicket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Ticket deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting ticket:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete ticket',
                error: error.message
            });
        }
    }

    // Get ticket statistics (Admin)
    static async getTicketStats(req, res) {
        try {
            const totalTickets = await SupportTicket.countDocuments();
            const pendingTickets = await SupportTicket.countDocuments({ status: 'pending' });
            const inProgressTickets = await SupportTicket.countDocuments({ status: 'in_progress' });
            const resolvedTickets = await SupportTicket.countDocuments({ status: 'resolved' });
            const closedTickets = await SupportTicket.countDocuments({ status: 'closed' });

            // Get tickets by category
            const ticketsByCategory = await SupportTicket.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Get tickets by priority
            const ticketsByPriority = await SupportTicket.aggregate([
                {
                    $group: {
                        _id: '$priority',
                        count: { $sum: 1 }
                    }
                }
            ]);

            res.status(200).json({
                success: true,
                stats: {
                    total: totalTickets,
                    pending: pendingTickets,
                    inProgress: inProgressTickets,
                    resolved: resolvedTickets,
                    closed: closedTickets,
                    byCategory: ticketsByCategory,
                    byPriority: ticketsByPriority
                }
            });
        } catch (error) {
            console.error('Error fetching ticket stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch ticket statistics',
                error: error.message
            });
        }
    }
}

export default TicketController;