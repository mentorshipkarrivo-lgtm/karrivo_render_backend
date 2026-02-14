import bcrypt from "bcrypt";
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        name: { type: String, required: true },

        role: {
            type: Number, // 0 = admin, 1 = user, 2 = admin with custom permission
            required: true,
            default: 1,
        },

        email: { type: String, required: true },
        password: { type: String, required: true },

        country: { type: String, default: "N/A" },
        city: { type: String, default: "N/A" },
        state: { type: String, default: "N/A" },
        address: { type: String, default: "N/A" },

        isActive: { type: Boolean, default: false },
        isBlock: { type: Boolean, default: false },

        phone: { type: Number, required: true },
        countryCode: { type: Number, required: true },

        referenceId: { type: String, default: "" },
        referenceInr: { type: Number, default: 0 },
        referenceCount: { type: Number, default: 0 },

        username: { type: String, default: "" },
        isVerified: { type: Boolean, default: false },
        forgotReq: { type: Boolean, default: false },

        loginTime: {
            type: Number,
            default: () => Math.floor(Date.now() / 1000),
        },

        Inr: { type: Number, default: 0 },



        is_Deleted: { type: Boolean, default: false },

        profile: { type: String, default: "" },

        permissions: { type: [String], default: [] },

        fcm_token: { type: String, default: "" },


        // Invoices list
        invoices: {
            type: [
                {
                    invoiceNo: { type: String, required: true },
                    amount: { type: Number, required: true },
                    coins: { type: Number },
                    currencyType: { type: String, default: "INR" },
                    status: {
                        type: String,
                        enum: ["pending", "completed", "failed", "cancelled"],
                        default: "pending",
                    },
                    orderDate: { type: Date, default: Date.now },
                    invoiceDate: { type: Date, default: Date.now },
                    invoiceUrl: { type: String, default: "" },
                },
            ],
            default: [],
        },

        // Blockchain wallet fields
        privateKey: { type: String, unique: true, sparse: true },
        walletadress: { type: String, unique: true, sparse: true },
        seedPhrase: { type: String, unique: true, sparse: true },

        pin: { type: String },

        securityQuestions: [
            {
                question: String,
                answer: String,
            },
        ],

        // Migration
        isMigrated: { type: Boolean, default: false },
        migrationDate: { type: Date },
        migrationTxHash: { type: String },
        preMigrationTokenBalance: { type: Number },

        // Dates
        registeredDate: { type: Date },
        activeDate: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Hashing Password, Pin & Security Answers
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }

    if (this.isModified("pin") && this.pin) {
        this.pin = await bcrypt.hash(this.pin, 12);
    }

    if (this.isModified("securityQuestions")) {
        for (let q of this.securityQuestions) {
            if (q.answer && !q.answer.startsWith("$2b$")) {
                q.answer = await bcrypt.hash(q.answer, 12);
            }
        }
    }

    // IST timezone
    const ISTOffset = 5.5 * 60 * 60 * 1000;
    this.createdAt = new Date(Date.now() + ISTOffset);
    this.updatedAt = new Date(Date.now() + ISTOffset);

    next();
});

const User = model("User", userSchema);
export default User;
