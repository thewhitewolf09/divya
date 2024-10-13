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
  },
  otpExpiry: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  shopLocation: {
    address: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      postalCode: {
        type: String,
      },
      country: {
        type: String,
      },
    },
    googleMapLocation: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
  },
  openingTime: {
    type: String,
  },
  closingTime: {
    type: String,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);

export default User;
