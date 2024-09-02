import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/, // 10-digit mobile number
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 24,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiry: {
    type: Date,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);

export default User;
