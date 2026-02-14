import { Router } from "express";
import ContactController from "../controllers/contactController.js";

let router = Router();

router.post('/req-submit', ContactController.submitContactForm);

export default router;
