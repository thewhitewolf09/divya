import { Customer } from '../../models/index.js';
import { errorHelper, getText, generateOTP, logger } from '../../utils/index.js'; // Assuming you are using the same utilities as in the register controller
import { validateRegister } from "../../validators/user.validator.js"; // Assuming the same validation schema

export default async (req, res) => {
  const addedBy = req.user._id;
  console.log(req.body)


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
      return res.status(500).json(errorHelper("00031", req, err.message));
    });

    if (existingCustomer) {
      return res.status(409).json(errorHelper("00027", req)); // "Customer already exists."
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
      return res.status(500).json(errorHelper("00034", req, err.message));
    });

    // Log the customer registration
    logger("00035", savedCustomer._id, getText("00035"), "Info", req); // "Customer created successfully."

    return res.status(201).json({
      resultMessage: getText("00035"), // Customer created successfully
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
    return res.status(500).json(errorHelper("00090", req, err.message)); // Error handling
  }
};
