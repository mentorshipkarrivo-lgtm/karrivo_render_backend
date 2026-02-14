


// controllers/zoomMeetingController.js
import ZoomMeeting from '../models/ZoomMeeting.js';
import ZoomMeetingService from '../services/zoomService.js';

class ZoomMeetingController {
    /**
     * Create a new Zoom meeting
     * POST /api/meetings
     */
    static async createMeeting(req, res) {
        try {
            const userId = req.user.id;
            const {
                topic,
                type,
                startTime,
                duration,
                timezone,
                password,
                agenda,
                settings,
                recurrence
            } = req.body;

            if (!topic) {
                return res.status(400).json({
                    success: false,
                    message: 'Topic is required'
                });
            }

            // const {
            //     ZOOM_ACCOUNT_ID,
            //     ZOOM_CLIENT_ID,
            //     ZOOM_CLIENT_SECRET
            // } = process.env;

            const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
            const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
            const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

            console.log(ZOOM_ACCOUNT_ID,
                ZOOM_CLIENT_ID,
                ZOOM_CLIENT_SECRET
                , "creddetails")

            if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
                return res.status(500).json({
                    success: false,
                    message: 'Zoom API credentials not configured'
                });
            }

            const tokenResult = await ZoomMeetingService.generateAccessToken(
                ZOOM_ACCOUNT_ID,
                ZOOM_CLIENT_ID,
                ZOOM_CLIENT_SECRET

            );

            console.log(tokenResult, "token Result")

            if (!tokenResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to generate Zoom access token',
                    error: tokenResult.error
                });
            }

            const meetingData = {
                topic,
                type: type || 2,
                start_time: startTime ? new Date(startTime).toISOString() : undefined,
                duration: duration || 60,
                timezone: timezone || 'UTC',
                password,
                agenda,
                settings,
                recurrence
            };

            const zoomResult = await ZoomMeetingService.createMeetingOnZoom(
                tokenResult.accessToken,
                'me',
                meetingData
            );

            if (!zoomResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create meeting on Zoom',
                    error: zoomResult.error
                });
            }

            const meeting = new ZoomMeeting({
                userId,
                zoomMeetingId: zoomResult.data.id.toString(),
                uuid: zoomResult.data.uuid,
                topic: zoomResult.data.topic,
                type: zoomResult.data.type,
                startTime: zoomResult.data.start_time,
                duration: zoomResult.data.duration,
                timezone: zoomResult.data.timezone,
                password: zoomResult.data.password,
                agenda: zoomResult.data.agenda,
                joinUrl: zoomResult.data.join_url,
                startUrl: zoomResult.data.start_url,
                hostId: zoomResult.data.host_id,
                hostEmail: zoomResult.data.host_email,
                status: 'waiting',
                settings: {
                    hostVideo: zoomResult.data.settings.host_video,
                    participantVideo: zoomResult.data.settings.participant_video,
                    cnMeeting: zoomResult.data.settings.cn_meeting,
                    inMeeting: zoomResult.data.settings.in_meeting,
                    joinBeforeHost: zoomResult.data.settings.join_before_host,
                    muteUponEntry: zoomResult.data.settings.mute_upon_entry,
                    watermark: zoomResult.data.settings.watermark,
                    usePmi: zoomResult.data.settings.use_pmi,
                    approvalType: zoomResult.data.settings.approval_type,
                    registrationType: zoomResult.data.settings.registration_type,
                    audio: zoomResult.data.settings.audio,
                    autoRecording: zoomResult.data.settings.auto_recording,
                    waitingRoom: zoomResult.data.settings.waiting_room
                },
                zoomResponse: zoomResult.data
            });

            if (zoomResult.data.recurrence) {
                meeting.recurrence = {
                    type: zoomResult.data.recurrence.type,
                    repeatInterval: zoomResult.data.recurrence.repeat_interval,
                    weeklyDays: zoomResult.data.recurrence.weekly_days,
                    monthlyDay: zoomResult.data.recurrence.monthly_day,
                    monthlyWeek: zoomResult.data.recurrence.monthly_week,
                    monthlyWeekDay: zoomResult.data.recurrence.monthly_week_day,
                    endTimes: zoomResult.data.recurrence.end_times,
                    endDateTime: zoomResult.data.recurrence.end_date_time
                };
            }

            await meeting.save();

            return res.status(201).json({
                success: true,
                message: 'Meeting created successfully',
                data: meeting
            });
        } catch (error) {
            console.error('Create meeting error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create meeting',
                error: error.message
            });
        }
    }

    /**
     * GET /api/meetings
     */
    static async getMeetings(req, res) {
        try {
            const userId = req.user.id;
            const { status, page = 1, limit = 10 } = req.query;

            const query = { userId };
            if (status) query.status = status;

            const meetings = await ZoomMeeting.find(query)
                .sort({ startTime: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .select('-zoomResponse');

            const total = await ZoomMeeting.countDocuments(query);

            return res.status(200).json({
                success: true,
                data: meetings,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get meetings error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch meetings',
                error: error.message
            });
        }
    }

    /**
     * GET /api/meetings/:id
     */
    static async getMeetingById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const meeting = await ZoomMeeting.findOne({ _id: id, userId });

            if (!meeting) {
                return res.status(404).json({
                    success: false,
                    message: 'Meeting not found'
                });
            }

            meeting.updateMeetingStatus();
            await meeting.save();

            return res.status(200).json({
                success: true,
                data: meeting
            });
        } catch (error) {
            console.error('Get meeting error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch meeting',
                error: error.message
            });
        }
    }

    /**
     * PUT /api/meetings/:id
     */
    static async updateMeeting(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const meeting = await ZoomMeeting.findOne({ _id: id, userId });
            if (!meeting) {
                return res.status(404).json({
                    success: false,
                    message: 'Meeting not found'
                });
            }

            Object.assign(meeting, req.body);
            await meeting.save();

            return res.status(200).json({
                success: true,
                message: 'Meeting updated successfully',
                data: meeting
            });
        } catch (error) {
            console.error('Update meeting error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update meeting',
                error: error.message
            });
        }
    }

    /**
     * DELETE /api/meetings/:id
     */
    static async deleteMeeting(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const meeting = await ZoomMeeting.findOne({ _id: id, userId });
            if (!meeting) {
                return res.status(404).json({
                    success: false,
                    message: 'Meeting not found'
                });
            }

            meeting.status = 'cancelled';
            await meeting.save();

            return res.status(200).json({
                success: true,
                message: 'Meeting deleted successfully'
            });
        } catch (error) {
            console.error('Delete meeting error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete meeting',
                error: error.message
            });
        }
    }

    /**
     * GET /api/meetings/upcoming
     */
    static async getUpcomingMeetings(req, res) {
        try {
            const userId = req.user.id;

            const meetings = await ZoomMeeting.find({
                userId,
                startTime: { $gte: new Date() },
                status: 'waiting'
            })
                .sort({ startTime: 1 })
                .limit(10)
                .select('-zoomResponse');

            return res.status(200).json({
                success: true,
                data: meetings
            });
        } catch (error) {
            console.error('Upcoming meetings error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch upcoming meetings',
                error: error.message
            });
        }
    }
}

export default ZoomMeetingController;


