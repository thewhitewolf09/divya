import { Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default  async (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({
      resultMessage: getText("00025"), // Invalid parameters message
      resultCode: "00025",
    });
  }

  try {
    const targetYear = parseInt(year);
    const targetMonth = parseInt(month) - 1; // Month is 0-based in JavaScript (0 = January)

    // Start and end dates for the month
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59); // Last day of the month

    // Aggregate sales by day
    const salesData = await Sale.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            month: { $month: '$date' },
            year: { $year: '$date' },
          },
          totalSales: { $sum: { $multiply: ['$price', '$quantity'] } }, // Total revenue
          totalQuantity: { $sum: '$quantity' }, // Total quantity sold
          count: { $sum: 1 }, // Number of sales
        },
      },
      {
        $sort: { '_id.day': 1 }, // Sort by day
      },
    ]);

    // Format the response
    const formattedSales = salesData.map((sale) => ({
      date: `${sale._id.year}-${sale._id.month}-${sale._id.day}`,
      totalSales: sale.totalSales,
      totalQuantity: sale.totalQuantity,
      salesCount: sale.count,
    }));

    return res.status(200).json({
      resultMessage: getText("00089"), // Success message
      resultCode: "00089",
      sales: formattedSales,
    });
  } catch (err) {
    console.error('Error fetching monthly sales:', err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Error handling
  }
};


