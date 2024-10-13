import { Customer } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default  async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id; // Assuming you have user authentication and can get the user ID

  if (!id) {
    return res.status(400).json({
      resultMessage: getText('00022'), // Missing customer ID
      resultCode: '00022',
    });
  }

  try {
    // Find the customer by ID
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        resultMessage: getText('00052'), // Customer not found
        resultCode: '00052',
      });
    }

    // Optional: Check if the user making the request has permissions to delete this customer
    if (customer.addedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        resultMessage: getText('00017'), // Permission denied
        resultCode: '00017',
      });
    }

    // Delete the customer
    await Customer.findByIdAndDelete(id);

    return res.status(200).json({
      resultMessage: getText('00089'), // Customer deleted successfully
      resultCode: '00089',
    });
  } catch (err) {
    console.error('Error deleting customer:', err);
    return res.status(500).json(errorHelper('00008', req, err.message)); // Error handling
  }
};

