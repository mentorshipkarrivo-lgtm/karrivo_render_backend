import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import GoogleSign from "../models/googlesign.js"; // Your GoogleSign schema

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class GooglesignController {
    static async googleLogin(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ success: false, message: "Token is required" });
            }

            // 1️⃣ Verify Google Token
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            console.log("✅ Google token verified:", payload.email);

            // 2️⃣ Find or create USER
            let user = await GoogleSign.findOne({ email: payload.email });

            if (!user) {
                user = await GoogleSign.create({
                    name: payload.name || "",
                    email: payload.email,
                    googleId: payload.sub,
                    authProvider: "google",
                    role: 1, // default role = mentee
                    isVerified: true,
                    isActive: true,
                    profile: payload.picture,
                    isProfileCompleted: false, // optional, can track profile completion
                });
                console.log("✅ New Google user created");
            }

            // 3️⃣ Generate JWT
            const jwtToken = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            // 4️⃣ Send response
            return res.status(200).json({
                success: true,
                token: jwtToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profile: user.profile,
                    isProfileCompleted: user.isProfileCompleted,
                },
            });

        } catch (error) {
            console.error("❌ Google Login Error:", error);
            return res.status(401).json({ success: false, message: "Invalid Google token" });
        }
    }
}

export default GooglesignController;
