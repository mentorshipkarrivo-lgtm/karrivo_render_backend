import { Router } from "express";
import MenteePaymentController from "../controllers/paymentController.js";

let router = Router();

router.post('/addTransaction', MenteePaymentController.addPayment);

export default router;
