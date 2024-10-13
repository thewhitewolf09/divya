import { Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default  async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let dateFilter = {};

    // If the user provides a date range, filter the sales within that range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date

      dateFilter = {
        date: { $gte: start, $lte: end }
      };
    }

    // Fetch all sales or within the date range
    const sales = await Sale.find(dateFilter);

    if (sales.length === 0) {
      return res.status(404).json({
        resultMessage: getText("00091"), // No sales found
        resultCode: "00091",
      });
    }

    // Calculate the total sales, total revenue, and average sale amount
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
    const totalSales = sales.length;
    const averageSaleAmount = totalRevenue / totalSales;

    const summary = {
      totalSales,
      totalRevenue,
      averageSaleAmount: averageSaleAmount.toFixed(2), // Rounded to 2 decimal places
    };

    return res.status(200).json({
      resultMessage: getText("00089"), // Success
      resultCode: "00089",
      summary,
    });
  } catch (err) {
    console.error('Error fetching sales summary:', err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Error handling
  }
};


