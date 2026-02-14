import mongoose from "mongoose";

const { Schema, model } = mongoose;

const GoogleSignSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: function () {
                return this.authProvider === "local";
            },
        },
        phone: {
            type: String,
            required: function () {
                return this.authProvider === "local";
            },
        },
        countryCode: {
            type: Number,
            required: function () {
                return this.authProvider === "local";
            },
        },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
            required: true,
        },
        googleId: { type: String, sparse: true },
        role: { type: Number, enum: [1, 2], default: 1 }, // 1 = mentee, 2 = mentor
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        profile: { type: String }, // profile picture
    },
    { timestamps: true }
);

const GoogleSign = model("googleSingin", GoogleSignSchema);
export default GoogleSign;
