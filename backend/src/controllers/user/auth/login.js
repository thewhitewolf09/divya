/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login with OTP generation
 *     description: Validates the user's mobile number and generates an OTP for login. The OTP is stored in the database and is valid for 10 minutes.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *                 description: The mobile number of the user.
 *                 example: "1234567890"
 *               deviceToken:
 *                 type: string
 *                 description: The device token for push notifications.
 *                 example: "device_token_example"
 *     responses:
 *       200:
 *         description: OTP successfully generated and sent to the user's mobile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "The code is sent to your mobile successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00048"
 *                 user:
 *                   type: object
 *                   properties:
 *                     mobile:
 *                       type: string
 *                       example: "1234567890"
 *       400:
 *         description: Validation error with the provided mobile number or device token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode:
 *                   type: string
 *                   example: "00038"
 *                 errorMessage:
 *                   type: string
 *                   example: "Invalid mobile number format."
 *       404:
 *         description: User not found in either User or Customer collection.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode:
 *                   type: string
 *                   example: "00042"
 *                 errorMessage:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Internal server error during the process.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode:
 *                   type: string
 *                   example: "00041"
 *                 errorMessage:
 *                   type: string
 *                   example: "Internal server error."
 */



import { User, Customer } from "../../../models/index.js";
import { validateLogin } from "../../../validators/user.validator.js";
import {
  errorHelper,
  getText,
  logger,
  generateOTP,
  sendOTP,
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

  const { mobile, deviceToken } = req.body;

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
  user.deviceToken = deviceToken;

  await user.save().catch((err) => {
    return res.status(500).json(errorHelper("00034", req, err.message));
  });

  // Uncomment the following line to implement actual OTP sending logic
  //  await sendOTP(user.mobile, otp).catch((err) => {
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
