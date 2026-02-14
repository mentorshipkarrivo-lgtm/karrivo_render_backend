import Mentors from '../models/mentor.js';
import { validationResult } from 'express-validator';
import helper from '../helper/helper.js';
import User from '../models/users.js';
import emailService from '../helper/emailService.js';

class MentorController {

    // Submit mentee application
    static async submitApplication(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return helper.failed(res, "Validation failed", errors.array());
            }

            const body = req.body || {};
            const {
                fullName, email, phone, dateOfBirth, location, motivationStatement,
                areasOfInterest, mentoringStyle, mentoringFrequency, timeSlots,
                linkedinUrl, instagramUrl, alternativeEmail,
                highestDegree, fieldOfStudy, schoolName, additionalCourses,
                currentRole, companyName, yearsOfExperience, currentSkills,
                resumeLink, introVideoLink, whyMentor, greatestAchievement, featuredArticle,
                agreeToTerms, consentToShare,
            } = body;

            // if (!fullName || !email ) {
            //     return helper.failed(res, "Missing required fields");
            // }

            // Check if email already exists
            const existingApplication = await Mentors.findOne({ email });
            if (existingApplication) {
                return helper.failed(res, "An application with this email already exists", { email });
            }

            const menteeApplication = await Mentors.create({
                fullName, email, phone, dateOfBirth, location, motivationStatement,
                areasOfInterest, mentoringStyle, mentoringFrequency, timeSlots,
                linkedinUrl, instagramUrl, alternativeEmail,
                highestDegree, fieldOfStudy, schoolName, additionalCourses,
                currentRole, companyName, yearsOfExperience, currentSkills,
                resumeLink, introVideoLink, whyMentor, greatestAchievement, featuredArticle,
                agreeToTerms, consentToShare,
                status: 'pending',
                submittedAt: new Date(),
            });



            await emailService.sendApplicationSubmittedMail(email, fullName);


