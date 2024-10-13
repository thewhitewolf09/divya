import { Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default  async (req, res) => {
  const { id } = req.params;
  const { quantity, price, isCredit, creditDetails } = req.body;

  try {
    // Check if the sale exists
    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({
        resultMessage: getText('00093'), // Sale not found
        resultCode: '00093',
      });
    }

    // Update sale details if provided
    if (quantity !== undefined) {
      sale.quantity = quantity;
    }
    if (price !== undefined) {
      sale.price = price;
    }

    // Update credit details if applicable
    if (isCredit !== undefined) {
      sale.isCredit = isCredit;
      if (isCredit && creditDetails) {
        sale.creditDetails.amountOwed = creditDetails.amountOwed || sale.creditDetails.amountOwed;
        sale.creditDetails.paymentStatus = creditDetails.paymentStatus || sale.creditDetails.paymentStatus;
      } else {
        sale.creditDetails = {}; // Reset credit details if the sale is no longer on credit
      }
    }

    // Save updated sale
    const updatedSale = await sale.save();

    return res.status(200).json({
      resultMessage: getText('00094'), // Sale updated successfully
      resultCode: '00094',
      sale: updatedSale,
    });
  } catch (err) {
    console.error('Error updating sale:', err);
    return res.status(500).json(errorHelper('00090', req, err.message)); // Error handling
  }
};


