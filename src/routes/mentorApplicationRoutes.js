
import { Router } from "express";
import MentorController from "../controllers/mentorApplicationController.js";

let router = Router();

// Public routes
router.post('/apply', MentorController.submitApplication);
router.get('/topmentors', MentorController.getTopMentors);
router.get("/search", MentorController.searchMentors);

router.get('/view/:mentorId', MentorController.getMentorById);

// Password reset route (Public - no auth required)
router.post('/reset-password', MentorController.resetPassword);

// Mentor profile routes
router.post('/get-mentor-details', MentorController.getMentorDetails);
router.put('/update-mentor-details', MentorController.updateMentorDetails);

// Admin routes (Add authentication middleware here if needed)
router.get('/applications', MentorController.getAllApplications);
router.get('/applications/:id', MentorController.getApplicationById);
router.patch('/applications/:id/status', MentorController.updateApplicationStatus);
router.patch('/applications/:id/approve-reject', MentorController.approveRejectApplication);
router.delete('/applications/:id', MentorController.deleteApplication);

export default router;