import { Router } from "express";
import AuthRouter from "./authRouter.js";
import MenteeApplicationRouter from "./mentorApplicationRoutes.js"
import EngineeringMentorsRouter from "./engineeringMentorRoutes.js"
import startUpMentorsRouter from "./startUpmentorsRoutes.js"
import ProductMentorsRouter from "./productMentorsRoutes.js"

import MarketingMentorsRouter from "./marketingMentorsRoutes.js"
import MentorsessionRouter from "./sessionRoutes.js"
import LeaderShipMentorsRouter from "./leadershipmentorsRoutes.js"

import AiMentorsRouter from "./AimentorsRoutes.js"
import GoogleSigninRouter from "./googlesignRouter.js"
import MenteeTrailbookingsRouter from "./trialBookingRoutes.js"
import MenteeProfileSaveRouter from "./ProfileRoutes.js"
import menteePaymentRouter from "./paymentRoutes.js"
import zoomMeetingRoutes from "./zoomMeetingRoutes.js"

import TicketsRouter from "./ticketsRoutes.js"


import ContactRouter from "./contactRoutes.js"

import MentorDashboardRouter from "./mentorRoutes/mentorRoutes.js"
import MentorSupportRouter from  "./mentorRoutes/mentorSupportRoutes.js" 

import AdminMentorSupportRouter from  "./mentorRoutes/adminMentorSupportRoutes.js" 


import UsersRouter from  "./mentorRoutes/userRoutes.js" 

import SessionsBookingsRouter from "./mentorRoutes/sessionBookingRoutes.js"
let router = Router();

// Auth routes
router.use("/Auth", AuthRouter);
router.use("/Mentor", MenteeApplicationRouter);
router.use("/EngineeringMentors", EngineeringMentorsRouter);
router.use("/startUpMentors", startUpMentorsRouter);

router.use("/ProductMentors", ProductMentorsRouter);

router.use("/MarketingMentors", MarketingMentorsRouter);

router.use("/LeaderShipMentors", LeaderShipMentorsRouter);
router.use("/auth", GoogleSigninRouter);

router.use("/sessions", MentorsessionRouter);

router.use("/AiMentors", AiMentorsRouter);
router.use("/mentee/trailbookings", MenteeTrailbookingsRouter);
router.use("/mentee/dashboard", MenteeProfileSaveRouter);
router.use("/mentee/support", TicketsRouter);
router.use('/meetings', zoomMeetingRoutes);


router.use("/contact", ContactRouter);

router.use("/mentee", menteePaymentRouter);



router.use("/mentor/dashboard", MentorDashboardRouter);

router.use("/mentor/support", MentorSupportRouter);
router.use("/admin/mentor-support", AdminMentorSupportRouter);
router.use("/users", UsersRouter);


router.use("/Admin", SessionsBookingsRouter);





export default router;


