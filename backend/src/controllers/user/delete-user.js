import { User } from "../../models/index.js";
import { errorHelper, logger, getText } from "../../utils/index.js";

export default async (req, res) => {
  try {
    // Find and delete the user/shop by ID
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json(errorHelper("00087", req, "User not found"));
    }

    // Log the deletion
    logger("00093", req.params.id, getText("00093"), "Info", req);
    
    // Return success response
    return res.status(200).json({
      resultMessage: getText("00093"),
      resultCode: "00093",
    });

  } catch (err) {
    // Handle errors
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
