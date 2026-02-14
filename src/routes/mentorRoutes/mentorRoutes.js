



import { Router } from "express";

import getMentorDetailsController from "../../controllers/mentorprofiles/mentorDashboardController.js";

let router = Router();

router.get('/user/:mentorId', getMentorDetailsController.getUserDetails);
router.get('/mentor/:mentorId/sessions', getMentorDetailsController.getMentorSessionBookings);


    
export default router;



