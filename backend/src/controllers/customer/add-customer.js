/**
 * @swagger
 * /api/customers/add:
 *   post:
 *     summary: Add a new customer
 *     description: Creates a new customer by providing their details like name, mobile number, email, address, etc. The customer will be verified using an OTP.
 *     tags:
 *       - Customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - mobile
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the customer.
 *                 example: "John Doe"
 *               mobile:
 *                 type: string
 *                 description: The mobile number of the customer (must be unique).
 *                 example: "1234567890"
 *               whatsappNumber:
 *                 type: string
 *                 description: The WhatsApp number of the customer.
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 description: The email address of the customer.
 *                 example: "johndoe@example.com"
 *               address:
 *                 type: string
 *                 description: The address of the customer.
 *                 example: "123 Street Name, City, Country"
 *               notes:
 *                 type: string
 *                 description: Any additional notes related to the customer.
 *                 example: "Preferred contact time: 9AM-6PM"
 *     responses:
 *       201:
 *         description: Customer successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Customer created successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00035"
 *                 customer:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     mobile:
 *                       type: string
 *                       example: "1234567890"
 *                     isVerified:
 *                       type: boolean
 *                       example: false
 *                     otpExpiry:
 *                       type: string
 *                       example: "2024-11-13T10:30:00Z"
 *       400:
 *         description: Bad request, missing required fields.
 *       409:
 *         description: Customer with this mobile number already exists.
 *       500:
 *         description: Internal server error.
 */

import { Customer } from "../../models/index.js";
import { errorHelper, generateOTP, logger } from "../../utils/index.js"; // Assuming you are using the same utilities as in the register controller

export default async (req, res) => {
  const addedBy = req.user._id;

  const {
    name,
    mobile, // Changed from phone to mobile to keep it consistent with the register controller
    whatsappNumber,
    email,
    address,
    notes,
  } = req.body;

  try {
    // Check if the customer already exists based on the mobile number
    const existingCustomer = await Customer.exists({ mobile }).catch((err) => {
      return res.status(500).json({
        resultMessage: "Internal server error while checking existing customer", // Error message
        resultCode: "00031",
        error: err.message,
      });
    });

    if (existingCustomer) {
      return res.status(409).json({
        resultMessage: "Customer already exists", // "Customer already exists." error message
        resultCode: "00027",
      });
    }

    // Generate OTP
    const otp = generateOTP(); // Generate OTP (same as in register)
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Create a new customer object
    const newCustomer = new Customer({
      name,
      mobile,
      whatsappNumber,
      email,
      address,
      notes: notes || null,
      otp,
      otpExpiry,
      isVerified: false,
      addedBy: addedBy || null,
    });

    // Save the customer in the database
    const savedCustomer = await newCustomer.save().catch((err) => {
      return res.status(500).json({
        resultMessage: "Internal server error while saving the customer", // Error message
        resultCode: "00034",
        error: err.message,
      });
    });

    // Log the customer registration
    logger(
      "00035",
      savedCustomer._id,
      "Customer created successfully.",
      "Info",
      req
    ); // "Customer created successfully."

    return res.status(201).json({
      resultMessage: "Customer created successfully", // Customer created successfully message
      resultCode: "00035",
      customer: {
        name: savedCustomer.name,
        mobile: savedCustomer.mobile,
        isVerified: savedCustomer.isVerified,
        otpExpiry: savedCustomer.otpExpiry,
      },
    });
  } catch (err) {
    console.error("Error creating customer:", err);
    return res.status(500).json({
      resultMessage: "Error creating customer", // General error message
      resultCode: "00090",
      error: err.message,
    }); // Error handling
  }
};
