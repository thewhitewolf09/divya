import { Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default async (req, res) => {
  try {
    // Find all sales where isCredit is true and paymentStatus is either 'pending' or 'partially_paid'
    const outstandingCredits = await Sale.find({
      isCredit: true,
      'creditDetails.paymentStatus': { $in: ['pending', 'partially_paid'] }
    });

    if (outstandingCredits.length === 0) {
      return res.status(404).json({
        resultMessage: getText('00091'), // No outstanding credit sales found
        resultCode: '00091',
      });
    }

    return res.status(200).json({
      resultMessage: getText('00089'), // Success
      resultCode: '00089',
      outstandingCredits,
    });
  } catch (err) {
    console.error('Error fetching outstanding credit sales:', err);
    return res.status(500).json(errorHelper('00090', req, err.message)); // Error handling
  }
};


