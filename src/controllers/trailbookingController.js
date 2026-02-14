import TrialBookingmodel from "../models/TrialBookingmodel.js";
import { generateTimeSlots } from "../utils/timeSlots.js";
import SessionBooking from "../models/sessions.js";
import ZoomMeeting from "../models/ZoomMeeting.js";
import Mentors from "../models/mentor.js";
import User from "../models/users.js";
import helper from "../helper/helper.js";
import Otp from "../models/otp.js";
import ZoomMeetingService from "../services/zoomService.js"
import emailService from "../helper/emailService.js";
class TrailBookingController {



    /**
   * Check if user has free session available
   */
    static async checkFreeSessionEligibility(req, res) {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "userId is required"
                });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            console.log(user, "userff")
            const hasFreeSession = user.hasFreeSessionAvailable();

            res.json({
                success: true,
                hasFreeSession,
                freeSessionUsed: user.freeSessionUsed,
                freeSessionUsedAt: user.freeSessionUsedAt,
                totalBookings: user.totalBookings || 0,
                completedBookings: user.completedBookings || 0
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error checking free session eligibility",
                error: error.message
            });
        }
    }



    /**
     * GET available slots
     */
    static async getAvailableSlots(req, res) {
        try {
            const { mentorId, date } = req.query;

            if (!mentorId || !date) {
                return res.status(400).json({
                    success: false,
                    message: "mentorId and date are required"
                });
            }

            const booked = await SessionBooking.find({
                mentorId,
                sessionDate: new Date(date),
                status: { $nin: ['cancelled'] }
            }).select('startTime');

            const bookedSlots = booked.map(b => b.startTime);
            const allSlots = generateTimeSlots();
            const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

            res.json({
                success: true,
                slots: availableSlots,
                bookedCount: bookedSlots.length,
                availableCount: availableSlots.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching available slots",
                error: error.message
            });
        }
    }

    /**
     * FREE Trial Booking
     */
    static async bookFreeTrial(req, res) {
        try {
            const { mentorId, date, timeSlot } = req.body;

            if (!mentorId || !date || !timeSlot) {
                return res.status(400).json({
                    success: false,
                    message: "mentorId, date, and timeSlot are required"
                });
            }

            const existingBooking = await TrialBookingmodel.findOne({
                mentorId,
                date,
                timeSlot,
                status: { $ne: 'CANCELLED' }
            });

            if (existingBooking) {
                return res.status(409).json({
                    success: false,
                    message: "This slot is already booked"
                });
            }

            const booking = await TrialBookingmodel.create({
                userId: req.user?.id || "Guest",
                mentorId,
                trialType: "FREE",
                date,
                timeSlot,
                paymentStatus: "NA",
                status: "CONFIRMED",
                meetingLink: `https://meet.google.com/free-trial-${Date.now()}`
            });

            res.status(201).json({
                success: true,
                message: "Free trial booked successfully",
                data: booking
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error booking free trial",
                error: error.message
            });
        }
    }

    /**
     * PREMIUM Trial (after payment success)
     */
    static async bookPremiumTrial(req, res) {
        try {
            const { mentorId, date, timeSlot, paymentId } = req.body;

            if (!mentorId || !date || !timeSlot || !paymentId) {
                return res.status(400).json({
                    success: false,
                    message: "mentorId, date, timeSlot, and paymentId are required"
                });
            }

            const existingBooking = await TrialBookingmodel.findOne({
                mentorId,
                date,
                timeSlot,
                status: { $ne: 'CANCELLED' }
            });

            if (existingBooking) {
                return res.status(409).json({
                    success: false,
                    message: "This slot is already booked"
                });
            }

            const booking = await TrialBookingmodel.create({
                userId: req.user?.id || "Guest",
                mentorId,
                trialType: "PREMIUM",
                date,
                timeSlot,
                paymentId,
                paymentStatus: "PAID",
                status: "CONFIRMED",
                meetingLink: `https://meet.google.com/premium-session-${Date.now()}`
            });

            res.status(201).json({
                success: true,
                message: "Premium trial booked successfully",
                data: booking
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error booking premium trial",
                error: error.message
            });
        }
    }

    /**
      * My Bookings
      */
    static async myBookings(req, res) {
        try {
            const userId = req.body?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const bookings = await SessionBooking.find({
                menteeId: userId
            })
                .populate("mentorId", "fullName currentRole companyName hourlyRate profileImage")
                .sort({ createdAt: -1 });

            // Get user's free session info
            const user = await User.findById(userId);

            res.json({
                success: true,
                count: bookings.length,
                data: bookings,
                userInfo: {
                    hasFreeSession: user?.hasFreeSessionAvailable() || false,
                    freeSessionUsed: user?.freeSessionUsed || false,
                    totalBookings: user?.totalBookings || 0,
                    completedBookings: user?.completedBookings || 0
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching bookings",
                error: error.message
            });
        }
    }



    static async cancelBooking(req, res) {
        try {
            const { bookingId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const booking = await SessionBooking.findOneAndUpdate(
                {
                    _id: bookingId,
                    menteeId: userId
                },
                {
                    status: 'cancelled',
                    cancellationReason: req.body.reason || 'Cancelled by user',
                    cancelledAt: new Date()
                },
                { new: true }
            );

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            // If this was a free session, restore the free session for the user
            if (booking.isFreeSession && booking.status === 'cancelled') {
                await User.findByIdAndUpdate(
                    userId,
                    {
                        freeSessionUsed: false,
                        freeSessionBookingId: null,
                        freeSessionUsedAt: null,
                        $inc: { totalBookings: -1 }
                    }
                );
                console.log(`Free session restored for user ${userId} after cancellation`);
            }

            // Cancel associated Zoom meeting if exists
            if (booking.zoomMeetingId) {
                try {
                    await ZoomMeeting.findOneAndUpdate(
                        { zoomMeetingId: booking.zoomMeetingId },
                        { status: 'cancelled' }
                    );
                } catch (zoomError) {
                    console.error("Failed to cancel Zoom meeting:", zoomError);
                }
            }

            res.json({
                success: true,
                message: booking.isFreeSession
                    ? "Booking cancelled successfully. Your free session has been restored."
                    : "Booking cancelled successfully",
                data: booking,
                freeSessionRestored: booking.isFreeSession
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error cancelling booking",
                error: error.message
            });
        }
    }


    /**
     * Create Zoom Meeting Helper
     */
    static async createZoomMeetingForBooking(userId, bookingData, mentor) {
        try {
            const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
            const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
            const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

            if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
                throw new Error('Zoom API credentials not configured');
            }

            // Generate access token
            const tokenResult = await zoomService.generateAccessToken(
                ZOOM_ACCOUNT_ID,
                ZOOM_CLIENT_ID,
                ZOOM_CLIENT_SECRET
            );

            if (!tokenResult.success) {
                throw new Error('Failed to generate Zoom access token');
            }

            // Parse start time
            const startDateTime = parseTimeToDateTime(bookingData.sessionDate, bookingData.startTime);

            // Create Zoom meeting
            const meetingData = {
                topic: `${bookingData.sessionType || 'One-on-One'} Session: ${bookingData.topic}`,
                type: 2, // Scheduled meeting
                start_time: startDateTime.toISOString(),
                duration: bookingData.durationMinutes,
                timezone: 'Asia/Kolkata',
                password: `meet${Math.floor(100 + Math.random() * 900)}`,
                agenda: `Session with ${mentor.fullName} - Topic: ${bookingData.topic}`,
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: false,
                    mute_upon_entry: true,
                    watermark: false,
                    use_pmi: false,
                    approval_type: 2,
                    audio: 'both',
                    auto_recording: 'none',
                    waiting_room: true
                }
            };

            const zoomResult = await zoomService.createMeeting(
                tokenResult.accessToken,
                'me',
                meetingData
            );

            if (!zoomResult.success) {
                throw new Error('Failed to create meeting on Zoom');
            }

            // Save Zoom meeting to database
            const zoomMeeting = new ZoomMeeting({
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

            await zoomMeeting.save();

            return {
                success: true,
                zoomMeeting: {
                    _id: zoomMeeting._id,
                    zoomMeetingId: zoomMeeting.zoomMeetingId,
                    joinUrl: zoomMeeting.joinUrl,
                    startUrl: zoomMeeting.startUrl,
                    password: zoomMeeting.password,
                    topic: zoomMeeting.topic
                }
            };

        } catch (error) {
            console.error('Create Zoom meeting error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async BookSession(req, res) {
        try {
            const {
                email,
                userId,
                mentorId,
                date,
                time,
                topic,
                duration,
                description,
                menteeEmail,
                sessionType,
                name,
                lastName,
                phone,
                isFreeSession, // ✅ ADD THIS
                createZoomMeeting // ✅ ADD THIS
            } = req.body;

            console.log("BookSession request:", { userId, mentorId, date, time, topic, duration, sessionType, isFreeSession, createZoomMeeting });

            // Validate required fields
            if (!email || !userId || !mentorId || !date) {
                return res.status(400).json({
                    success: false,
                    message: "email, userId, mentorId, date, time, topic, duration, name, lastName, and phone are required"
                });
            }

            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if user has free session available
            const hasFreeSession = user.hasFreeSessionAvailable();

            console.log(hasFreeSession, "hasFreeSession")

            // Validate mentor exists and get mentor data
            const mentor = await Mentors.findById(mentorId);
            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: 'Mentor not found'
                });
            }

            // Calculate price based on duration
            let price = mentor.hourlyRate;
            if (duration === 30) price = mentor.hourlyRate / 2;
            else if (duration === 90) price = mentor.hourlyRate * 1.5;

            // If this is free session, set price to 0
            if (hasFreeSession) {
                price = 0;
            }

            // Parse session date
            const sessionDate = new Date(date);

            // Calculate end time
            const endTime = calculateEndTime(time, duration);

            // Check if slot is already booked
            const existingBooking = await SessionBooking.findOne({
                mentorId,
                sessionDate,
                startTime: time,
                status: { $nin: ['cancelled'] }
            });

            if (existingBooking) {
                return res.status(400).json({
                    success: false,
                    message: 'This time slot is already booked'
                });
            }

            // ✅ CRITICAL CHANGE: Only create Zoom meeting for FREE sessions
            let zoomResult = { success: false };

            if (hasFreeSession && createZoomMeeting) {
                console.log("Creating Zoom meeting for FREE session...");
                zoomResult = await ZoomMeetingService.createAndSaveMeeting(
                    userId,
                    {
                        sessionDate,
                        startTime: time,
                        topic,
                        duration: duration,
                        timezone: 'Asia/Kolkata',
                        agenda: `Session with ${mentor.fullName} - Topic: ${topic}`
                    }
                );
            } else {
                console.log("Skipping Zoom creation for PAID session - will create after payment");
            }

            let bookingData = {
                userId,
                email,
                menteeName: `${name} ${lastName}`,
                phone,
                mentorId,
                menteeId: userId,
                menteeEmail,
                topic,
                description: description || '',
                sessionDate,
                startTime: time,
                endTime,
                durationMinutes: duration,
                sessionType: sessionType || 'One-on-One',
                price,
                currency: 'INR',
                status: hasFreeSession ? 'confirmed' : 'pending',
                paymentStatus: hasFreeSession ? 'paid' : 'unpaid',
                isFreeSession: hasFreeSession,
                createdBy: 'mentee'
            };

            // ✅ Only add Zoom details if created (FREE sessions only)
            if (zoomResult.success) {
                bookingData.zoomMeetingId = zoomResult.meeting.zoomMeetingId;
                bookingData.meetingLink = zoomResult.meeting.joinUrl;
                bookingData.zoomMeeting = {
                    meetingId: zoomResult.meeting.zoomMeetingId,
                    joinUrl: zoomResult.meeting.joinUrl,
                    startUrl: zoomResult.meeting.startUrl,
                    password: zoomResult.meeting.password,
                    topic: zoomResult.meeting.topic
                };
            }

            // If free session, mark as confirmed immediately
            if (hasFreeSession) {
                bookingData.confirmedAt = new Date();
                bookingData.paymentMethod = 'free';
                bookingData.transactionId = `FREE_SESSION_${Date.now()}`;
            }

            const booking = await SessionBooking.create(bookingData);

            // If this is a free session, mark it as used
            if (hasFreeSession) {
                await user.markFreeSessionUsed(booking._id);
                user.totalBookings = (user.totalBookings || 0) + 1;
                await user.save();

                console.log(`Free session marked as used for user ${userId}`);
            } else {
                user.totalBookings = (user.totalBookings || 0) + 1;
                await user.save();
            }

            console.log("Booking created successfully:", booking._id);


            if (hasFreeSession && zoomResult.success) {
                await emailService.sendSessionBookingMail({
                    name: `${name} ${lastName}`,
                    email,
                    mentorName: mentor.fullName,
                    topic,
                    sessionDate: sessionDate.toDateString(),
                    startTime: time,
                    duration,
                    price: 0,
                    isFreeSession: true,
                    zoomLink: zoomResult.meeting.joinUrl
                });
            }


            if (!hasFreeSession) {
                await emailService.sendSessionBookingMail({
                    name: `${name} ${lastName}`,
                    email,
                    mentorName: mentor.fullName,
                    topic,
                    sessionDate: sessionDate.toDateString(),
                    startTime: time,
                    duration,
                    price,
                    isFreeSession: false,
                    paymentRequired: `${process.env.FRONTEND_URL}/payment/${booking._id}`
                });
            }


            res.status(201).json({
                success: true,
                message: hasFreeSession
                    ? 'Free session booked successfully! Zoom meeting link sent to your email.'
                    : 'Booking created successfully. Please proceed with payment.',
                bookingId: booking._id,
                isFreeSession: hasFreeSession,
                requiresPayment: !hasFreeSession,
                data: booking,
                zoomMeeting: zoomResult.success ? {
                    meetingId: zoomResult.meeting.zoomMeetingId,
                    joinUrl: zoomResult.meeting.joinUrl,
                    password: zoomResult.meeting.password,
                    topic: zoomResult.meeting.topic
                } : null
            });

        } catch (error) {
            console.error("BookSession error:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    static async sendBookSessionOtp(req, res, next) {
        try {
            const { email } = req.body;

            if (!email) {
                return helper.failed(res, "Email is required");
            }

            const normalizedEmail = email.toLowerCase();

            // Check user exists
            const user = await User.findOne({
                email: normalizedEmail,
                is_Deleted: false
            });

            if (!user) {
                return helper.failed(res, "User not found");
            }

            // Generate OTP
            const otp_number = await helper.generateOTP();

            // Save or update OTP for book session
            await Otp.findOneAndUpdate(
                {
                    userId: user._id,
                    otpType: "bookSession"
                },
                {
                    otp: otp_number
                },
                {
                    upsert: true,
                    new: true
                }
            );

            // Send OTP
            // helper.nodeMailer(normalizedEmail, otp_number);

            return helper.success(
                res,
                "OTP sent successfully for booking session",
                {
                    userId: user._id,
                    email: normalizedEmail
                }
            );

        } catch (error) {
            next(error);
        }
    }

    /**
     * Complete Booking with Payment (Step 2) - Only for paid sessions
     */
    static async CompleteBookingWithPayment(req, res) {
        try {
            const { bookingId } = req.params;

            const {
                amount,
                paymentMethod,
                phoneNumber,
                transactionId
            } = req.body;

            console.log("CompleteBookingWithPayment:", { bookingId, amount, paymentMethod, transactionId });

            if (!bookingId) {
                return res.status(400).json({
                    success: false,
                    message: "bookingId is required"
                });
            }

            if (!transactionId || !phoneNumber) {
                return res.status(400).json({
                    success: false,
                    message: "transactionId and phoneNumber are required"
                });
            }

            const existingBooking = await SessionBooking.findById(bookingId)
                .populate('mentorId', 'fullName email currentRole profileImage companyName');

            if (!existingBooking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            // Check if this is a free session (shouldn't need payment)
            if (existingBooking.isFreeSession) {
                return res.status(400).json({
                    success: false,
                    message: "This is a free session and doesn't require payment"
                });
            }

            if (existingBooking.status === "confirmed") {
                return res.status(400).json({
                    success: false,
                    message: "Booking is already confirmed"
                });
            }

            // If Zoom meeting wasn't created during booking, create it now
            let zoomMeeting = null;
            if (!existingBooking.zoomMeetingId) {
                console.log("Creating Zoom meeting during payment completion...");
                const mentor = existingBooking.mentorId;
                const zoomResult = await ZoomMeetingService.createAndSaveMeeting(
                    existingBooking.userId,
                    {
                        sessionDate: existingBooking.sessionDate,
                        startTime: existingBooking.startTime,
                        topic: existingBooking.topic,
                        duration: existingBooking.durationMinutes,
                        timezone: 'Asia/Kolkata',
                        agenda: `Session with ${mentor.fullName} - Topic: ${existingBooking.topic}`
                    }
                );

                if (zoomResult.success) {
                    existingBooking.zoomMeetingId = zoomResult.meeting.zoomMeetingId;
                    existingBooking.meetingLink = zoomResult.meeting.joinUrl;
                    existingBooking.zoomMeeting = {
                        meetingId: zoomResult.meeting.zoomMeetingId,
                        joinUrl: zoomResult.meeting.joinUrl,
                        startUrl: zoomResult.meeting.startUrl,
                        password: zoomResult.meeting.password,
                        topic: zoomResult.meeting.topic
                    };
                    zoomMeeting = zoomResult.meeting;
                }
            } else {
                // Get existing Zoom meeting details
                const existingZoomMeeting = await ZoomMeeting.findOne({
                    zoomMeetingId: existingBooking.zoomMeetingId
                });
                if (existingZoomMeeting) {
                    zoomMeeting = existingZoomMeeting;
                }
            }

            // Update booking
            const updatedBooking = await SessionBooking.findByIdAndUpdate(
                bookingId,
                {
                    status: "confirmed",
                    paymentStatus: "paid",
                    paymentMethod: paymentMethod || "upi",
                    transactionId,
                    phoneNumber,
                    amountPaid: amount || existingBooking.price,
                    paymentDate: new Date(),
                    confirmedAt: new Date(),
                    ...(existingBooking.zoomMeetingId && {
                        zoomMeetingId: existingBooking.zoomMeetingId,
                        meetingLink: existingBooking.meetingLink,
                        zoomMeeting: existingBooking.zoomMeeting
                    })
                },
                { new: true }
            ).populate('mentorId', 'fullName email currentRole profileImage companyName');

            // Update user's completed bookings count
            await User.findByIdAndUpdate(
                existingBooking.userId,
                { $inc: { completedBookings: 0 } } // Will increment when session is marked complete
            );

            // TODO: Send confirmation email with Zoom link
            // TODO: Send email to mentor

            res.status(200).json({
                success: true,
                message: "Booking confirmed successfully! Check your email for Zoom meeting details.",
                data: updatedBooking,
                zoomMeeting: zoomMeeting ? {
                    meetingId: zoomMeeting.zoomMeetingId,
                    joinUrl: zoomMeeting.joinUrl,
                    password: zoomMeeting.password,
                    topic: zoomMeeting.topic
                } : null
            });

        } catch (error) {
            console.error("CompleteBookingWithPayment error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to complete booking",
                error: error.message
            });
        }
    }

    /**
     * Complete Booking - Update payment details (Step 2) - Alternative method
     */
    static async CompleteBooking(req, res) {
        try {
            const { bookingId, paymentDetails } = req.body;

            if (!bookingId || !paymentDetails) {
                return res.status(400).json({
                    success: false,
                    message: "bookingId and paymentDetails are required"
                });
            }

            const { transactionId, phoneNumber, amount, paymentMethod } = paymentDetails;

            if (!transactionId || !phoneNumber) {
                return res.status(400).json({
                    success: false,
                    message: "transactionId and phoneNumber are required"
                });
            }

            // Find booking
            const existingBooking = await SessionBooking.findById(bookingId)
                .populate('mentorId', 'fullName email currentRole profileImage');

            if (!existingBooking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // If Zoom meeting wasn't created, create it now
            if (!existingBooking.zoomMeetingId) {
                const mentor = existingBooking.mentorId;
                const zoomResult = await TrailBookingController.createZoomMeetingForBooking(
                    existingBooking.userId,
                    {
                        sessionDate: existingBooking.sessionDate,
                        startTime: existingBooking.startTime,
                        topic: existingBooking.topic,
                        durationMinutes: existingBooking.durationMinutes,
                        sessionType: existingBooking.sessionType
                    },
                    mentor
                );

                if (zoomResult.success) {
                    existingBooking.zoomMeetingId = zoomResult.zoomMeeting.zoomMeetingId;
                    existingBooking.meetingLink = zoomResult.zoomMeeting.joinUrl;
                    existingBooking.zoomMeeting = zoomResult.zoomMeeting;
                }
            }

            // Update booking with payment details and confirm
            const booking = await SessionBooking.findByIdAndUpdate(
                bookingId,
                {
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    transactionId,
                    phoneNumber,
                    paymentMethod: paymentMethod || 'upi',
                    amountPaid: amount || existingBooking.price,
                    paymentDate: new Date(),
                    confirmedAt: new Date(),
                    ...(existingBooking.zoomMeetingId && {
                        zoomMeetingId: existingBooking.zoomMeetingId,
                        meetingLink: existingBooking.meetingLink,
                        zoomMeeting: existingBooking.zoomMeeting
                    })
                },
                { new: true }
            ).populate('mentorId', 'fullName email currentRole profileImage');

            res.json({
                success: true,
                message: 'Booking confirmed successfully',
                data: booking
            });

        } catch (error) {
            console.error("CompleteBooking error:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

// Helper function to calculate end time
function calculateEndTime(startTime, durationMinutes) {
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;

    const totalMinutes = hour24 * 60 + minutes + durationMinutes;
    const endHour24 = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    let endHour12 = endHour24 % 12 || 12;
    const endPeriod = endHour24 >= 12 ? 'PM' : 'AM';

    return `${String(endHour12).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')} ${endPeriod}`;
}

// Helper function to parse time to DateTime
function parseTimeToDateTime(date, timeString) {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;

    const dateTime = new Date(date);
    dateTime.setHours(hour24, minutes, 0, 0);

    return dateTime;
}

export default TrailBookingController;




















