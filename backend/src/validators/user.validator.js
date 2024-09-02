import Joi from "joi";


export function validateRegister(body) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(24).required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
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
  });
  return schema.validate(body);
}
