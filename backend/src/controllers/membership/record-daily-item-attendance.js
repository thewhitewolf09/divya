import { Customer, Product } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default  async (req, res) => {
  const { id, itemName } = req.params;
  const { date, quantity } = req.body;

  if (!id || !itemName || !date || quantity === undefined) {
    return res.status(400).json({
      resultMessage: getText('00022'), // Missing required fields
      resultCode: '00022',
    });
  }

  try {
    // Fetch customer details
    const customer = await Customer.findById(id).populate("addedBy")
    .populate({
      path: "dailyItems.itemName",
    })
    .populate("shops");
    if (!customer) {
      return res.status(404).json({
        resultMessage: getText('00052'), // Customer not found
        resultCode: '00052',
      });
    }

    // Check if the item exists in dailyItems
    if (!customer.dailyItems[itemName]) {
      return res.status(404).json({
        resultMessage: getText('00093'), // Daily item not found
        resultCode: '00093',
      });
    }

    // Fetch the price of the item from the Product model
    const product = await Product.findOne({ name: itemName });
    if (!product) {
      return res.status(404).json({
        resultMessage: getText('00093'), // Product not found
        resultCode: '00093',
      });
    }

    const price = product.price; // Get the price from the Product model

    // Record attendance for the specific day
    customer.dailyItems[itemName].attendance = customer.dailyItems[itemName].attendance || {};
    customer.dailyItems[itemName].attendance[new Date(date).toISOString()] = {
      date: new Date(date),
      quantity,
      price,
      taken: quantity > 0, // Mark as taken if quantity is greater than 0
    };

    // Save the updated customer record
    const updatedCustomer = await customer.save();

    return res.status(200).json({
      resultMessage: getText('00089'), // Successfully recorded attendance
      resultCode: '00089',
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error('Error recording daily item attendance:', err);
    return res.status(500).json(errorHelper('00008', req, err.message)); // Error handling
  }
};


