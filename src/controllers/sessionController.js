
import SessionBooking from "../models/sessions.js"


class SessionController {
    // Create a new SessionBooking booking
    static async createSession(req, res) {
        try {
            const { mentorId, menteeId, topic, description, sessionDate, startTime, endTime, price } = req.body;

            // Validation
            if (!mentorId || !menteeId || !topic || !sessionDate || !startTime || !endTime || !price) {
                return res.status(400).json({
                    success: false,
                    message: "All required fields must be provided"
                });
            }

            // Create new SessionBooking
            const newSession = new SessionBooking({
                mentorId,
                menteeId,
                topic,
                description,
                sessionDate,
                startTime,
                endTime,
                price,
                status: "pending" // Default status
            });

            await newSession.save();

            return res.status(201).json({
                success: true,
                message: "SessionBooking booked successfully",
                data: newSession
            });
        } catch (error) {
            console.error("Error creating SessionBooking:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to create SessionBooking",
                error: error.message
            });
        }
    }

    // Get all sessions for a mentor
    static async getMentorSessions(req, res) {
        try {
            const { mentorId } = req.params;

            console.log(mentorId, "mentorId")

            if (!mentorId) {
                return res.status(400).json({
                    success: false,
                    message: "Mentor ID is required"
                });
            }

            const sessions = await SessionBooking.find({ mentorId })
                .populate("menteeId", "name email") // Populate mentee details
                .sort({ sessionDate: -1, startTime: -1 }); // Sort by date, newest first

            return res.status(200).json({
                success: true,
                data: sessions,
                count: sessions.length
            });
        } catch (error) {
            console.error("Error fetching mentor sessions:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch sessions",
                error: error.message
            });
        }
    }

    // Get all sessions for a mentee
    static async getMenteeSessions(req, res) {
        try {
            const { menteeId } = req.params;

            if (!menteeId) {
                return res.status(400).json({
                    success: false,
                    message: "Mentee ID is required"
                });
            }

            const sessions = await SessionBooking.find({ menteeId })
                .populate("mentorId", "name email expertise") // Populate mentor details
                .sort({ sessionDate: -1, startTime: -1 }); // Sort by date, newest first

            return res.status(200).json({
                success: true,
                data: sessions,
                count: sessions.length
            });
        } catch (error) {
            console.error("Error fetching mentee sessions:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch sessions",
                error: error.message
            });
        }
    }

    // Update SessionBooking status (accept, reject, cancel, complete)
    static async updateSessionStatus(req, res) {
        try {
            const { sessionId } = req.params;
            const { status } = req.body;

            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    message: "SessionBooking ID is required"
                });
            }

            const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
            if (!status || !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Status must be one of: ${validStatuses.join(", ")}`
                });
            }

            const SessionBooking = await SessionBooking.findById(sessionId);

            if (!SessionBooking) {
                return res.status(404).json({
                    success: false,
                    message: "SessionBooking not found"
                });
            }

            SessionBooking.status = status;
            await SessionBooking.save();

            return res.status(200).json({
                success: true,
                message: "SessionBooking status updated successfully",
                data: SessionBooking
            });
        } catch (error) {
            console.error("Error updating SessionBooking status:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update SessionBooking status",
                error: error.message
            });
        }
    }

    // Optional: Get a single SessionBooking by ID
    static async getSessionById(req, res) {
        try {
            const { sessionId } = req.params;

            const SessionBooking = await SessionBooking.findById(sessionId)
                .populate("mentorId", "name email expertise")
                .populate("menteeId", "name email");

            if (!SessionBooking) {
                return res.status(404).json({
                    success: false,
                    message: "SessionBooking not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: SessionBooking
            });
        } catch (error) {
            console.error("Error fetching SessionBooking:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch SessionBooking",
                error: error.message
            });
        }
    }

    // Optional: Delete a SessionBooking
    static async deleteSession(req, res) {
        try {
            const { sessionId } = req.params;

            const SessionBooking = await SessionBooking.findByIdDelete(sessionId);

            if (!SessionBooking) {
                return res.status(404).json({
                    success: false,
                    message: "SessionBooking not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "SessionBooking deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting SessionBooking:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to delete SessionBooking",
                error: error.message
            });
        }
    }
}

export default SessionController;




