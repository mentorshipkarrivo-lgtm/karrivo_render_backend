import Mentors from "../models/mentor.js";
import helper from "../helper/helper.js";

class MarketingMentorsController {

  static async getAllMentors(req, res) {
    try {

      const mentors = await Mentors.find({

        status: "approved",
      }).sort({ createdAt: -1 });

      return helper.success(
        res,
        "Marketing mentors fetched successfully",
        mentors
      );

    } catch (error) {
      console.error("Error fetching marketing mentors →", error);
      return helper.failed(
        res,
        "Error fetching marketing mentors",
        error.message
      );
    }
  }

}

export default MarketingMentorsController;



