import { Router } from "express";
import LeaderShipMentorsController from "../controllers/LeadershipMentorsController.js";

let router = Router();

router.get('/allmentors', LeaderShipMentorsController.getAllMentors);

export default router;
