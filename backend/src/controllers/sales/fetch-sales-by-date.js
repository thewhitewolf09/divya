import { Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default async (req, res) => {
  const { startDate, endDate } = req.query;

  // Ensure both startDate and endDate are provided
  if (!startDate || !endDate) {
    return res.status(400).json({
      resultMessage: getText('00026'), // Missing date range
      resultCode: '00026',
    });
  }

  try {
    // Parse dates to ensure valid format
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch sales within the specified date range
    const sales = await Sale.find({
      date: {
        $gte: start,
        $lte: end,
      },
    });

    // Calculate total sales and quantities
    const totalSales = sales.length;
    const totalQuantity = sales.reduce((acc, sale) => acc + sale.quantity, 0);
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.price * sale.quantity, 0);

    return res.status(200).json({
      resultMessage: getText('00096'), // Sales data fetched successfully
      resultCode: '00096',
      data: {
        totalSales,
        totalQuantity,
        totalRevenue,
        sales,
      },
    });
  } catch (err) {
    console.error('Error fetching sales by date range:', err);
    return res.status(500).json(errorHelper('00090', req, err.message)); // Error handling
  }
};


