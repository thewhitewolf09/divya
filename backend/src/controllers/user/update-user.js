import { User } from "../../models/index.js";
import { validateEditUser } from "../../validators/user.validator.js";
import { errorHelper, logger, getText } from "../../utils/index.js";

export default async (req, res) => {
  // Validate request body
  const { error } = validateEditUser(req.body);
  
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

  // Update user details
  if (req.body.name) user.name = req.body.name;
  if (req.body.mobile) user.mobile = req.body.mobile;

  // Update shopLocation if present in the request
  if (req.body.shopLocation) {
    const { street, city, state, postalCode, country, latitude, longitude } = req.body.shopLocation;

    if (street) user.shopLocation.street = street;
    if (city) user.shopLocation.city = city;
    if (state) user.shopLocation.state = state;
    if (postalCode) user.shopLocation.postalCode = postalCode;
    if (country) user.shopLocation.country = country;
    if (latitude && longitude) {
      user.shopLocation.latitude = latitude;
      user.shopLocation.longitude = longitude;
    }
  }

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
