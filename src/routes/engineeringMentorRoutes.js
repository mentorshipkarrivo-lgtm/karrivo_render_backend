import { Router } from "express";
import EngineeringMentorsController from "../controllers/engineeringmentorController.js";

let router = Router();

router.get('/allmentors', EngineeringMentorsController.getAllMentors);

export default router;
