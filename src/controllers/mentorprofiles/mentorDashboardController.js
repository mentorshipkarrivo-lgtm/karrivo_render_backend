import User from "../../models/users.js";
import SessionBooking from "../../models/sessions.js";

class getMentorDetailsController {




    static async getUserDetails(req, res) {
        try {
            const { mentorId } = req.params;

            console.log('🔍 Fetching user details for mentorId:', mentorId);

            // Validate mentorId
            if (!mentorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mentor ID is required'
                });
            }

            // Find user by mentorId
            const user = await User.findById(mentorId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }


            console.log(user, 'users');

            return res.status(200).json({
                success: true,
                data: user
            });

        } catch (error) {
            console.error('❌ Error fetching user details:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error while fetching user details',
                error: error.message
            });
        }
    };




    static async getMentorSessionBookings(req, res) {
        try {
            const { mentorId } = req.params;

            console.log(mentorId, 'mentorId');

            if (!mentorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mentor ID is required'
                });
            }

            const sessionBookings = await SessionBooking.find({ mentorId })
                .sort({ createdAt: -1 })

            if (!sessionBookings || sessionBookings.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No session bookings found for this mentor'
                });
            }

            console.log(`Found ${sessionBookings.length} session bookings`);

            return res.status(200).json({
                success: true,
                count: sessionBookings.length,
                data: sessionBookings
            });

        } catch (error) {
            console.error(' Error fetching mentor session bookings:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error while fetching session bookings',
                error: error.message
            });
        }
    }

}


export default getMentorDetailsController;