            return helper.success(res, "Application submitted successfully", menteeApplication);

        } catch (error) {
            next(error);
        }
    }

    // Get all mentee applications (Admin)
    static async getAllApplications(req, res, next) {
        try {
            const { status, page = 1, limit = 10, sortBy = 'submittedAt' } = req.query;

            const query = {};
            if (status) query.status = status;

            const applications = await Mentors.find(query)
                .sort({ [sortBy]: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .select('-whyMentor -greatestAchievement');

            const count = await Mentors.countDocuments(query);

            return helper.success(res, "Applications fetched successfully", {
                data: applications,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                total: count,
            });

        } catch (error) {
            next(error);
        }
    }

    // Get single mentee application by ID
    static async getApplicationById(req, res, next) {
        try {
            const application = await Mentors.findById(req.params.id);
            if (!application) return helper.failed(res, "Application not found");

            return helper.success(res, "Application fetched successfully", application);

        } catch (error) {
            next(error);
        }
    }

    // Update application status
    static async updateApplicationStatus(req, res, next) {
        try {
            const { status } = req.body;
            const validStatuses = ['pending', 'approved', 'onhold', 'under_review', 'rejected'];

            if (!validStatuses.includes(status)) {
                return helper.failed(res, "Invalid status");
            }

            const application = await Mentors.findByIdAndUpdate(
                req.params.id,
                { status, updatedAt: new Date() },
                { new: true, runValidators: true }
            );

            if (!application) return helper.failed(res, "Application not found");

            return helper.success(res, "Status updated successfully", application);

        } catch (error) {
            next(error);
        }
    }

    static async approveRejectApplication(req, res, next) {
        try {
            const { action, reason } = req.body;
            const { id } = req.params;
            console.log(id, "id")

            if (!action) {
                return helper.failed(res, "Action is required");
            }

            if (!['approve', 'reject', 'onhold'].includes(action)) {
                return helper.failed(res, "Invalid action. Must be one of: approve, reject, onhold");
            }

            const application = await Mentors.findById(id);
            if (!application) {
                return helper.failed(res, "Application not found");
            }

            if (['approved', 'rejected'].includes(application.status)) {
                return helper.failed(res, "Application already finalized");
            }

            const statusMap = {
                approve: 'approved',
                reject: 'rejected',
                onhold: 'onhold'
            };

            const newStatus = statusMap[action];

            if (action === 'approve') {
                try {
                    const existingUser = await User.findOne({ email: application.email });
                    if (existingUser) {
                        return helper.failed(res, "User already exists with this email");
                    }

                    const tempPassword = helper.generateRandomPassword(12);
                    // const hashedPassword = await bcrypt.hash(tempPassword, 12);



                    const username = await helper.generateUniqueUsername(application.fullName);

                    // console.log("NEW MENTOR CREDENTIALS:", {
                    //     email: application.email,
                    //     username: username,
                    //     password: tempPassword
                    // });


                    // Generate reset token using helper method (charset method)
                    const resetToken = helper.generateResetToken(64);
                    const hashedResetToken = helper.hashToken(resetToken);

                    // Create new user
                    const newUser = await User.create({
                        name: application.fullName,
                        role: 2, // Mentor role
                        email: application.email,
                        password: tempPassword,
                        mentorId: id,
                        phone: application.phone,
                        countryCode: 91, // Default to India, adjust as needed
                        username,
                        isActive: true,
                        isBlock: false,
                        isVerified: true, // Will be verified after password reset
                        registeredDate: new Date(),
                        profile: application.profileImage || "",
                        forgotReq: true // Mark as password reset requested
                    });

                    // Update mentee application
                    const updatedApplication = await Mentors.findByIdAndUpdate(
                        id,
                        {
                            status: 'approved',
                            isActive: true,
                            userId: newUser._id,
                            accountCreated: true,
                            tempPassword: tempPassword, // Store for reference
                            resetPasswordToken: hashedResetToken,
                            resetPasswordExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
                            updatedAt: new Date()
                        },
                        { new: true, runValidators: true }
                    ).select('-resetPasswordToken -tempPassword');
                    console.log({
                        email: application.email,
                        fullName: application.fullName,
                        resetToken: resetToken,
                        tempPassword: tempPassword,
                        message: "sendemail"
                    });
                    await emailService.sendMentorApprovalEmail({
                        fullName: application.fullName,
                        email: application.email,
                        username: username,
                        tempPassword: tempPassword,
                        resetLink: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
                    });


                    return helper.success(
                        res,
                        "Application approved successfully. Password reset email sent to mentor.",
                        {
                            application: updatedApplication,
                            user: {
                                id: newUser._id,
                                email: newUser.email,
                                username: newUser.username
                            }
                        }
                    );

                } catch (err) {
                    console.error("Approval error:", err);

                    // Rollback mentee status
                    await Mentors.findByIdAndUpdate(id, {
                        status: 'pending',
                        isActive: false,
                        userId: null,
                        accountCreated: false,
                        resetPasswordToken: null,
                        resetPasswordExpires: null,
                        tempPassword: null
                    });

                    return helper.failed(res, "Failed to approve application: " + err.message);
                }
            }

            // 🔴 REJECT FLOW
            if (action === 'reject') {
                const updatedApplication = await Mentors.findByIdAndUpdate(
                    id,
                    {
                        status: 'rejected',
                        isActive: false,
                        updatedAt: new Date()
                    },
                    { new: true, runValidators: true }
                );

                // Send rejection email
                await helper.sendMentorRejectionEmail({
                    email: application.email,
                    fullName: application.fullName,
                    reason: reason || ''
                });

                return helper.success(
                    res,
                    "Application rejected successfully",
                    updatedApplication
                );
            }

            // 🟡 ON HOLD FLOW
            if (action === 'onhold') {
                const updatedApplication = await Mentors.findByIdAndUpdate(
                    id,
                    {
                        status: 'onhold',
                        updatedAt: new Date()
                    },
                    { new: true, runValidators: true }
                );

                return helper.success(
                    res,
                    "Application moved to ON HOLD",
                    updatedApplication
                );
            }

        } catch (error) {
            console.error("approveRejectApplication error:", error);
            next(error);
        }
    }

    // Password reset endpoint
    static async resetPassword(req, res, next) {
        try {
            const { token, email, newPassword } = req.body;

            // Validation
            if (!token || !email || !newPassword) {
                return helper.failed(res, "Token, email, and new password are required");
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return helper.failed(res, "Invalid email format");
            }

            // Validate password strength
            if (newPassword.length < 8) {
                return helper.failed(res, "Password must be at least 8 characters long");
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
            if (!passwordRegex.test(newPassword)) {
                return helper.failed(res, "Password must contain at least one uppercase letter, one lowercase letter, and one number");
            }

            // Hash the token to compare using helper method
            const hashedToken = helper.hashToken(token);

            // Find application with valid token
            const application = await Mentors.findOne({
                email,
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!application) {
                return helper.failed(res, "Invalid or expired reset token");
            }

            // Find and update user
            const user = await User.findById(application.userId);
            if (!user) {
                return helper.failed(res, "User not found");
            }

            // Update user password (will be hashed by pre-save hook)
            user.password = newPassword;
            user.isVerified = true;
            user.forgotReq = false;
            await user.save();

            // Clear reset token
            application.resetPasswordToken = undefined;
            application.resetPasswordExpires = undefined;
            application.tempPassword = undefined;
            await application.save();

            return helper.success(res, "Password reset successful. You can now login with your new password.");

        } catch (error) {
            console.error("Reset password error:", error);
            next(error);
        }
    }
    // Delete application
    static async deleteApplication(req, res, next) {
        try {
            const application = await Mentors.findByIdAndDelete(req.params.id);
            if (!application) return helper.failed(res, "Application not found");

            return helper.success(res, "Application deleted successfully");

        } catch (error) {
            next(error);
        }
    }




    static async getMentorById(req, res) {
        try {
            const { mentorId } = req.params;

            if (!mentorId) {
                return res.status(400).json({
                    success: false,
                    message: "Mentor ID is required"
                });
            }


            const mentor = await Mentors.findOne({
                _id: mentorId,
            }).select('-password -__v');

            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: "Mentor not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: mentor
            });

        } catch (error) {
            console.error("Error fetching mentor:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch mentor",
                error: error.message
            });
        }
    };


    // Get top mentors
    static async getTopMentors(req, res, next) {
        try {
            const { limit } = req.query;

            console.log(limit, "limit222")

            const topMentors = await Mentors.find({
                status: 'approved',
                isActive: true,
            })
                .sort({
                    yearsOfExperience: -1,
                    submittedAt: -1
                })
                .limit(parseInt(limit));

            return helper.success(
                res,
                "Top mentors fetched successfully",
                topMentors
            );

        } catch (error) {
            next(error);
        }
    }



    static async getMentorDetails(req, res) {
        try {
            const { menteeType } = req.body; 
            console.log(menteeType, "mentorCategory")
            // Validation
            if (!menteeType) {
                return res.status(400).json({
                    success: false,
                    message: "mentorCategory is required",
                });
            }

            // Find all mentors with this category
            const mentors = await Mentors.find({ menteeType, isDeleted: false })
                .select("-__v -password") // remove unwanted fields
                .lean();


            return res.status(200).json({
                success: true,
                data: mentors, // could be [] if none found
                message: mentors.length === 0 ? "No mentors found for this category" : "Mentors fetched successfully",
            });

        } catch (error) {
            console.error("Error fetching mentors by category:", error);
            return res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    }


    static async updateMentorDetails(req, res) {
        try {
            const { email, ...updateData } = req.body; // ✅ Destructure email separately


            console.log(email, "updated data");


            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required",
                });
            }


            // Prevent updating restricted fields
            delete updateData._id;
            delete updateData.email;
            delete updateData.password;
            delete updateData.role;



            // Update mentor
            const updatedMentor = await Mentors.findOneAndUpdate(
                { email },
                { $set: updateData },
                { new: true, runValidators: true }
            )
                .select("-__v")
                .lean();

            if (!updatedMentor) {
                return res.status(404).json({
                    success: false,
                    message: "Mentor not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Mentor details updated successfully",
                data: updatedMentor,
            });

        } catch (error) {
            console.error("Error updating mentor details:", error);
            return res.status(500).json({
                success: false,
                message: "Server error",
            });
        }
    }


    static async searchMentors(req, res) {
        try {
            const { q } = req.query;
            console.log("SEARCH QUERY:", q);

            if (!q || !q.trim()) {
                return res.json({ success: true, data: [] });
            }

            // Create case-insensitive regex for partial matching
            const regex = new RegExp(q.trim(), "i");
            console.log("REGEX:", regex);

            const mentors = await Mentors.find({
                status: "approved",
                isActive: true,
                isBlock: false,
                $or: [
                    { fullName: { $regex: regex } },
                    { areasOfInterest: { $regex: regex } },
                    { mentorCategory: { $regex: regex } },
                    { fieldOfStudy: { $regex: regex } },
                    { currentRole: { $regex: regex } },
                    { currentSkills: { $regex: regex } },
                    { companyName: { $regex: regex } },
                    { location: { $regex: regex } }
                ]
            });

            console.log("RESULT COUNT:", mentors.length);

            return res.json({
                success: true,
                count: mentors.length,
                data: mentors
            });
        } catch (err) {
            console.error("SEARCH ERROR:", err);
            res.status(500).json({
                success: false,
                message: "Error searching mentors"
            });
        }
    }




}

export default MentorController;


