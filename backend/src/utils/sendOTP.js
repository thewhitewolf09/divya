import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Twilio Auth Token
const fromNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number

const client = twilio(accountSid, authToken);

export const sendOTP = async (mobile, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your Divya's verification code is: ${otp}`,
      from: fromNumber,
      to: `+91${mobile}`,
    });
    return message.sid;
  } catch (error) {
    throw new Error("Failed to send OTP.");
  }
};
