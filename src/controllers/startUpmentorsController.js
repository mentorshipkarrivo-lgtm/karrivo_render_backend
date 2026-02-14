
import Mentors from "../models/mentor.js";

import helper from "../helper/helper.js";

class StartupMentorsController {

    static async getAllMentors(req, res) {
        try {
            const {
                experience,
                status,
                minPrice,
                maxPrice,
                languages,
                search,
                page = 1,
                limit = 20
            } = req.query;

            const filter = {};

            // -----------------------------
            // DEFAULT → only approved mentors
            // -----------------------------
            filter.status = status ? status : "approved";

            // -----------------------------
            // Force category → Startup Mentors only
            // -----------------------------
            filter.mentorCategory = "Startup Mentors";

            // -----------------------------
            // Experience filter
            // -----------------------------
            if (experience && experience !== "All") {
                if (experience === "0-5 years") {
                    filter.yearsOfExperience = { $gte: 0, $lte: 5 };
                } else if (experience === "5-10 years") {
                    filter.yearsOfExperience = { $gte: 5, $lte: 10 };
                } else if (experience === "10-15 years") {
                    filter.yearsOfExperience = { $gte: 10, $lte: 15 };
                } else if (experience === "15+ years") {
                    filter.yearsOfExperience = { $gte: 15 };
                }
            }

            // -----------------------------
            // Price filter (hourlyRate)
            // -----------------------------
            if (minPrice || maxPrice) {
                filter.hourlyRate = {};
                if (minPrice) filter.hourlyRate.$gte = Number(minPrice);
                if (maxPrice) filter.hourlyRate.$lte = Number(maxPrice);
            }

            // -----------------------------
            // Languages filter
            // -----------------------------
            if (languages) {
                const arr = languages.split(",").map(l => l.trim());
                filter.languages = { $in: arr };
            }

            // -----------------------------
            // Search filter
            // -----------------------------
            if (search && search.trim() !== "") {
                const regex = new RegExp(search, "i");

                filter.$or = [
                    { fullName: regex },
                    { startupIndustry: regex },
                    { currentRole: regex },
                    { companyName: regex },
                    { expertise: regex },
                    { achievements: regex },
                    { location: regex }
                ];
            }

            // -----------------------------
            // Pagination setup
            // -----------------------------
            const skip = (page - 1) * limit;

            // -----------------------------
            // Fetch mentors
            // -----------------------------
            const mentors = await Mentors.find(filter)
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            const total = await Mentors.countDocuments(filter);

            return helper.success(res, "Startup mentors fetched successfully", {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
                data: mentors
            });

        } catch (error) {
            console.error("Error fetching startup mentors →", error);
            return helper.failed(res, "Error fetching startup mentors", error.message);
        }
    }

}

export default StartupMentorsController;






