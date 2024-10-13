import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer' // Optional: Reference to a Customer model if you track customers
  },
  isCredit: {
    type: Boolean,
    default: false // Indicates if the sale is on credit
  },
  creditDetails: {
    amountOwed: {
      type: Number,
      default: 0,
      min: 0 // Amount that the customer owes if the sale is on credit
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid'],
      default: 'pending' // Current payment status of the credit sale
    }
  }
});

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
