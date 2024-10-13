import { Customer } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default  async (req, res) => {
  const { id } = req.params;
  const { membershipStatus } = req.body;

  if (!id || !membershipStatus) {
    return res.status(400).json({
      resultMessage: getText('00022'), // Missing required fields
      resultCode: '00022',
    });
  }

  // Validate membershipStatus
  const validStatuses = ['active', 'inactive'];
  if (!validStatuses.includes(membershipStatus)) {
    return res.status(400).json({
      resultMessage: getText('00022'), // Invalid membership status
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

    // Update membership status
    customer.membershipStatus = membershipStatus;
    const updatedCustomer = await customer.save();

    return res.status(200).json({
      resultMessage: getText('00089'), // Successfully updated membership status
      resultCode: '00089',
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error('Error updating membership status:', err);
    return res.status(500).json(errorHelper('00008', req, err.message)); // Error handling
  }
};


