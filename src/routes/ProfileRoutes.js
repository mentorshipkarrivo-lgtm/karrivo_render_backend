import { Router } from "express";
import ProfileController from "../controllers/profileSectionController.js";
let router = Router();

router.post('/save-profile', ProfileController.saveProfile);
router.get('/get-mentee-profile/:userId', ProfileController.getProfile);

router.get(
    '/details/:userId',
    ProfileController.getMenteeDashboard
);

router.post('/upload-profile-photo', ProfileController.uploadProfilePhoto);
router.post('/delete-profile-photo', ProfileController.deleteProfilePhoto);

export default router;
