import { Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default  async (req, res) => {
  const { startDate, endDate } = req.query;

  // Validate query parameters
  if (!startDate || !endDate) {
    return res.status(400).json({
      resultMessage: getText("00025"), // Invalid date range
      resultCode: "00025",
    });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    // Fetch sales data within the specified date range
    const sales = await Sale.find({
      date: { $gte: start, $lte: end }
    }).populate('productId customerId').exec();

    if (sales.length === 0) {
      return res.status(404).json({
        resultMessage: getText("00091"), // No sales found for the period
        resultCode: "00091",
      });
    }

    // Format the sales data
    const formattedSales = sales.map((sale) => ({
      saleId: sale._id,
      productId: sale.productId?._id,
      productName: sale.productId?.name,
      customerId: sale.customerId?._id,
      customerName: sale.customerId?.name || 'N/A',
      quantity: sale.quantity,
      price: sale.price,
      totalAmount: sale.quantity * sale.price,
      isCredit: sale.isCredit,
      creditDetails: sale.isCredit ? sale.creditDetails : null,
      date: sale.date,
    }));

    // Generate report summary
    const totalSales = formattedSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItemsSold = formattedSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalCreditSales = formattedSales.filter(sale => sale.isCredit).length;

    const reportSummary = {
      totalSales,
      totalItemsSold,
      totalCreditSales,
      salesCount: formattedSales.length
    };

    return res.status(200).json({
      resultMessage: getText("00089"), // Success
      resultCode: "00089",
      reportSummary,
      sales: formattedSales,
    });
  } catch (err) {
    console.error('Error generating sales report:', err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Error handling
  }
};


