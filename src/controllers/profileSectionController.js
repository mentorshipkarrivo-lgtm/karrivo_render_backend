import UserProfile from "../models/menteeProfile.js"
import User from "../models/users.js";
import sessions from "../models/sessions.js";

class ProfileController {



    static async getMenteeDashboard(req, res) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required"
                });
            }

            // 1️⃣ Fetch mentee profile
            const profile = await UserProfile.findOne({ userId }).lean();

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: "Profile not found"
                });
            }

            // 2️⃣ Fetch mentors directly from Users (NO profile join)
            const mentors = await User.find({ role: 2 })
                .select("name email phone city country _id")
                .limit(10)
                .lean();

            const enrichedMentors = mentors.map(mentor => {
                const initials = mentor.name
                    ? mentor.name.split(" ").map(n => n[0]).join("").toUpperCase()
                    : "M";

                return {
                    id: mentor._id,
                    name: mentor.name,
                    email: mentor.email,
                    phone: mentor.phone,
                    city: mentor.city,
                    country: mentor.country,
                    initials
                };
            });

            // 3️⃣ Fetch sessions
            let allSessions = [];
            let upcomingSessions = [];
            let stats = {
                totalSessions: 0,
                activeMentors: 0,
                hoursLearned: 0,
                totalInvestment: 0,
                monthlyGrowth: {
                    sessions: 0,
                    mentors: 0,
                    hours: 0
                }
            };

            try {
                allSessions = await sessions.find({ menteeId: userId }).lean();

                const now = new Date();

                upcomingSessions = allSessions
                    .filter(s => new Date(s.sessionDate) > now)
                    .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))
                    .slice(0, 3)
                    .map(s => ({
                        id: s._id,
                        title: s.title || "Mentorship Session",
                        mentorName: s.mentorName || "Mentor",
                        mentorInitials: s.mentorName
                            ? s.mentorName.split(" ").map(n => n[0]).join("").toUpperCase()
                            : "M",
                        mentorId: s.mentorId,
                        date: s.sessionDate,
                        time: s.sessionTime || "TBD",
                        status: s.status || "scheduled"
                    }));

                const uniqueMentors = new Set(
                    allSessions.map(s => s.mentorId?.toString()).filter(Boolean)
                );

                const totalHours = allSessions.reduce(
                    (sum, s) => sum + ((s.durationMinutes || 0) / 60),
                    0
                );

                const totalAmount = allSessions.reduce(
                    (sum, s) => sum + (s.amountPaid || 0),
                    0
                );

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const recentSessions = allSessions.filter(
                    s => new Date(s.createdAt || s.sessionDate) > thirtyDaysAgo
                );

                stats = {
                    totalSessions: allSessions.length,
                    activeMentors: uniqueMentors.size,
                    hoursLearned: Math.round(totalHours),
                    totalInvestment: totalAmount,
                    monthlyGrowth: {
                        sessions: recentSessions.length,
                        mentors: new Set(
                            recentSessions.map(s => s.mentorId?.toString()).filter(Boolean)
                        ).size,
                        hours: Math.round(
                            recentSessions.reduce(
                                (sum, s) => sum + ((s.durationMinutes || 0) / 60),
                                0
                            )
                        )
                    }
                };

            } catch (sessionError) {
                console.warn("⚠️ Sessions fetch failed:", sessionError.message);
            }

            // 4️⃣ Fetch recent activity
            let recentActivity = [];

            try {
                if (typeof Activity !== "undefined") {
                    const activities = await Activity.find({ userId })
                        .sort({ createdAt: -1 })
                        .limit(4)
                        .lean();

                    recentActivity = activities.map(a => ({
                        action: a.action || a.description,
                        timestamp: a.createdAt,
                        type: a.type || "activity"
                    }));
                } else {
                    recentActivity = allSessions
                        .sort((a, b) => new Date(b.createdAt || b.sessionDate) - new Date(a.createdAt || a.sessionDate))
                        .slice(0, 4)
                        .map(s => ({
                            action: `Session: ${s.title || "Mentorship Session"}`,
                            timestamp: s.createdAt || s.sessionDate,
                            type: s.status === "completed" ? "session_completed" : "session_scheduled",
                            mentorId: s.mentorId
                        }));
                }
            } catch (err) {
                recentActivity = [];
            }

            // 5️⃣ Response
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        name: profile.fullName,
                        email: profile.email,
                        phone: profile.phone,
                        city: profile.city,
                        country: profile.country,
                        role: profile.role
                    },
                    stats,
                    mentors: enrichedMentors,
                    upcomingSessions,
                    recentActivity,
                    profileCompleted: profile.profileCompleted || false
                },
                message: "Dashboard data fetched successfully"
            });

        } catch (error) {
            console.error("❌ Dashboard error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch dashboard data"
            });
        }
    }


    // static async saveProfile(req, res) {
    //     try {
    //         const { userId } = req.body; // ideally from auth middleware

    //         const updateData = {
    //             ...req.body
    //         };

    //         // attach resume if uploaded
    //         if (req.file?.path) {
    //             updateData.resumeUrl = req.file.path;
    //         }

    //         const profile = await UserProfile.findOneAndUpdate(
    //             { userId },
    //             { $set: updateData },
    //             { new: true, upsert: true }
    //         );

    //         return res.status(200).json({
    //             success: true,
    //             message: "Profile saved successfully",
    //             profile
    //         });

    //     } catch (error) {
    //         return res.status(500).json({
    //             success: false,
    //             message: error.message
    //         });
    //     }
    // }




    // Get Profile
    static async getProfile(req, res) {
        try {
            const { userId } = req.params;

            const profile = await UserProfile.findOne({ userId });

            if (!profile) {
                return res.status(200).json({
                    success: true,
                    profile: null,
                    message: "Profile not found"
                });
            }

            res.status(200).json({
                success: true,
                profile,
                message: "Profile fetched successfully"
            });

        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Save/Update Profile
    static async saveProfile(req, res) {
        try {
            const {
                userId,
                // About section
                fullName,
                email,
                phone,
                city,
                country,
                state,
                linkedinUrl,
                // Experience section
                domain,
                role,
                yearsOfExperience,
                currentCompany,
                previousCompanies,
                skills,
                about,
                availability,
                timezone,
                // Education section
                highestEducation,
                schoolCollegeName,
                // Goals section
                goals,
                targetDomains,
                targetCompanies,
                prepTimeline,
                expectations,
                // Resume
                resumeUrl
            } = req.body;

            console.log('📥 Received save request for userId:', userId);
            console.log('📦 Request body:', req.body);

            // Validation
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required"
                });
            }

            // Prepare update data - only include fields that are provided and not empty
            const updateData = { userId }; // Always include userId

            // Helper function to check if value is valid (not null, undefined, or empty string)
            const isValid = (value) => {
                if (value === null || value === undefined) return false;
                if (typeof value === 'string' && value.trim() === '') return false;
                if (Array.isArray(value) && value.length === 0) return false;
                return true;
            };

            // About section
            if (isValid(fullName)) updateData.fullName = fullName.trim();
            if (isValid(email)) updateData.email = email.trim().toLowerCase();
            if (isValid(phone)) updateData.phone = phone.trim();
            if (isValid(city)) updateData.city = city.trim();
            if (isValid(country)) updateData.country = country.trim();
            if (isValid(state)) updateData.state = state.trim();
            if (isValid(linkedinUrl)) updateData.linkedinUrl = linkedinUrl.trim();

            // Experience section
            if (isValid(domain)) updateData.domain = domain.trim();
            if (isValid(role)) updateData.role = role.trim();
            if (yearsOfExperience !== undefined && yearsOfExperience !== null) {
                updateData.yearsOfExperience = Number(yearsOfExperience);
            }
            if (isValid(currentCompany)) updateData.currentCompany = currentCompany.trim();
            if (Array.isArray(previousCompanies)) {
                updateData.previousCompanies = previousCompanies.filter(c => c && c.trim()).map(c => c.trim());
            }
            if (Array.isArray(skills)) {
                updateData.skills = skills.filter(s => s && s.trim()).map(s => s.trim());
            }
            if (isValid(about)) updateData.about = about.trim();
            if (isValid(availability)) updateData.availability = availability.trim();
            if (isValid(timezone)) updateData.timezone = timezone.trim();

            // Education section
            if (isValid(highestEducation)) updateData.highestEducation = highestEducation.trim();
            if (isValid(schoolCollegeName)) updateData.schoolCollegeName = schoolCollegeName.trim();

            // Goals section
            if (isValid(goals)) updateData.goals = goals.trim();
            if (Array.isArray(targetDomains)) {
                updateData.targetDomains = targetDomains.filter(d => d && d.trim()).map(d => d.trim());
            }
            if (Array.isArray(targetCompanies)) {
                updateData.targetCompanies = targetCompanies.filter(c => c && c.trim()).map(c => c.trim());
            }
            if (isValid(prepTimeline)) updateData.prepTimeline = prepTimeline.trim();
            if (isValid(expectations)) updateData.expectations = expectations.trim();

            // Resume
            if (isValid(resumeUrl)) updateData.resumeUrl = resumeUrl.trim();

            console.log('✅ Prepared update data:', updateData);

            // Calculate profile completion based on actual data in updateData
            const requiredFields = [
                updateData.fullName,
                updateData.email,
                updateData.phone,
                updateData.domain,
                updateData.role,
                updateData.yearsOfExperience !== undefined && updateData.yearsOfExperience !== null,
                updateData.highestEducation,
                updateData.schoolCollegeName,
                updateData.goals,
                updateData.expectations
            ];

            const completedFieldsCount = requiredFields.filter(field => {
                if (typeof field === 'boolean') return field;
                return field !== undefined && field !== null && field !== '';
            }).length;

            updateData.profileCompleted = completedFieldsCount >= 8; // At least 8 out of 10 required fields

            console.log(`📊 Profile completion: ${completedFieldsCount}/10 fields completed`);

            // Update or create profile
            const profile = await UserProfile.findOneAndUpdate(
                { userId },
                { $set: updateData },
                {
                    new: true, // Return updated document
                    upsert: true, // Create if doesn't exist
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );

            console.log('💾 Profile saved successfully:', profile._id);

            res.status(200).json({
                success: true,
                profile,
                message: "Profile saved successfully"
            });

        } catch (error) {
            console.error('❌ Error saving profile:', error);

            // Handle duplicate key error
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: "Profile already exists for this user"
                });
            }

            // Handle validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || "Failed to save profile"
            });
        }
    }


    static async uploadProfilePhoto(req, res) {
        try {
            const { userId } = req.body;
            const file = req.file;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required"
                });
            }

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }

            // Create unique filename
            const filename = `profile-photos/${userId}-${Date.now()}${path.extname(file.originalname)}`;

            // Create file in Firebase Storage
            const fileUpload = bucket.file(filename);

            // Create write stream
            const stream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                    metadata: {
                        firebaseStorageDownloadTokens: Date.now()
                    }
                },
                resumable: false
            });

            // Handle stream errors
            stream.on('error', (error) => {
                console.error('Upload error:', error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload photo"
                });
            });

            // Handle successful upload
            stream.on('finish', async () => {
                try {
                    // Make file publicly accessible
                    await fileUpload.makePublic();

                    // Get public URL
                    const profilePhotoUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

                    console.log('📸 Photo uploaded:', profilePhotoUrl);

                    // Update profile with photo URL
                    const profile = await UserProfile.findOneAndUpdate(
                        { userId },
                        { $set: { profilePhotoUrl } },
                        { new: true, upsert: true }
                    );

                    res.status(200).json({
                        success: true,
                        profile,
                        profilePhotoUrl,
                        message: "Photo uploaded successfully"
                    });
                } catch (error) {
                    console.error('Error updating profile:', error);
                    res.status(500).json({
                        success: false,
                        message: "Photo uploaded but failed to update profile"
                    });
                }
            });

            // Write buffer to stream
            stream.end(file.buffer);

        } catch (error) {
            console.error('❌ Error uploading photo:', error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to upload photo"
            });
        }
    }

    // Delete Profile Photo
    static async deleteProfilePhoto(req, res) {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required"
                });
            }

            // Get current profile to find photo URL
            const currentProfile = await UserProfile.findOne({ userId });

            if (currentProfile?.profilePhotoUrl) {
                try {
                    // Extract filename from URL
                    const urlParts = currentProfile.profilePhotoUrl.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    const filePath = `profile-photos/${filename}`;

                    // Delete from Firebase Storage
                    await bucket.file(filePath).delete();
                    console.log('🗑️ Photo deleted from Firebase:', filePath);
                } catch (storageError) {
                    console.error('Storage deletion error:', storageError);
                    // Continue even if storage deletion fails
                }
            }

            // Remove photo URL from database
            const profile = await UserProfile.findOneAndUpdate(
                { userId },
                { $unset: { profilePhotoUrl: "" } },
                { new: true }
            );

            res.status(200).json({
                success: true,
                profile,
                message: "Photo removed successfully"
            });

        } catch (error) {
            console.error('❌ Error deleting photo:', error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to delete photo"
            });
        }
    }

}

export default ProfileController;
