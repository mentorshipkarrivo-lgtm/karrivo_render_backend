import User from '../models/users.js';
import asyncHandler from 'express-async-handler';

class MenteeController {
    /**
     * @desc Get all mentees
     * @route GET /api/users/mentees
     */
    static getMentees = asyncHandler(async (req, res) => {
        const { limit = 10, page = 1, search = '' } = req.query;

        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);
        const skip = (pageNum - 1) * limitNum;

        const filter = {
            mentorId: null,
            is_Deleted: false,
            role: 1,
        };

        if (search && search.trim() !== '') {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { country: { $regex: search, $options: 'i' } },
            ];
        }

        try {
            const total = await User.countDocuments(filter);

            const mentees = await User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .limit(limitNum)
                .skip(skip)
                .lean();

            const stats = {
                total,
                active: await User.countDocuments({ ...filter, isActive: true, isBlock: false }),
                blocked: await User.countDocuments({ ...filter, isBlock: true }),
                verified: await User.countDocuments({ ...filter, isVerified: true }),
                withoutMentor: total,
            };

            res.status(200).json({
                success: true,
                data: {
                    data: mentees,
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                    stats,
                },
                message: 'Mentees fetched successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching mentees',
                error: error.message,
            });
        }
    });

    /**
     * @desc Get single mentee by ID
     */
    static getMenteeById = asyncHandler(async (req, res) => {
        const { id } = req.params;

        try {
            const mentee = await User.findOne({
                _id: id,
                mentorId: null,
                is_Deleted: false,
                role: 1,
            })
                .select('-password')
                .lean();

            if (!mentee) {
                return res.status(404).json({
                    success: false,
                    message: 'Mentee not found or has a mentor assigned',
                });
            }

            res.status(200).json({
                success: true,
                data: mentee,
                message: 'Mentee details fetched successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching mentee details',
                error: error.message,
            });
        }
    });

    /**
     * @desc Block/Unblock mentee
     */
    static toggleBlockMentee = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { isBlock } = req.body;

        if (typeof isBlock !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isBlock must be a boolean value',
            });
        }

        try {
            const mentee = await User.findOne({
                _id: id,
                is_Deleted: false,
                role: 1,
            });

            if (!mentee) {
                return res.status(404).json({
                    success: false,
                    message: 'Mentee not found',
                });
            }

            mentee.isBlock = isBlock;
            await mentee.save();

            res.status(200).json({
                success: true,
                data: {
                    _id: mentee._id,
                    name: mentee.name,
                    email: mentee.email,
                    isBlock: mentee.isBlock,
                },
                message: `Mentee ${isBlock ? 'blocked' : 'unblocked'} successfully`,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating mentee status',
                error: error.message,
            });
        }
    });

    /**
     * @desc Assign mentor
     */
    static assignMentor = asyncHandler(async (req, res) => {
        const { menteeId } = req.params;
        const { mentorId } = req.body;

        if (!mentorId) {
            return res.status(400).json({
                success: false,
                message: 'Mentor ID is required',
            });
        }

        try {
            const mentee = await User.findOne({
                _id: menteeId,
                is_Deleted: false,
                role: 1,
            });

            if (!mentee) {
                return res.status(404).json({
                    success: false,
                    message: 'Mentee not found',
                });
            }

            const mentor = await User.findOne({
                _id: mentorId,
                is_Deleted: false,
                role: 2,
            });

            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: 'Mentor not found or invalid mentor role',
                });
            }

            if (mentee.mentorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mentee already has a mentor assigned',
                });
            }

            mentee.mentorId = mentorId;
            await mentee.save();

            res.status(200).json({
                success: true,
                data: {
                    menteeId: mentee._id,
                    menteeName: mentee.name,
                    mentorId: mentor._id,
                    mentorName: mentor.name,
                },
                message: 'Mentor assigned successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error assigning mentor',
                error: error.message,
            });
        }
    });

    /**
     * @desc Remove mentor
     */
    static removeMentor = asyncHandler(async (req, res) => {
        const { menteeId } = req.params;

        try {
            const mentee = await User.findOne({
                _id: menteeId,
                is_Deleted: false,
                role: 1,
            });

            if (!mentee) {
                return res.status(404).json({
                    success: false,
                    message: 'Mentee not found',
                });
            }

            if (!mentee.mentorId) {
                return res.status(400).json({
                    success: false,
                    message: 'Mentee does not have a mentor assigned',
                });
            }

            mentee.mentorId = null;
            await mentee.save();

            res.status(200).json({
                success: true,
                data: {
                    menteeId: mentee._id,
                    menteeName: mentee.name,
                },
                message: 'Mentor removed successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error removing mentor',
                error: error.message,
            });
        }
    });

    /**
     * @desc Soft delete mentee
     */
    static deleteMentee = asyncHandler(async (req, res) => {
        const { id } = req.params;

        try {
            const mentee = await User.findOne({
                _id: id,
                is_Deleted: false,
            });

            if (!mentee) {
                return res.status(404).json({
                    success: false,
                    message: 'Mentee not found or already deleted',
                });
            }

            mentee.is_Deleted = true;
            mentee.isActive = false;
            await mentee.save();

            res.status(200).json({
                success: true,
                data: { _id: mentee._id, name: mentee.name },
                message: 'Mentee deleted successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting mentee',
                error: error.message,
            });
        }
    });

    /**
     * @desc Hard delete mentee
     */
    static permanentDeleteMentee = asyncHandler(async (req, res) => {
        const { id } = req.params;

        try {
            const mentee = await User.findOneAndDelete({ _id: id });

            if (!mentee) {
                return res.status(404).json({
                    success: false,
                    message: 'Mentee not found',
                });
            }

            res.status(200).json({
                success: true,
                data: { _id: mentee._id, name: mentee.name },
                message: 'Mentee permanently deleted',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error permanently deleting mentee',
                error: error.message,
            });
        }
    });

    /**
     * @desc Update mentee
     */
    static updateMentee = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updates = req.body;

        const restrictedFields = ['password', 'role', '_id', 'createdAt', 'updatedAt'];
        restrictedFields.forEach(field => delete updates[field]);

        try {
            const mentee = await User.findOne({
                _id: id,
                is_Deleted: false,
                role: 1,
            });

            if (!mentee) {
                return res.status(404).json({
                    success: false,
                    message: 'Mentee not found',
                });
            }

            Object.keys(updates).forEach(key => {
                mentee[key] = updates[key];
            });

            await mentee.save();

            res.status(200).json({
                success: true,
                data: mentee,
                message: 'Mentee updated successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating mentee',
                error: error.message,
            });
        }
    });

    /**
     * @desc Get mentee stats
     */
    static getMenteesStats = asyncHandler(async (req, res) => {
        try {
            const filter = {
                mentorId: null,
                is_Deleted: false,
                role: 1,
            };

            const stats = {
                total: await User.countDocuments(filter),
                active: await User.countDocuments({ ...filter, isActive: true, isBlock: false }),
                inactive: await User.countDocuments({ ...filter, isActive: false }),
                blocked: await User.countDocuments({ ...filter, isBlock: true }),
                verified: await User.countDocuments({ ...filter, isVerified: true }),
                unverified: await User.countDocuments({ ...filter, isVerified: false }),
                freeSessionUsed: await User.countDocuments({ ...filter, freeSessionUsed: true }),
                freeSessionAvailable: await User.countDocuments({ ...filter, freeSessionUsed: false }),
            };

            const aggregateStats = await User.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalBalance: { $sum: '$Inr' },
                        totalBookings: { $sum: '$totalBookings' },
                        totalCompletedBookings: { $sum: '$completedBookings' },
                    },
                },
            ]);

            if (aggregateStats.length > 0) {
                stats.totalBalance = aggregateStats[0].totalBalance;
                stats.totalBookings = aggregateStats[0].totalBookings;
                stats.totalCompletedBookings = aggregateStats[0].totalCompletedBookings;
            }

            res.status(200).json({
                success: true,
                data: stats,
                message: 'Mentees statistics fetched successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching statistics',
                error: error.message,
            });
        }
    });
}

export default MenteeController;
