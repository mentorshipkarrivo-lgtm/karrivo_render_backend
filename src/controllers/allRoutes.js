import { Router } from "express";
import admin from "../router/adminRouter.js";
import icoRouter from "../router/icoRouter.js";
import kyc from "../router/kycRouter.js";
import legal from "../router/legalRouter.js";
import payment from "../router/paymentRouter.js";
import referEarn from "../router/referEarnRouter.js";
import support from "../router/supportRouter.js";
import user from "../router/userRouter.js";
import withdraw from "../router/withdrawRouter.js";
import AuthRouter from "./authRouter.js";
import digilockerRouter from "./digilockerRouter.js";
import OrderRouter from "./orderRouter.js";
import paypalRouter from "./paypalRouter.js";
import shareHolderRouter from "./shareHolderRouter.js";
import walletRouter from "./walletRouter.js";
// In your main app.js or server.js
import businessAccountRouter from "./businessAccountRouter.js";
import mpinRouter from "./mpinRouter.js";
import notificationRoutes from "./notificationRouter.js";
import paymentGatewayRoutes from "./paymentGatewayRoutes.js";
import zoomMeetRoutes from "./zoomMeetRoutes.js";

import blogRouter from "./blogRouter.js";
import announcementRoutes from "./announcementRoutes.js";
import guarantedWealthRouter from "./guarantedWealthRouter.js";
import guarantedWealthRouter2 from "./guarantedWealthRouter2.js";
import guarantedWealthRouter3 from "./guarantedWealthRouter3.js";
import internalExpensesRouter from "./internalExpensesRoutes.js";
import baliRouter from "./baliVacotionRouter.js";

import developerRouter from "./developerRouter.js";
import centralAccountRouter from "../router/centralAccountRouter.js";
import revealRoutes from "./revealRoutes.js";
import teamroutes from "./teamRouter.js";
import freezedGroupRouter from "./frezzedGroupRouter.js";
import withdrawalRoutes from "./usdtWithdrawalRouter.js";

let router = Router();

// chatbotRoutes#########################################
// router.use("/ai", aiChatBot );

router.use("/accounts", businessAccountRouter);
router.use("/announcements", announcementRoutes);

// AdminRoutes###########################################
router.use("/Admin", admin);

// 1. AuthRoutes############################################
router.use("/Auth", AuthRouter);

// order Routes###########################################
router.use("/order", OrderRouter);

// icoRounds #############################################
router.use("/icoRound", icoRouter);

// withdraw Routes#########################################
router.use("/withdraw", withdraw);

// user Routes###########################################
router.use("/user", user);

// Payment Routes ###########################################
router.use("/payment", payment);

//  Support routes
router.use("/support", support);

//  kyc Router ##################################
router.use("/kyc", kyc);

// legal routes

router.use("/legal", legal);

router.use("/refer-earn", referEarn);
router.use("/wallet", walletRouter);
router.use("/paypal", paypalRouter);
router.use("/digilocker", digilockerRouter);

// share holders route

router.use("/share-holders", shareHolderRouter);

router.use("/payment-gateway", paymentGatewayRoutes);
router.use("/notifications", notificationRoutes);
router.use("/zoom-meetings", zoomMeetRoutes);

router.use("/mpin", mpinRouter);
router.use("/blog", blogRouter);
router.use("/guaranted-wealth", guarantedWealthRouter);
router.use("/guaranted-wealth-2-0", guarantedWealthRouter2);
router.use("/guaranted-wealth-3-0", guarantedWealthRouter3);

// internalExpenses

router.use("/internalexpenes", internalExpensesRouter);

///developers
router.use("/developer", developerRouter);

router.use("/central", centralAccountRouter);

router.use("/reveal", revealRoutes);
router.use("/bali-vocation", baliRouter);
router.use("/team", teamroutes);
router.use("/frezzed-group", freezedGroupRouter);
router.use("/usdt-withdrawal", withdrawalRoutes);

export default router;