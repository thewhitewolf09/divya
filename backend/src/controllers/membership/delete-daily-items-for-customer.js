import { Customer } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default  async (req, res) => {
  const { id, itemName } = req.params;


  if (!id || !itemName) {
    return res.status(400).json({
      resultMessage: getText('00022'),
      resultCode: '00022',
    });
  }

  try {
    // Find the customer
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        resultMessage: getText('00052'), // Customer not found
        resultCode: '00052',
      });
    }

    // Check if the daily item exists
    const dailyItemIndex = customer.dailyItems.findIndex(item => item.itemName === itemName);
    if (dailyItemIndex === -1) {
      return res.status(404).json({
        resultMessage: getText('00093'), // Daily item not found
        resultCode: '00093',
      });
    }

    // Remove the daily item from the customer's record
    customer.dailyItems.splice(dailyItemIndex, 1);
    const updatedCustomer = await customer.save();

    return res.status(200).json({
      resultMessage: getText('00089'), // Successfully removed daily item
      resultCode: '00089',
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error('Error removing daily item for customer:', err);
    return res.status(500).json(errorHelper('00008', req, err.message)); // Error handling
  }
};


