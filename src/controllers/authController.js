import axios from "axios";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import helper from "../helper/helper.js";
import otp from "../models/otp.js";
import User from "../models/users.js";
import emailService from "../helper/emailService.js";
import Mentees from "../models/mentee.js";

class AuthController {
    // static async register(req, res, next) {
    //     try {
    //         // Generate a unique username
    //         let username;
    //         while (true) {
    //             username = await helper.generateUniqueUsername();
    //             const exists = await User.exists({ username });
    //             if (!exists) break;
    //         }

    //         // Destructure the request body safely
    //         const body = req.body || {};
    //         let { name, email, password, phone, countryCode } = body;

    //         // Validate required fields
    //         if (!name || !email || !password || !phone || !countryCode) {
    //             return helper.failed(res, "Missing required fields");
    //         }

    //         // Normalize email
    //         email = email.toLowerCase();
    //         req.body.email = email;

    //         // Validate country code
    //         const allowedCountryCodes = ["+1", "+44", "+91", "+49", "+65", "+60", "+61"];
    //         if (!allowedCountryCodes.includes(countryCode)) {
    //             return helper.failed(res, "Registration failed: invalid country code");
    //         }

    //         // Check if the email already exists
    //         const existingEmailUser = await User.findOne({ email, is_Deleted: false }).lean();

    //         if (existingEmailUser && !existingEmailUser.isVerified && existingEmailUser.phone !== phone) {
    //             // Update phone for unverified user
    //             await User.findByIdAndUpdate(existingEmailUser._id, { phone });

    //             const otp_number = await helper.generateOTP();
    //             await otp.findOneAndUpdate(
    //                 { userId: existingEmailUser._id, otpType: "register" },
    //                 { otp: otp_number },
    //                 { upsert: true }
    //             );

    //             helper.SmsOtp(phone, otp_number, "register");
    //             helper.nodeMailer(existingEmailUser.email, otp_number);

    //             return helper.success(
    //                 res,
    //                 "We've updated your phone number. Please verify your account with the new OTP.",
    //                 { email, phone, userId: existingEmailUser._id }
    //             );
    //         }

    //         // Existing email checks
    //         if (existingEmailUser && !existingEmailUser.isVerified) {
    //             return helper.failed(res, "User verification pending", { email });
    //         }
    //         if (existingEmailUser && existingEmailUser.isVerified) {
    //             return helper.failed(res, "Email already exists", { email });
    //         }

    //         // Check if phone already exists
    //         const existingPhoneUser = await User.findOne({ phone, is_Deleted: false });
    //         if (existingPhoneUser) {
    //             return helper.failed(res, "Phone already exists", { phone });
    //         }

    //         // Generate OTP and assign to request body
    //         const otp_number = await helper.generateOTP();
    //         req.body.otp = otp_number;

    //         // Assign username
    //         req.body.username = "Karrivo" + username;

    //         // Set registration date in IST
    //         const ISTOffset = 5.5 * 60 * 60 * 1000;
    //         req.body.registeredDate = new Date(Date.now() + ISTOffset);

    //         // Create user in DB
    //         const createUser = await User.create(req.body);
    //         createUser.username = req.body.username;
    //         createUser.otp = otp_number;

    //         // Generate JWT token
    //         const token = JWT.sign(
    //             { id: createUser._id, loginTime: createUser.loginTime },
    //             process.env.JWT_SK
    //         );
    //         createUser.token = token;

    //         // Remove password before sending response
    //         delete createUser.password;

    //         // Save OTP in DB
    //         await otp.create({
    //             userId: createUser._id,
    //             otp: otp_number,
    //             otpType: "register",
    //         });



    //         await Mentees.create({
    //            createUser
    //         });
    //         // Send OTP via email and SMS
    //         // helper.nodeMailer(createUser.email, otp_number);
    //         // helper.SmsOtp(phone, otp_number, "register");

    //         console.log(createUser.email, "createUser.email,")

    //         emailService.sendOtpMail(createUser.email, createUser.name, otp_number, "register");


    //         return helper.success(res, "User registered successfully", createUser);
    //     } catch (error) {
    //         next(error);
    //     }
    // }




