import { User } from "../../../models/index.js";
import { validateOTP } from "../../../validators/user.validator.js";
import {
  errorHelper,
  logger,
  getText,
  signAccessToken,
} from "../../../utils/index.js";

export default async (req, res) => {
  console.log(req.body);
  
  const { error } = validateOTP(req.body);
  
  if (error) {
    let code = "00053"; // "Please send a verification code."
    
    if (error.details[0].message.includes("mobile")) {
      code = "00026"; // "Please provide a valid mobile number!"
    } else if (error.details[0].message.includes("otp")) {
      code = "00054"; // "The code you entered does not match the code we sent to your mobile number. Please check again."
    }

    return res
      .status(400)
      .json(errorHelper(code, req, error.details[0].message));
  }

  const { mobile, otp } = req.body;

  const user = await User.findOne({ mobile }).catch((err) => {
    return res.status(500).json(errorHelper("00031", req, err.message));
  });

  if (!user) {
    return res.status(404).json(errorHelper("00052", req)); // "The user or record could not be found."
  }

  if (user.isVerified) {
    return res.status(400).json(errorHelper("00059", req)); // "Please provide refresh token." (Update accordingly)
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json(errorHelper("00054", req)); // "The code you entered does not match..."
  }

  // Verify the user
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // Generate access token
  const accessToken = signAccessToken(user._id);

  logger("00058", user._id, getText("00058"), "Info", req); // "Your mobile number has been verified successfully."

  return res.status(200).json({
    resultMessage: getText("00058"),
    resultCode: "00058",
    accessToken,
  });
};
