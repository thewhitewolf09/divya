import { Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default  async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the sale exists
    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({
        resultMessage: getText('00093'), // Sale not found
        resultCode: '00093',
      });
    }

    // Delete the sale
    await sale.remove();

    return res.status(200).json({
      resultMessage: getText('00095'), // Sale deleted successfully
      resultCode: '00095',
    });
  } catch (err) {
    console.error('Error deleting sale:', err);
    return res.status(500).json(errorHelper('00090', req, err.message)); // Error handling
  }
};


