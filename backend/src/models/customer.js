import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{10}$/, "Please enter a valid phone number"], // Assuming 10-digit phone numbers
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
  whatsappNumber: {
    type: String,
    match: [/^\d{10}$/, "Please enter a valid WhatsApp number"],
    default: null,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, "Please enter a valid postal code"],
    },
    country: {
      type: String,
      required: true,
      default: "India",
    },
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  totalPurchases: {
    type: Number,
    default: 0,
    min: 0,
  },
  creditBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    trim: true,
    default: null,
  },
  membershipStatus: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },

  // Changed dailyItems to an array
  dailyItems: [
    {
      itemName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantityPerDay: {
        type: Number,
        default: 0,
      },
      attendance: [
        {
          date: {
            type: Date,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
          taken: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
  ],

  shops: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencing the User model which represents a shop
    },
  ],
});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
