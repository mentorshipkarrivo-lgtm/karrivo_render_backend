import { Router } from "express";
import ProductMentorsController from "../controllers/productMentorController.js";

let router = Router();

router.get('/allmentors', ProductMentorsController.getAllMentors);

export default router;
