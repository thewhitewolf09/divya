/**
 * @swagger
 * /api/sales/summary:
 *   get:
 *     summary: Retrieve a summary of sales within a date range
 *     description: Fetch a summary of total sales, total revenue, and average sale amount. Optionally, a date range can be provided to filter the data.
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         description: The start date for the sales summary in ISO format (e.g., "2024-01-01"). If not provided, all sales will be considered.
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         description: The end date for the sales summary in ISO format (e.g., "2024-01-31"). If not provided, all sales will be considered.
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Sales summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message
 *                 resultCode:
 *                   type: string
 *                   description: Success code
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: integer
 *                       description: Total number of sales
 *                     totalRevenue:
 *                       type: number
 *                       format: float
 *                       description: Total revenue generated
 *                     averageSaleAmount:
 *                       type: number
 *                       format: float
 *                       description: The average sale amount, rounded to two decimal places
 *       400:
 *         description: Invalid request (startDate or endDate format error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message indicating invalid date format or other parameter issues
 *                 resultCode:
 *                   type: string
 *                   description: Error code for invalid request
 *       404:
 *         description: No sales found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message indicating no sales found for the given period
 *                 resultCode:
 *                   type: string
 *                   description: Error code for no sales found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message
 *                 resultCode:
 *                   type: string
 *                   description: Error code for server errors
 */



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


