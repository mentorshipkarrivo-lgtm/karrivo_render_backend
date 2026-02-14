


import express from "express";
import SessionController from "../controllers/sessionController.js";

const router = express.Router();

// Create session booking
router.post("/create", SessionController.createSession);

// Get sessions for mentor
router.get("/mentor/:mentorId", SessionController.getMentorSessions);

// Get sessions for mentee
router.get("/mentee/:menteeId", SessionController.getMenteeSessions);

// Update session status
router.patch("/update-status/:sessionId", SessionController.updateSessionStatus);

// Optional: Get single session by ID
router.get("/:sessionId", SessionController.getSessionById);

// Optional: Delete a session
router.delete("/:sessionId", SessionController.deleteSession);

export default router;



