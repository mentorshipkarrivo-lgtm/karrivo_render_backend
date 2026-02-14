

import Mentors from '../models/mentor.js';
import helper from '../helper/helper.js';

class EngineeringMentorsController {
    
    static async getAllMentors(req, res, next) {
        try {
            const {
                mentorCategory,
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

            // Default: Only approved mentors
            filter.status = status ? status : "approved";

            // Category filter
            if (mentorCategory && mentorCategory !== "All") {
                filter.mentorCategory = mentorCategory;
            }

            // Experience filter
            if (experience && experience !== "All") {
                if (experience === "0-5 years") {
                    filter.yearsOfExperience = { $gte: "0", $lte: "5" };
                } else if (experience === "5-10 years") {
                    filter.yearsOfExperience = { $gte: "5", $lte: "10" };
                } else if (experience === "10-15 years") {
                    filter.yearsOfExperience = { $gte: "10", $lte: "15" };
                } else if (experience === "15+ years") {
                    filter.yearsOfExperience = { $gte: "15" };
                }
            }

            // Price filter (if you add hourlyRate in schema)
            if (minPrice || maxPrice) {
                filter.hourlyRate = {};
                if (minPrice) filter.hourlyRate.$gte = parseFloat(minPrice);
                if (maxPrice) filter.hourlyRate.$lte = parseFloat(maxPrice);
            }

            // Languages filter (if you add languages in schema)
            if (languages) {
                const arr = languages.split(",").map(x => x.trim());
                filter.languages = { $in: arr };
            }

            // Search filter
            if (search && search.trim() !== "") {
                const regex = new RegExp(search, "i");

                filter.$or = [
                    { fullName: regex },
                    { currentRole: regex },
                    { companyName: regex },
                    { currentSkills: regex },
                    { areasOfInterest: regex },
                    { fieldOfStudy: regex },
                    { location: regex }
                ];
            }

            // Pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Fetch mentors
            const mentors = await Mentors.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

            const total = await Mentors.countDocuments(filter);

            return helper.success(res, "All mentors fetched", {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
                data: mentors
            });

        } catch (error) {
            console.error("Error fetching mentors:", error);
            return helper.failed(res, "Error fetching mentors", error.message);
        }
    }



    // -----------------------------------------------------
    // GET MENTORS BY CATEGORY ONLY
    // -----------------------------------------------------
    static async getMentorsByCategory(req, res, next) {
        try {
            const { category } = req.query;
            const { page = 1, limit = 20 } = req.query;

            if (!category) {
                return helper.failed(res, "Category is required");
            }

            const filter = {
                mentorCategory: category,
                status: "approved"
            };

            const mentors = await Mentors.find(filter)
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .sort({ submittedAt: -1 });

            const total = await Mentors.countDocuments(filter);

            return helper.success(res, "Mentors filtered by category", {
                category,
                total,
                page: Number(page),
                limit: Number(limit),
                data: mentors
            });

        } catch (error) {
            next(error);
        }
    }

}

export default EngineeringMentorsController;






