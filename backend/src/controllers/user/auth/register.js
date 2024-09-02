import { User } from "../../../models/index.js";
import {
  errorHelper,
  logger,
  getText,
  sendOTP,
  generateOTP, // Assume you have a utility to send OTPs via SMS
} from "../../../utils/index.js";
import { validateRegister } from "../../../validators/user.validator.js";

export default async (req, res) => {
  console.log(req.body);
  
  const { error } = validateRegister(req.body);
  if (error) {
    let code = "00025";
    
    if (error.details[0].message.includes("mobile")) {
      code = "00026";
    } else if (error.details[0].message.includes("name")) {
      code = "00028";
    }

    return res
      .status(400)
      .json(errorHelper(code, req, error.details[0].message));
  }

  const exists = await User.exists({ mobile: req.body.mobile }).catch((err) => {
    return res.status(500).json(errorHelper("00031", req, err.message));
  });

  if (exists) {
    return res.status(409).json(errorHelper("00032", req));
  }

  const { mobile, name } = req.body;

  // Generate OTP
  const otp = generateOTP(); // Implement this function to generate a 4-6 digit OTP
  const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  // Create a new user with mobile, name, and OTP
  let user = new User({
    mobile,
    name,
    otp,
    otpExpiry,
    isVerified: false,
  });

  user = await user.save().catch((err) => {
    return res.status(500).json(errorHelper("00034", req, err.message));
  });

  // Send OTP via SMS
  const otpSent = await sendOTP(mobile, otp).catch((err) => {
    return res.status(500).json(errorHelper("00036", req, err.message)); // "Failed to send OTP."
  });

  
  logger("00035", user._id, getText("00035"), "Info", req); // "You registered successfully."

  return res.status(200).json({
    resultMessage: getText("00035"),
    resultCode: "00035",
    user: {
      mobile: user.mobile,
      name: user.name,
      isVerified: user.isVerified,
    },
    // Do not send OTP or token until verification
  });
};
