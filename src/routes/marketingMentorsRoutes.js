import { Router } from "express";
import MarketingMentorsController from "../controllers/marketinmentorsController.js";

let router = Router();

router.get('/allmentors', MarketingMentorsController.getAllMentors);

export default router;