    static async register(req, res, next) {
        try {
            // Generate unique username
            let username;
            while (true) {
                username = await helper.generateUniqueUsername();
                const exists = await User.exists({ username });
                if (!exists) break;
            }

            // Destructure request body
            const body = req.body || {};
            let { name, email, password, phone, countryCode } = body;

            // Validate required fields
            if (!name || !email || !password || !phone || !countryCode) {
                return helper.failed(res, "Missing required fields");
            }

            // Normalize email
            email = email.toLowerCase();
            req.body.email = email;

            // Validate country code
            const allowedCountryCodes = ["+1", "+44", "+91", "+49", "+65", "+60", "+61"];
            if (!allowedCountryCodes.includes(countryCode)) {
                return helper.failed(res, "Registration failed: invalid country code");
            }

            // Check existing email
            const existingEmailUser = await User.findOne({
                email,
                is_Deleted: false,
            }).lean();

            if (
                existingEmailUser &&
                !existingEmailUser.isVerified &&
                existingEmailUser.phone !== phone
            ) {
                await User.findByIdAndUpdate(existingEmailUser._id, { phone });

                const otp_number = await helper.generateOTP();

                await otp.findOneAndUpdate(
                    { userId: existingEmailUser._id, otpType: "register" },
                    { otp: otp_number },
                    { upsert: true }
                );

                helper.SmsOtp(phone, otp_number, "register");
                helper.nodeMailer(existingEmailUser.email, otp_number);

                return helper.success(
                    res,
                    "We've updated your phone number. Please verify your account with the new OTP.",
                    { email, phone, userId: existingEmailUser._id }
                );
            }

            if (existingEmailUser && !existingEmailUser.isVerified) {
                return helper.failed(res, "User verification pending", { email });
            }

            if (existingEmailUser && existingEmailUser.isVerified) {
                return helper.failed(res, "Email already exists", { email });
            }

            // Check phone exists
            const existingPhoneUser = await User.findOne({
                phone,
                is_Deleted: false,
            });

            if (existingPhoneUser) {
                return helper.failed(res, "Phone already exists", { phone });
            }

            // Generate OTP
            const otp_number = await helper.generateOTP();
            req.body.otp = otp_number;

            // Assign username
            req.body.username = "Karrivo" + username;

            // Set IST registration date
            const ISTOffset = 5.5 * 60 * 60 * 1000;
            req.body.registeredDate = new Date(Date.now() + ISTOffset);


            const createUser = await User.create(req.body);

            // Generate JWT
            const token = JWT.sign(
                { id: createUser._id, loginTime: createUser.loginTime },
                process.env.JWT_SK
            );

            createUser.token = token;


            const userData = createUser.toObject();

            // Remove sensitive data (important)
            delete userData.password;
            delete userData.otp;
            delete userData.__v;

            await Mentees.create({
                userId: createUser._id,
                ...userData,
                role: "mentee",
            });

            // ================================
            // SAVE OTP
            // ================================
            await otp.create({
                userId: createUser._id,
                otp: otp_number,
                otpType: "register",
            });

            emailService.sendOtpMail(
                createUser.email,
                createUser.name,
                otp_number,
                "register"
            );

            const responseUser = createUser.toObject();
            delete responseUser.password;

            return helper.success(res, "User registered successfully", responseUser);

        } catch (error) {
            next(error);
        }
    }


    static async isVerify(req, res, next) {
        try {
            let { email, otpType, referenceId } = await req.body;
            console.log(email, otpType, referenceId, "email, otpType, referenceId ")
            email = email.toLowerCase();
            let findEmail = await User.findOne({
                is_Deleted: false,
                email: email,
            });


            if (!findEmail) {
                return helper.failed(res, "Invalid email", { email });
            }

            const findOTP = await otp.findOne({
                userId: findEmail._id,
                otpType: otpType,
            });

            console.log(
                findOTP.otp,
                "findOtp",
                typeof findOTP.otp,      // type of OTP from DB
                req.body.otp,
                "req.body.otp",
                typeof req.body.otp      // type of OTP from request body
            );
            if (!findOTP || findOTP.otp !== req.body.otp) {
                return helper.failed(res, "Invalid OTP", { email });
            }
            if (otpType == "register") {
                if (findEmail.isVerified || findOTP.expireTime < new Date()) {
                    return helper.failed(
                        res,
                        findEmail.isVerified ? "User already verified" : "OTP expired"
                    );
                }
                const loginTime = Math.floor(Date.now() / 1000);

                const DEFAULT_REFERENCE_ID = "KARRIVO667d4a9eb3e5d157e11b6abfXX1208";
                let finalreferenceId;

                if (referenceId && referenceId.trim() !== "") {
                    const findUser = await User.findOne({
                        username: referenceId,
                    });


                    console.log(findUser, "findUser")
                    // If user not found with the provided reference ID, return error
                    if (!findUser) {
                        return helper.failed(res, "Invalid Reference ID", { referenceId });
                    }

                    finalreferenceId = referenceId;
                } else {
                    finalreferenceId = DEFAULT_REFERENCE_ID;
                }


                let isUnique = false;

                // while (!isUnique) {
                //     const creds = await jmcHelper.genarateUniqePrivatekey();
                //     const exists = await User.findOne({
                //         walletadress: creds.walletadress,
                //     });

                //     if (!exists) {
                //         userWalletCreds = creds;
                //         isUnique = true;
                //     }
                // }
                await User.findByIdAndUpdate(findEmail._id, {
                    isVerified: true,
                    loginTime: loginTime,
                    referenceId: finalreferenceId,
                });


                const token = JWT.sign(
                    { id: findEmail._id, loginTime },
                    process.env.JWT_SK
                );
                findEmail = findEmail.toJSON();
                findEmail["token"] = token;

                // emailService.sendOtpMail(findEmail, existingEmailUser.name, otp_number, "register");


                return helper.success(res, "User verified successfully", findEmail);
            } else {
                if (!findEmail.forgotReq || findOTP.expireTime < new Date()) {
                    return helper.failed(
                        res,
                        findEmail.forgotReq ? "Session expired" : "OTP expired"
                    );
                }

                return helper.success(res, "OTP verified successfully", { email });
            }
        } catch (error) {
            next(error);
        }
    }


