import { Router } from "express";
import AuthController from "../controllers/authController.js";
import validation from "../helper/validation.js";
import { Auth } from "../middlewares/authenticate.js"
// import { rateLimiter } from "../helper/rateLimit.js";

let router = Router();

router.get("/", (req, res) => {
    res.send("Hello, it's working!");
});


router.post("/", (req, res) => {
    res.send("Hello, it's working!");
});

router.post("/register", AuthController.register);
router.post("/isVerify", validation, AuthController.isVerify);
router.post("/resendOtp", validation, AuthController.resendOtp);
router.post("/login", validation, AuthController.login);
router.post(
    "/forgotPassword",
    validation,
    AuthController.forgotPassword
);
router.post(
    "/resetPassword",
    validation,
    AuthController.resetPassword
);
router.post(
    "/changePassword",
    validation,
    Auth,
    AuthController.changePassword
);
router.post(
    "/changePasswordReq",
    validation,
    Auth,
    AuthController.changePasswordReq
);
router.post("/reCAPTCHAVerify", AuthController.capchta_verify);
router.post("/logout", Auth, AuthController.logout);
router.get("/refreshToken", AuthController.refreshToken);

export default router;