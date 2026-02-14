import { Router } from "express";
import StartupMentorsController from "../controllers/startUpmentorsController.js";

let router = Router();

router.get('/allmentors', StartupMentorsController.getAllMentors);

export default router;