    static async resendOtp(req, res, next) {
        try {
            let { email } = req.body;
            email = email.toLowerCase();
            let findEmail = await User.findOne({
                email: email,
                is_Deleted: false,
            });

            if (!findEmail) {
                return helper.failed(res, "Invalid email", { email: email });
            }

            let otp_number = await helper.generateOTP();
            const now = new Date();
            now.setMinutes(now.getMinutes() + 10);
            helper.nodeMailer(email, otp_number);
            helper.SmsOtp(findEmail.phone, otp_number, "register");
            await otp.findOneAndUpdate(
                {
                    userId: findEmail._id,
                    otpType: "register",
                },
                {
                    otp: otp_number,
                    otpType: "register",
                    expireTime: now,
                },
                {
                    upsert: true,
                    new: true,
                }
            );

            emailService.sendOtpMail(email, findEmail.name, otp_number, "register");

            return helper.success(res, "Resend OTP Successfully", { email: email });
        } catch (error) {
            next(error);
        }
    }
    // static async login(req, res, next) {
    //     try {
    //         let { email, password, role, phone, fcm_token } = req.body;
    //         email = email.toLowerCase();
    //         const login__id = email ? { email: email } : { phone: phone };
    //         let loginType = email
    //             ? { email: email, is_Deleted: false }
    //             : { is_Deleted: false, phone: phone };
    //         const findEmail = await User.findOne(loginType);
    //         if (!findEmail) {
    //             return helper.failed(
    //                 res,
    //                 `We couldn't find an account with this ${email ? "email address" : "phone number"
    //                 }. Please check and try again.`,
    //                 login__id
    //             );
    //         }
    //         if (role === 0 && findEmail?.role === 1) {
    //             return helper.failed(res, "Invalid email", login__id);
    //         } else if (
    //             role === 1 &&
    //             (findEmail?.role === 0 ||
    //                 findEmail?.role === 2 ||
    //                 findEmail?.role === 3)
    //         ) {
    //             return helper.failed(res, "Invalid email", login__id);
    //         }
    //         if (findEmail && findEmail.is_Deleted == true) {
    //             return helper.failed(
    //                 res,
    //                 `Invalid ${email ? "email" : "phone"}`,
    //                 login__id
    //             );
    //         }
    //         if (!findEmail.isVerified) {
    //             // if not verified delete the account
    //             await User.findOneAndDelete({ email: email });
    //             return helper.failed(
    //                 res,
    //                 "User not verified please create an account",
    //                 { email }
    //             );
    //         }
    //         if (findEmail.isBlock == true || findEmail.isBlock == 1) {
    //             return helper.failed(res, "Account Blocked By Admin", { email });
    //         }
    //         const matched = await bcrypt.compareSync(password, findEmail.password);

    //         if (!matched) {
    //             return helper.failed(res, "Invalid password", { email });
    //         }
    //         const loginTime = Math.floor(Date.now() / 1000);
    //         await User.findByIdAndUpdate(findEmail._id, { loginTime, fcm_token });


