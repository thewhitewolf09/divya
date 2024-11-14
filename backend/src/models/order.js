import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      variantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
      },
      saleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "Pending",
      "Order Placed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ],
    default: "Pending",
  },
  deliveryAddress: {
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
  payment: {
    method: {
      type: String,
      enum: ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"],
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Failed",
    },
    transactionId: {
      type: String,
      unique: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
