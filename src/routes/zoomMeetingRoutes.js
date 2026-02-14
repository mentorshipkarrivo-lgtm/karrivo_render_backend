import express from 'express';
import ZoomMeetingController from '../controllers/zoomMeetingController.js';
import { Auth } from '../middlewares/authenticate.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(Auth);

/**
 * @route   POST /api/meetings
 * @desc    Create a new Zoom meeting
 * @access  Private
 */
router.post('/', ZoomMeetingController.createMeeting);

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings for current user
 * @access  Private
 */
router.get('/', ZoomMeetingController.getMeetings);

/**
 * @route   GET /api/meetings/upcoming
 * @desc    Get upcoming meetings
 * @access  Private
 */
router.get('/upcoming', ZoomMeetingController.getUpcomingMeetings);

/**
 * @route   GET /api/meetings/:id
 * @desc    Get single meeting by ID
 * @access  Private
 */
router.get('/:id', ZoomMeetingController.getMeetingById);

/**
 * @route   PUT /api/meetings/:id
 * @desc    Update a meeting
 * @access  Private
 */
router.put('/:id', ZoomMeetingController.updateMeeting);

/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete a meeting
 * @access  Private
 */
router.delete('/:id', ZoomMeetingController.deleteMeeting);

export default router;
