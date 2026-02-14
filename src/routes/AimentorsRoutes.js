import { Router } from "express";
import AiMentorsController from "../controllers/aimentorsController.js";

let router = Router();

router.get('/allmentors', AiMentorsController.getAllMentors);

export default router;
