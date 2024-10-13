import { User, Customer } from "../../../models/index.js"; // Assuming Customer is imported too
import {
  errorHelper,
  logger,
  getText,
  generateOTP, // Assume you have a utility to send OTPs via SMS
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

  const { mobile, name, role, address, shopLocation, whatsappNumber, notes } =
    req.body;

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
  // const otpSent = await sendOTP(mobile, otp).catch((err) => {
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
