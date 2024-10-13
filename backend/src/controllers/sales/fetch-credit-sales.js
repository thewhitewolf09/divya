import { Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default async (req, res) => {
  try {
    const creditSales = await Sale.find({ isCredit: true })
      .populate('productId') 
      .populate('customerId') 
      .exec();

    const formattedSales = creditSales.map((sale) => ({
      saleId: sale._id,
      productId: sale.productId?._id,
      productName: sale.productId?.name,
      customerId: sale.customerId?._id,
      customerName: sale.customerId?.name,
      quantity: sale.quantity,
      price: sale.price,
      totalAmount: sale.quantity * sale.price,
      creditDetails: sale.creditDetails,
      date: sale.date,
    }));

    return res.status(200).json({
      resultMessage: getText("00089"), // Success message
      resultCode: "00089",
      sales: formattedSales,
    });
  } catch (err) {
    console.error('Error fetching credit sales:', err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Error handling
  }
};


