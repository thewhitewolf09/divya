import { User, Customer } from "../../../models/index.js";
import { validateLogin } from "../../../validators/user.validator.js";
import {
  errorHelper,
  getText,
  logger,
  generateOTP, // Utility to generate OTP
} from "../../../utils/index.js";

export default async (req, res) => {
  const { error } = validateLogin(req.body);

  if (error) {
    let code = "00038";
    if (error.details[0].message.includes("mobile")) code = "00039";

    return res
      .status(400)
      .json(errorHelper(code, req, error.details[0].message));
  }

  const { mobile } = req.body;

  let user;

  // First, search in User (shop owner) collection
  user = await User.findOne({ mobile }).catch((err) => {
    return res.status(500).json(errorHelper("00041", req, err.message));
  });

  // If not found in User collection, search in Customer collection
  if (!user) {
    user = await Customer.findOne({ mobile }).catch((err) => {
      return res.status(500).json(errorHelper("00041", req, err.message));
    });
  }

  if (!user) return res.status(404).json(errorHelper("00042", req)); // User not found in either collection

  // Generate and assign OTP
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  await user.save().catch((err) => {
    return res.status(500).json(errorHelper("00034", req, err.message));
  });

  // Uncomment the following line to implement actual OTP sending logic
  // await sendOTP(user.mobile, otp).catch((err) => {
  //   return res.status(500).json(errorHelper("00036", req, err.message)); // "Failed to send OTP."
  // });

  logger("00047", user._id, getText("00047"), "Info", req); // "OTP sent successfully."

  return res.status(200).json({
    resultMessage: getText("00048"), // "The code is sent to your mobile successfully."
    resultCode: "00048",
    user: {
      mobile: user.mobile,
    },
    // OTP will be used in the next step to verify
  });
};
