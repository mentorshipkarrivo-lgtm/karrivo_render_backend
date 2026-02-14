import { Router } from "express";
import GooglesignController from "../controllers/googleSignController.js";

let router = Router();

router.post('/signin', GooglesignController.googleLogin);

export default router;
