/**
 * @swagger
 * /api/users/verify-otp:
 *   post:
 *     summary: Verify OTP for user authentication
 *     description: Verifies the OTP sent to the user's mobile number to authenticate the user.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         description: Mobile number and OTP code to verify
 *         schema:
 *           type: object
 *           properties:
 *             mobile:
 *               type: string
 *               description: The user's mobile number
 *               example: "1234567890"
 *             otp:
 *               type: string
 *               description: The OTP sent to the user's mobile number
 *               example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully, user authenticated
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Success message indicating OTP verification
 *             resultCode:
 *               type: string
 *               description: Success code
 *             accessToken:
 *               type: string
 *               description: JWT access token for user session
 *             user:
 *               type: object
 *               description: Authenticated user details
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID
 *                 mobile:
 *                   type: string
 *                   description: User's mobile number
 *                 name:
 *                   type: string
 *                   description: User's name
 *                 isVerified:
 *                   type: boolean
 *                   description: Verification status of the user
 *                 role:
 *                   type: string
 *                   description: Role of the user, either "shopOwner" or "customer"
 *                 shopLocation:
 *                   type: object
 *                   description: Shop location details (if the user is a shop owner)
 *                   properties:
 *                     street:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     postalCode:
 *                       type: string
 *                     country:
 *                       type: string
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *                 openingTime:
 *                   type: string
 *                   description: Shop opening time (if applicable)
 *                 closingTime:
 *                   type: string
 *                   description: Shop closing time (if applicable)
 *                 address:
 *                   type: string
 *                   description: Customer's address (if applicable)
 *                 totalPurchases:
 *                   type: number
 *                   description: Customer's total purchases (if applicable)
 *                 creditBalance:
 *                   type: number
 *                   description: Customer's credit balance (if applicable)
 *                 membershipStatus:
 *                   type: string
 *                   description: Customer's membership status (if applicable)
 *       400:
 *         description: Bad request due to validation failure
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Error message for validation issues
 *             resultCode:
 *               type: string
 *       404:
 *         description: User or record not found
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Error message indicating user not found
 *             resultCode:
 *               type: string
 *       500:
 *         description: Internal server error
 *         schema:
 *           type: object
 *           properties:
 *             resultMessage:
 *               type: string
 *               description: Error message for server error
 *             resultCode:
 *               type: string
 */



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
