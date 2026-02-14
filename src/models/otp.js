import mongoose from "mongoose";

const { Schema, model } = mongoose;

const otpSchema = new Schema(
  {
    otp: {
      type: Number,
      required: true,
    },
    otpType: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    expireTime: {
      type: Date,
      required: true,
      default: () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 10);
        return now;
      },
    },
    tempData: { type: Object },
  },
  { timestamps: true }
);

otpSchema.pre("save", async function () {  // ← Removed 'next' parameter
  const ISTOffset = 5.5 * 60 * 60 * 1000;
  this.createdAt = new Date(Date.now() + ISTOffset);
  this.updatedAt = new Date(Date.now() + ISTOffset);
  // ← Removed next() call
});

const Otp = model("Otp", otpSchema);

export default Otp;