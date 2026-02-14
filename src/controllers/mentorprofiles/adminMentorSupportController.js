import MentorSupportTicket from "../../models/MentorSupportTicket.js";

class AdminMentorSupportController {

    static async getAllMentorSupportTickets(req, res) {
        try {
            const { status, priority, category, page = 1, limit = 20 } = req.query;

            const filter = {};
            if (status) filter.status = status;
            if (priority) filter.priority = priority;
            if (category) filter.category = category;

            const tickets = await MentorSupportTicket.find(filter)
                .sort({ createdAt: -1 })
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .populate('respondedBy', 'name email'); // Only populate respondedBy

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

    // =========================
    // Get single ticket by ID
    // =========================
    static async getMentorSupportTicketById(req, res) {
        try {
            const { ticketId } = req.params;

            const ticket = await MentorSupportTicket.findById(ticketId)
                .populate('respondedBy', 'name email'); // Only populate respondedBy

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

    // =========================
    // Update ticket (Admin)
    // =========================
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

            Object.keys(updates).forEach(key => {
                ticket[key] = updates[key];
            });

            await ticket.save();

            await ticket.populate('respondedBy', 'name email'); // Only populate respondedBy

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

    // =========================
    // Respond to ticket
    // =========================
    static async respondToMentorTicket(req, res) {
        try {
            const { ticketId } = req.params;
            const { response, respondedBy } = req.body;

            if (!response || !response.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Response is required',
                });
            }

            const ticket = await MentorSupportTicket.findById(ticketId);

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

            await ticket.populate('respondedBy', 'name email'); // Only populate respondedBy

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

    // =========================
    // Ticket statistics (Admin)
    // =========================
    static async getMentorTicketStatistics(req, res) {
        try {
            const [
                totalTickets,
                pendingTickets,
                inProgressTickets,
                resolvedTickets,
                closedTickets,
                urgentTickets,
                highPriorityTickets,
                categoryStats
            ] = await Promise.all([
                MentorSupportTicket.countDocuments(),
                MentorSupportTicket.countDocuments({ status: 'pending' }),
                MentorSupportTicket.countDocuments({ status: 'in_progress' }),
                MentorSupportTicket.countDocuments({ status: 'resolved' }),
                MentorSupportTicket.countDocuments({ status: 'closed' }),
                MentorSupportTicket.countDocuments({
                    priority: 'urgent',
                    status: { $in: ['pending', 'in_progress'] }
                }),
                MentorSupportTicket.countDocuments({
                    priority: 'high',
                    status: { $in: ['pending', 'in_progress'] }
                }),
                MentorSupportTicket.aggregate([
                    { $group: { _id: '$category', count: { $sum: 1 } } }
                ])
            ]);

            return res.status(200).json({
                success: true,
                statistics: {
                    total: totalTickets,
                    pending: pendingTickets,
                    inProgress: inProgressTickets,
                    resolved: resolvedTickets,
                    closed: closedTickets,
                    urgent: urgentTickets,
                    highPriority: highPriorityTickets,
                    byCategory: categoryStats
                }
            });

        } catch (error) {
            console.error('Error fetching ticket statistics:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics',
                error: error.message,
            });
        }
    }
}

export default AdminMentorSupportController;
