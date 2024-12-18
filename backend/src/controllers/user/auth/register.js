/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user (shop owner or customer) and generate OTP for verification.
 *     description: Registers a user with specified details and sends an OTP to their mobile for verification. It handles both shop owner and customer roles.
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
 *                 description: User's mobile number.
 *                 example: "1234567890"
 *               name:
 *                 type: string
 *                 description: Full name of the user.
 *                 example: "John Doe"
 *               role:
 *                 type: string
 *                 description: Role of the user - either 'shopOwner' or 'customer'.
 *                 example: "shopOwner"
 *               address:
 *                 type: string
 *                 description: Address of the user (for customer).
 *                 example: "123 Main St, City, Country"
 *               shopLocation:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     description: Shop address for shop owners.
 *                     example: "Shop No. 1, Market St"
 *                   googleMapLocation:
 *                     type: object
 *                     properties:
 *                       latitude:
 *                         type: number
 *                         example: 12.9716
 *                       longitude:
 *                         type: number
 *                         example: 77.5946
 *               whatsappNumber:
 *                 type: string
 *                 description: WhatsApp number for customer role.
 *                 example: "1234567890"
 *               notes:
 *                 type: string
 *                 description: Optional notes for customer.
 *                 example: "Preferred delivery time: morning"
 *               deviceToken:
 *                 type: string
 *                 description: Device token for push notifications.
 *                 example: "device_token_example"
 *               openingTime:
 *                 type: string
 *                 description: Opening time for shop owners.
 *                 example: "09:00 AM"
 *               closingTime:
 *                 type: string
 *                 description: Closing time for shop owners.
 *                 example: "09:00 PM"
 *               addedBy:
 *                 type: string
 *                 description: ID of the shop owner who added the customer.
 *                 example: "shopOwner123"
 *     responses:
 *       200:
 *         description: User registered successfully, OTP generated and sent to mobile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "You registered successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00035"
 *                 user:
 *                   type: object
 *                   properties:
 *                     mobile:
 *                       type: string
 *                       example: "1234567890"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     role:
 *                       type: string
 *                       example: "shopOwner"
 *                     isVerified:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Validation error with the provided details (e.g., invalid mobile number).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode:
 *                   type: string
 *                   example: "00025"
 *                 errorMessage:
 *                   type: string
 *                   example: "Invalid name format."
 *       409:
 *         description: User already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorCode:
 *                   type: string
 *                   example: "00032"
 *                 errorMessage:
 *                   type: string
 *                   example: "Account already exists."
 *       500:
 *         description: Internal server error during user registration.
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


import { User, Customer } from "../../../models/index.js"; // Assuming Customer is imported too
import {
  errorHelper,
  logger,
  getText,
  generateOTP,
  sendOTP, // Assume you have a utility to send OTPs via SMS
} from "../../../utils/index.js";
import { validateRegister } from "../../../validators/user.validator.js";

export default async (req, res) => {
  const { error } = validateRegister(req.body);

  console.log(error);

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

  const {
    mobile,
    name,
    role,
    address,
    shopLocation,
    whatsappNumber,
    notes,
    deviceToken,
  } = req.body;

  let exists;

  // Check if the account exists according to the role
  if (role === "shopOwner") {
    // If the role is 'shopOwner', check in the User collection
    exists = await User.exists({ mobile }).catch((err) => {
      return res.status(500).json(errorHelper("00031", req, err.message));
    });
  } else if (role === "customer") {
    // If the role is 'customer', check in the Customer collection
    exists = await Customer.exists({ mobile }).catch((err) => {
      return res.status(500).json(errorHelper("00031", req, err.message));
    });
  }

  if (exists) {
    return res.status(409).json(errorHelper("00032", req)); // "Account already exists."
  }

  // Generate OTP
  const otp = generateOTP(); // Implement this function to generate a 4-6 digit OTP
  const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  let user;

  if (role === "shopOwner") {
    // Create a new shop owner user
    user = new User({
      mobile,
      name,
      otp,
      otpExpiry,
      isVerified: false,
      deviceToken,
      shopLocation: {
        address: shopLocation.address,
        googleMapLocation: shopLocation.googleMapLocation || {
          latitude: 0,
          longitude: 0,
        },
      },
      openingTime: req.body.openingTime,
      closingTime: req.body.closingTime,
    });
  } else if (role === "customer") {
    // Create a customer entry if role is customer
    const customer = new Customer({
      name,
      mobile,
      otp,
      otpExpiry,
      isVerified: false,
      whatsappNumber,
      address: address,
      deviceToken,
      addedBy: req.body.addedBy || null, // Assuming the shop owner adds customers
      notes: req.body.notes || null,
    });

    // Save the customer to the database
    user = await customer.save().catch((err) => {
      console.log(err);
      return res.status(500).json(errorHelper("00034", req, err.message));
    });
  }

  // Save the user (shop owner)
  user = await user.save().catch((err) => {
    console.log(err);
    return res.status(500).json(errorHelper("00034", req, err.message));
  });

  // Send OTP via SMS
  //  await sendOTP(mobile, otp).catch((err) => {
  //   return res.status(500).json(errorHelper("00036", req, err.message)); // "Failed to send OTP."
  // });

  logger("00035", user._id, getText("00035"), "Info", req); // "You registered successfully."

  return res.status(200).json({
    resultMessage: getText("00035"),
    resultCode: "00035",
    user: {
      mobile: user.mobile,
      name: user.name,
      role,
      isVerified: user.isVerified,
    },
    // Do not send OTP or token until verification
  });
};
