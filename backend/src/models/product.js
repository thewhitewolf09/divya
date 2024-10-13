import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: [String],
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'liter', 'piece', 'pack', 'dozen'],
    required: true
  },
  productImage: {
    type: String,
    trim: true // URL to the product image
  },
  supplier: {
    type: String,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user who added the product
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  discount: {
    type: Number,
    default: 0 // Percentage discount on the product
  },
  tax: {
    type: Number,
    default: 0 // Percentage tax on the product
  },
  variants: [
    {
      variantName: String, // e.g., "small", "medium", "large"
      variantPrice: Number,
      variantStockQuantity: Number
    }
  ]
});

const Product = mongoose.model('Product', productSchema);

export default Product; 