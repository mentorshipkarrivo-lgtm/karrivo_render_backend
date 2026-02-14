



import { Router } from "express";



import MenteeController from "../controllers/allmentessController.js";



let router = Router();

router.get('/mentees', MenteeController.getMentees);
router.get('/mentees/stats', MenteeController.getMenteesStats);
router.get('/mentees/:id', MenteeController.getMenteeById);
router.put('/mentees/:id/block', MenteeController.toggleBlockMentee);
router.put('/mentees/:menteeId/assign-mentor', MenteeController.assignMentor);
router.put('/mentees/:menteeId/remove-mentor', MenteeController.removeMentor);
router.delete('/mentees/:id', MenteeController.deleteMentee);
router.delete('/mentees/:id/permanent', MenteeController.permanentDeleteMentee);
router.put('/mentees/:id', MenteeController.updateMentee);

export default router;