    //         let updatedUser = await User.findById(
    //             findEmail._id,
    //             "name email role username phone countryCode city state country address walletadress permissions"
    //         );
    //         const token = JWT.sign(
    //             {
    //                 id: updatedUser._id,
    //                 loginTime,
    //                 exp: Math.floor(Date.now() / 1000) + 60 * 10,
    //             },
    //             process.env.JWT_SK
    //         );
    //         updatedUser = updatedUser.toJSON();


    //         updatedUser["token"] = token;
    //         return helper.success(res, "User Login Successful", updatedUser);
    //     } catch (error) {
    //         next(error);
    //     }
    // }



    static async login(req, res, next) {
        try {
            let { email, password, role, phone, fcm_token } = req.body;
            email = email.toLowerCase();
            const login__id = email ? { email: email } : { phone: phone };
            let loginType = email
                ? { email: email, is_Deleted: false }
                : { is_Deleted: false, phone: phone };

            const findEmail = await User.findOne(loginType);

            if (!findEmail) {
                return helper.failed(
                    res,
                    `We couldn't find an account with this ${email ? "email address" : "phone number"}. Please check and try again.`,
                    login__id
                );
            }

            // Check if account is deleted
            if (findEmail && findEmail.is_Deleted == true) {
                return helper.failed(
                    res,
                    `Invalid ${email ? "email" : "phone"}`,
                    login__id
                );
            }

            // Check if user is verified
            if (!findEmail.isVerified) {
                await User.findOneAndDelete({ email: email });
                return helper.failed(
                    res,
                    "User not verified please create an account",
                    { email }
                );
            }

            // Check if account is blocked
            if (findEmail.isBlock == true || findEmail.isBlock == 1) {
                return helper.failed(res, "Account Blocked By Admin", { email });
            }

            // ✅ FIXED: Strict role-based validation
            // role: 1 = mentee, role: 2 = mentor
            const userRole = findEmail.role;

            if (role === 1 && userRole !== 1) {
                // Trying to login as mentee but user is not a mentee
                return helper.failed(
                    res,
                    "Invalid credentials. This account is not registered as a mentee.",
                    login__id
                );
            }

            if (role === 2 && userRole !== 2) {
                // Trying to login as mentor but user is not a mentor
                return helper.failed(
                    res,
                    "Invalid credentials. This account is not registered as a mentor.",
                    login__id
                );
            }

            // Verify password
            const matched = await bcrypt.compareSync(password, findEmail.password);

            if (!matched) {
                return helper.failed(res, "Invalid password", { email });
            }

            // Update login time and FCM token
            const loginTime = Math.floor(Date.now() / 1000);
            await User.findByIdAndUpdate(findEmail._id, { loginTime, fcm_token });

            // Get updated user data
            let updatedUser = await User.findById(
                findEmail._id,
                "name email role username phone countryCode city state country address walletadress permissions"
            );

            // Generate JWT token
            const token = JWT.sign(
                {
                    id: updatedUser._id,
                    loginTime,
                    exp: Math.floor(Date.now() / 1000) + 60 * 10,
                },
                process.env.JWT_SK
            );

            updatedUser = updatedUser.toJSON();
            updatedUser["token"] = token;

            return helper.success(res, "User Login Successful", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    static async refreshToken(req, res, next) {
        try {
            const authHeader = req.headers["authorization"];
            const expiredToken = authHeader && authHeader.split(" ")[1];

            if (!expiredToken) {
                return res.status(401).json({ message: "Refresh Token is required" });
            }

            // Decode the token without verifying expiration
            const decoded = JWT.decode(expiredToken);
            if (!decoded) {
                return res.status(403).json({ message: "Invalid Refresh Token" });
            }

            // Verify the refresh token signature
            JWT.verify(expiredToken, process.env.JWT_SK, (err) => {
                if (err && err.name !== "TokenExpiredError") {
                    return res.status(403).json({ message: "Invalid Refresh Token" });
                }

                // Issue a new access token
                const token = JWT.sign(
                    { id: decoded.id, exp: Math.floor(Date.now() / 1000) + 60 * 10 },
                    process.env.JWT_SK
                );

                return helper.success(res, "Refresh Token Generated Successfully", {
                    token: token,
                });
            });
        } catch (error) {
            next(error);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            let { email, is_Deleted = false } = req.body;
            console.log(email, "email")
            email = email.toLowerCase();
            let findEmail = await User.findOne({
                email: email,
                is_Deleted: false,
            });
            if (!findEmail) {
                return helper.failed(res, "Invalid email", { email: email });
            }
            let otp_number = await helper.generateOTP();
            console.log(otp_number);
            helper.nodeMailer(email, otp_number);
            helper.SmsOtp(findEmail.phone, otp_number, "forgotPassword");
            findEmail.forgotReq = 1;
            await findEmail.save();
            const now = new Date();
            now.setMinutes(now.getMinutes() + 10);
            await otp.findOneAndUpdate(
                {
                    otpType: "forgotPassword",
                    userId: findEmail.id,
                },
                {
                    otp: otp_number,
                    otpType: "forgotPassword",
                    expireTime: now,
                    userId: findEmail.id,
                },
                {
                    upsert: true,
                    new: true,
                }
            );

            emailService.sendOtpMail(email, findEmail.name, otp_number, "forgotPassword");

            return helper.success(res, `Otp sent on  ${email}`, { email: email });
        } catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            let { email, password } = req.body;
            email = email.toLowerCase();

            let findEmail = await User.findOne({
                email: email,
                is_Deleted: false,
            });
            if (!findEmail) {
                return helper.failed(res, "Invalid email", { email: email });
            }
            if (!findEmail.forgotReq) {
                return helper.failed(res, "Session Expired", { email: email });
            }
            findEmail.forgotReq = false;
            findEmail.password = password;
            await findEmail.save();
            return helper.success(res, `  Password Updated Successfully`, {
                email: email,
            });
        } catch (error) {
            next(error);
        }
    }
    static async changePasswordReq(req, res, next) {
        try {
            const { password } = req.body;
            let findEmail = await User.findOne({
                email: req.user ? req.user.email : req.admin.email,
                is_Deleted: false,
            });
            let matched = await bcrypt.compareSync(password, findEmail.password, 10);
            if (!matched) {
                return helper.failed(res, "Invalid password");
            }
            findEmail.forgotReq = true;
            findEmail.save();
            let otp_number = await helper.generateOTP();
            helper.nodeMailer(findEmail.email, otp_number);
            helper.SmsOtp(findEmail.phone, otp_number, "ChangePassword");
            const now = new Date();
            now.setMinutes(now.getMinutes() + 10);
            await otp.findOneAndUpdate(
                {
                    otpType: "ChangePassword",
                    userId: findEmail.id,
                },
                {
                    otp: otp_number,
                    otpType: "ChangePassword",
                    expireTime: now,
                    userId: findEmail.id,
                },
                {
                    upsert: true,
                    new: true,
                }
            );

            emailService.sendOtpMail(findEmail.email, findEmail.name, otp_number, "changePassword");

            return helper.success(res, "OTP sent to your email for Change Password", {
                email: findEmail.email,
            });
        } catch (error) {
            next(error);
        }
    }
    static async changePassword(req, res, next) {
        try {
            const { newPassword } = req.body;

            // Find the user by email and ensure they're not deleted
            let findEmail = await User.findOne({
                email: req.user ? req.user.email : req.admin.email,
                is_Deleted: false,
            });

            if (!findEmail) {
                return helper.failed(res, "User not found");
            }

            let isSamePassword = await bcrypt.compareSync(
                newPassword,
                findEmail.password,
                10
            );

            // Check if the old password and new password are the same
            if (isSamePassword) {
                return helper.failed(
                    res,
                    "New password cannot be the same as the old password"
                );
            }

            // // Compare the provided password with the stored one
            // let matched = await bcrypt.compareSync(password, findEmail.password);
            // if (!matched) {
            //   return helper.failed(res, "Invalid password");
            // }

            // Update the password and save the user
            findEmail.password = newPassword;
            await findEmail.save();

            return helper.success(res, `Password Updated Successfully`);
        } catch (error) {
            next(error);
        }
    }

    static async capchta_verify(req, res) {
        try {
            let { response } = req.body;
            const check_verify = await axios
                .post(
                    "https://www.google.com/recaptcha/api/siteverify",
                    new URLSearchParams({
                        secret: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
                        response: response.toString(),
                    }),
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    }
                )
                .then((responce) => {
                    return res.json(responce.data);
                })
                .catch((err) => {
                    console.log(err);
                    res.json(err.message);
                });
        } catch (error) {
            console.log(error);
            return helper.err(res, error, req.path);
        }
    }
    static async logout(req, res, next) {
        try {
            await User.findByIdAndUpdate(req.user.id, {
                loginTime: 0,
            });
            return helper.success(res, ` Logout Successfully`, {});
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;