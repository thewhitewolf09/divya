import { Product, Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default async (req, res) => {
  const { productId, quantity, price, customerId, isCredit, creditDetails } = req.body;

  // Validate required fields
  if (!productId || !quantity || !price) {
    return res.status(400).json({
      resultMessage: getText('00025'), // Missing required fields
      resultCode: '00025',
    });
  }

  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        resultMessage: getText('00093'), // Product not found
        resultCode: '00093',
      });
    }

    // Create new sale object
    const newSale = new Sale({
      productId,
      quantity,
      price,
      customerId: customerId || null, // Optional customer ID
      isCredit: isCredit || false,
      creditDetails: isCredit
        ? {
            amountOwed: creditDetails?.amountOwed || price, // Default amount owed is the sale price
            paymentStatus: creditDetails?.paymentStatus || 'pending',
          }
        : {},
    });

    // Save the sale
    const savedSale = await newSale.save();

    return res.status(201).json({
      resultMessage: getText('00089'), // Sale added successfully
      resultCode: '00089',
      sale: savedSale,
    });
  } catch (err) {
    console.error('Error adding new sale:', err);
    return res.status(500).json(errorHelper('00090', req, err.message)); // Error handling
  }
};


