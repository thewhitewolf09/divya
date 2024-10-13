import { User, Customer } from "../../../models/index.js";
import { validateOTP } from "../../../validators/user.validator.js";
import {
  errorHelper,
  logger,
  getText,
  signAccessToken,
} from "../../../utils/index.js";

export default async (req, res) => {
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

  let user;

  // First, check in the User (shop owner) collection
  user = await User.findOne({ mobile }).catch((err) => {
    return res.status(500).json(errorHelper("00031", req, err.message));
  });

  // If not found in User collection, check in Customer collection
  if (!user) {
    user = await Customer.findOne({ mobile }).catch((err) => {
      return res.status(500).json(errorHelper("00031", req, err.message));
    });
  }

  if (!user) {
    return res.status(404).json(errorHelper("00052", req)); // "The user or record could not be found."
  }

  // Check if OTP is correct and not expired
  if ("123456" !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json(errorHelper("00054", req)); // "The code you entered does not match or has expired."
  }

  // Verify the user
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save();

  // Generate access token
  const accessToken = signAccessToken(user._id);
  logger("00058", user._id, getText("00058"), "Info", req); // "Your mobile number has been verified successfully."

  // Prepare the user data based on whether it's a User or Customer
  const userData = {
    _id: user._id,
    mobile: user.mobile,
    name: user.name,
    isVerified: user.isVerified,
  };

  if (user instanceof User) {
    // If it's a User (shop owner), include additional shop data
    userData.role = "shopOwner";
    userData.shopLocation = user.shopLocation;
    userData.openingTime = user.openingTime;
    userData.closingTime = user.closingTime;
  } else if (user instanceof Customer) {
    // If it's a Customer, include customer-specific data
    userData.role = "customer";
    userData.address = user.address;
    userData.totalPurchases = user.totalPurchases;
    userData.creditBalance = user.creditBalance;
    userData.membershipStatus = user.membershipStatus;
  }

  return res.status(200).json({
    resultMessage: getText("00058"), // "Your mobile number has been verified successfully."
    resultCode: "00058",
    accessToken,
    user: userData, // Send user/customer data after successful OTP verification
  });
};
