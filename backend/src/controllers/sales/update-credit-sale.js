import { Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default async (req, res) => {
  const { saleId } = req.params;
  const { paymentStatus, amountPaid } = req.body;

  if (!['pending', 'paid', 'partially_paid'].includes(paymentStatus)) {
    return res.status(400).json({
      resultMessage: getText('00025'), // Invalid payment status
      resultCode: '00025',
    });
  }

  try {
    const sale = await Sale.findById(saleId);
    if (!sale || !sale.isCredit) {
      return res.status(404).json({
        resultMessage: getText('00092'), // Sale not found or not a credit sale
        resultCode: '00092',
      });
    }

    // Update payment details
    if (paymentStatus === 'paid') {
      sale.creditDetails.amountOwed = 0;
      sale.creditDetails.paymentStatus = 'paid';
    } else if (paymentStatus === 'partially_paid') {
      if (!amountPaid || amountPaid <= 0 || amountPaid > sale.creditDetails.amountOwed) {
        return res.status(400).json({
          resultMessage: getText('00026'), // Invalid amount
          resultCode: '00026',
        });
      }
      sale.creditDetails.amountOwed -= amountPaid;
      sale.creditDetails.paymentStatus = sale.creditDetails.amountOwed > 0 ? 'partially_paid' : 'paid';
    } else if (paymentStatus === 'pending') {
      sale.creditDetails.paymentStatus = 'pending';
    }

    await sale.save();

    return res.status(200).json({
      resultMessage: getText('00089'), // Payment updated successfully
      resultCode: '00089',
      updatedSale: sale,
    });
  } catch (err) {
    console.error('Error updating credit sale payment:', err);
    return res.status(500).json(errorHelper('00090', req, err.message)); // Error handling
  }
};


