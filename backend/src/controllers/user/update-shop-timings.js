import { User } from "../../models/index.js";
import { validateShopTiming } from "../../validators/user.validator.js"; // Assuming you have this validator
import { errorHelper, logger, getText } from "../../utils/index.js";

export default async (req, res) => {
  // Validate request body
  const { error } = validateShopTiming(req.body);
  if (error) {
    let code = "00077";
    const message = error.details[0].message;
    return res.status(400).json(errorHelper(code, req, message));
  }

  // Find user by ID
  const user = await User.findById(req.params.id).catch((err) => {
    return res.status(500).json(errorHelper("00082", req, err.message));
  });
  if (!user) {
    return res.status(404).json(errorHelper("00087", req, "User not found"));
  }

  // Update shop's opening and closing time
  if (req.body.openingTime) user.shopLocation.openingTime = req.body.openingTime;
  if (req.body.closingTime) user.shopLocation.closingTime = req.body.closingTime;

  // Save the updated user/shop details
  await user.save().catch((err) => {
    return res.status(500).json(errorHelper("00085", req, err.message));
  });

  // Return success response
  logger("00086", req.user._id, getText("00086"), "Info", req);
  return res.status(200).json({
    resultMessage: getText("00086"),
    resultCode: "00086",
    user,
  });
};
