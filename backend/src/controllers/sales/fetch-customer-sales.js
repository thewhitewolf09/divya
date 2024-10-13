import { Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default  async (req, res) => {
  const { customerId } = req.params;

  if (!customerId) {
    return res.status(400).json({
      resultMessage: getText("00025"), // Invalid customer ID
      resultCode: "00025",
    });
  }

  try {
    const customerSales = await Sale.find({ customerId })
      .populate('productId') // Optionally populate product details
      .exec();

    if (customerSales.length === 0) {
      return res.status(404).json({
        resultMessage: getText("00091"), // No sales found for this customer
        resultCode: "00091",
      });
    }

    // Format the sales data
    const formattedSales = customerSales.map((sale) => ({
      saleId: sale._id,
      productId: sale.productId?._id,
      productName: sale.productId?.name,
      quantity: sale.quantity,
      price: sale.price,
      totalAmount: sale.quantity * sale.price,
      isCredit: sale.isCredit,
      creditDetails: sale.isCredit ? sale.creditDetails : null,
      date: sale.date,
    }));

    return res.status(200).json({
      resultMessage: getText("00089"), // Success message
      resultCode: "00089",
      sales: formattedSales,
    });
  } catch (err) {
    console.error('Error fetching customer sales:', err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Error handling
  }
};


