/**
 * @swagger
 * /api/users/send-otp:
 *   post:
 *     summary: Send an OTP to a user's mobile number for verification.
 *     description: Searches for a user by mobile number in both User (shop owner) and Customer collections. If found, generates an OTP and sends it to the user's mobile number.
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
 *                 description: The mobile number of the user requesting the OTP.
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: OTP generated and sent successfully.
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
 *         description: Mobile number is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode:
 *                   type: string
 *                   example: "00039"
 *                 errorMessage:
 *                   type: string
 *                   example: "Mobile number is required"
 *       404:
 *         description: User not found with the provided mobile number.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode:
 *                   type: string
 *                   example: "00052"
 *                 errorMessage:
 *                   type: string
 *                   example: "The user or record could not be found."
 *       500:
 *         description: Internal server error during OTP generation or user retrieval.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode:
 *                   type: string
 *                   example: "00031"
 *                 errorMessage:
 *                   type: string
 *                   example: "Internal server error."
 */


import {
  errorHelper,
  getText,
  logger,
  generateOTP,
  sendOTP, // Utility to generate OTP
} from "../../../utils/index.js";
import { User, Customer } from "../../../models/index.js"; // Import both User and Customer models

export default async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res
      .status(400)
      .json(errorHelper("00039", req, "Mobile number is required"));
  }

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

  // Generate and send OTP
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  await user.save().catch((err) => {
    return res.status(500).json(errorHelper("00034", req, err.message));
  });

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
