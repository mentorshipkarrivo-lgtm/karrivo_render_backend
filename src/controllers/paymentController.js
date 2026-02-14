// menteePaymentController.js
import MenteePayment from "../models/payment.js";
import Booking from "../models/sessions.js"
import helper from "../helper/helper.js";
import path from "path";
import fs from "fs";

class MenteePaymentController {
    static async addPayment(req, res, next) {
        try {
            const { paymentAmount, transactionId, mentorId, mentorName } = req.body;
            const { id, name } = req.user;

            // Validate screenshot upload
            if (!req.files?.screenshot) {
                return helper.failed(
                    res,
                    "Please Provide Payment Screenshot",
                    {},
                    400
                );
            }

            // Check if Transaction ID already exists
            const existingPayment = await MenteePayment.findOne({ transactionId });
            if (existingPayment) {
                return helper.failed(res, "Transaction ID already exists", {}, 400);
            }

            // Validate required fields
            if (!paymentAmount)
                return helper.failed(res, "Please Provide Payment Amount", {}, 400);

            if (!transactionId)
                return helper.failed(res, "Please Provide Transaction ID", {}, 400);

            if (!mentorId)
                return helper.failed(res, "Please Provide Mentor ID", {}, 400);

            if (!mentorName)
                return helper.failed(res, "Please Provide Mentor Name", {}, 400);

            // Screenshot handling - Save locally
            const screenshotFile = req.files.screenshot;

            // Create uploads directory if it doesn't exist
            const uploadDir = path.join(process.cwd(), 'uploads', 'payment-screenshots');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Generate unique filename
            const fileExtension = path.extname(screenshotFile.name);
            const uniqueFilename = `payment_${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
            const filePath = path.join(uploadDir, uniqueFilename);

            // Move file to uploads directory
            await screenshotFile.mv(filePath);

            // Store relative path in database
            const screenshotUrl = `/uploads/payment-screenshots/${uniqueFilename}`;

            // Create payment record
            const newPayment = new MenteePayment({
                menteeId: id,
                menteeName: name,
                mentorId,
                mentorName,
                transactionId,
                paymentAmount,
                transactionDate: new Date(),
                paymentStatus: "Pending",
                screenshotUrl,
                createdBy: id,
                currency: "INR",
            });

            const savedPayment = await newPayment.save();

            return helper.success(
                res,
                "Payment Submitted Successfully. Your booking will be confirmed once payment is verified.",
                savedPayment
            );
        } catch (error) {
            next(error);
        }
    }

    // Get payment status
    static async getPaymentStatus(req, res, next) {
        try {
            const { transactionId } = req.params;
            const { id } = req.user;

            const payment = await MenteePayment.findOne({
                transactionId,
                menteeId: id
            });

            if (!payment) {
                return helper.failed(res, "Payment not found", {}, 404);
            }

            return helper.success(res, "Payment details retrieved", payment);
        } catch (error) {
            next(error);
        }
    }

    // Admin: Verify payment
    static async verifyPayment(req, res, next) {
        try {
            const { paymentId, status } = req.body; // status: "Approved" or "Rejected"

            const payment = await MenteePayment.findById(paymentId);
            if (!payment) {
                return helper.failed(res, "Payment not found", {}, 404);
            }

            payment.paymentStatus = status;
            payment.verifiedAt = new Date();
            await payment.save();

            // If approved, update booking status
            if (status === "Approved") {
                await Booking.findOneAndUpdate(
                    { transactionId: payment.transactionId },
                    {
                        status: "Confirmed",
                        paymentVerified: true
                    }
                );
            }

            return helper.success(
                res,
                `Payment ${status.toLowerCase()} successfully`,
                payment
            );
        } catch (error) {
            next(error);
        }
    }
}

export default MenteePaymentController;