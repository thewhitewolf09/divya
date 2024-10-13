import Joi from "joi";

export function validateRegister(body) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(24).required(),
    mobile: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),
    role: Joi.string().valid("shopOwner", "customer").required(), // Validate role
    shopLocation: Joi.when("role", {
      is: "shopOwner",
      then: Joi.object({
        address: Joi.object({
          street: Joi.string().required(),
          city: Joi.string().required(),
          state: Joi.string().required(),
          postalCode: Joi.string()
            .pattern(/^[0-9]{6}$/)
            .required(),
          country: Joi.string().required(),
        }).required(), // Validate structured address
        googleMapLocation: Joi.object({
          latitude: Joi.number().required(),
          longitude: Joi.number().required(),
        }).optional(), // google map coordinates (optional)
      }).required(), // shopLocation is required for shopOwner
      otherwise: Joi.forbidden(), // Not allowed for customers
    }),
    address: Joi.when("role", {
      is: "customer",
      then: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postalCode: Joi.string()
          .pattern(/^[0-9]{6}$/)
          .required(),
        country: Joi.string().required(),
      }).required(), // Address as an object is required for customers
      otherwise: Joi.forbidden(), // Not allowed for shop owners
    }),
    whatsappNumber: Joi.when("role", {
      is: "customer",
      then: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .optional(), // WhatsApp number for customer (optional)
      otherwise: Joi.forbidden(), // Not allowed for shop owners
    }),
    openingTime: Joi.when("role", {
      is: "shopOwner",
      then: Joi.string().optional(), // Optional opening time for shopOwner
      otherwise: Joi.forbidden(), // Not allowed for customers
    }),
    closingTime: Joi.when("role", {
      is: "shopOwner",
      then: Joi.string().optional(), // Optional closing time for shopOwner
      otherwise: Joi.forbidden(), // Not allowed for customers
    }),
    notes: Joi.string().optional(),
  });

  return schema.validate(body);
}

export function validateLogin(body) {
  const schema = Joi.object({
    mobile: Joi.string()
      .pattern(/^[0-9]{10}$/) // Assuming a 10-digit phone number; adjust the pattern if needed
      .required(),
  });
  return schema.validate(body);
}

export const validateOTP = (data) => {
  const schema = Joi.object({
    mobile: Joi.string()
      .pattern(/^[0-9]{10,15}$/) // Adjust based on your mobile format
      .required()
      .messages({
        "string.empty": "Mobile number is required.",
        "string.pattern.base": "Please provide a valid mobile number.",
      }),
    otp: Joi.string()
      .length(6) // Assuming a 6-digit OTP
      .required()
      .messages({
        "string.empty": "OTP is required.",
        "string.length": "OTP must be 6 digits.",
      }),
  });

  return schema.validate(data);
};

export function validateEditUser(body) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(24),
    username: Joi.string().min(3).max(15),
    mobile: Joi.string()
      .pattern(/^[0-9]{10}$/) // Assuming mobile number is a 10-digit number
      .messages({
        "string.pattern.base": "Mobile number must be a 10-digit number",
      }),
    shopLocation: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      postalCode: Joi.string().optional(),
      country: Joi.string().optional(),
      latitude: Joi.number().optional(),
      longitude: Joi.number().optional(),
    }).optional(),
  });

  return schema.validate(body);
}

export function validateShopTiming(body) {
  const schema = Joi.object({
    openingTime: Joi.string()
      .pattern(/^([0-1][0-9]|2[0-3]):([0-5][0-9]) (AM|PM)$/) // Regex for time format "HH:MM AM/PM"
      .required()
      .messages({
        "string.pattern.base": "Opening time must be in the format HH:MM AM/PM",
        "any.required": "Opening time is required",
      }),
    closingTime: Joi.string()
      .pattern(/^([0-1][0-9]|2[0-3]):([0-5][0-9]) (AM|PM)$/) // Regex for time format "HH:MM AM/PM"
      .required()
      .messages({
        "string.pattern.base": "Closing time must be in the format HH:MM AM/PM",
        "any.required": "Closing time is required",
      }),
  });
  return schema.validate(body);
}
