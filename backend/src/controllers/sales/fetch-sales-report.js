/**
 * @swagger
 * /api/sales/report:
 *   get:
 *     summary: Generate a sales report within a date range
 *     description: Retrieve a detailed sales report, including total sales, total items sold, and total credit sales for a specific period. The report also includes a list of all sales with customer and product details.
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         description: The start date for the sales report in ISO format (e.g., "2024-01-01")
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         description: The end date for the sales report in ISO format (e.g., "2024-01-31")
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Sales report retrieved successfully
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
 *                 reportSummary:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: number
 *                       format: float
 *                       description: Total revenue generated during the specified period
 *                     totalItemsSold:
 *                       type: integer
 *                       description: Total quantity of items sold during the specified period
 *                     totalCreditSales:
 *                       type: integer
 *                       description: Total number of credit sales during the specified period
 *                     salesCount:
 *                       type: integer
 *                       description: Total number of sales transactions during the specified period
 *                 sales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       saleId:
 *                         type: string
 *                         description: The ID of the sale
 *                       productId:
 *                         type: string
 *                         description: The ID of the sold product
 *                       productName:
 *                         type: string
 *                         description: The name of the sold product
 *                       customerId:
 *                         type: string
 *                         description: The ID of the customer who made the purchase
 *                       customerName:
 *                         type: string
 *                         description: The name of the customer
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the product sold
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: The price per unit of the product
 *                       totalAmount:
 *                         type: number
 *                         format: float
 *                         description: The total amount for the sale (quantity * price)
 *                       isCredit:
 *                         type: boolean
 *                         description: Whether the sale was on credit
 *                       creditDetails:
 *                         type: object
 *                         description: Credit details if the sale was on credit
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time of the sale
 *       400:
 *         description: Invalid request (missing startDate or endDate)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message indicating missing or invalid parameters
 *                 resultCode:
 *                   type: string
 *                   description: Error code for invalid request
 *       404:
 *         description: No sales found for the specified period
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message indicating no sales were found
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


