/**
 * @swagger
 * /api/sales/monthly:
 *   get:
 *     summary: Retrieve sales for the current month
 *     description: Fetch sales data for the current month, including product and customer details.
 *     tags:
 *       - Sales
 *     responses:
 *       200:
 *         description: Monthly sales data fetched successfully
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
 *                 sales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the sale
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         description: The date of the sale
 *                       productId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: The ID of the product
 *                           name:
 *                             type: string
 *                             description: The name of the product
 *                           category:
 *                             type: string
 *                             description: The category of the product
 *                           price:
 *                             type: number
 *                             format: float
 *                             description: Price of the product
 *                       customerId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: The ID of the customer
 *                           name:
 *                             type: string
 *                             description: The name of the customer
 *                           email:
 *                             type: string
 *                             description: The email of the customer
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
 *                   description: Error code
 */


import { Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default async (req, res) => {
  try {
    // Get the current year and month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // JavaScript months are 0-based

    // Start and end dates for the current month
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59); // Last day of the month

    // Fetch the sales data for the current month
    const salesData = await Sale.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate('productId customerId'); // Populate to include product and customer details

    return res.status(200).json({
      resultMessage: getText("00089"), // Success message
      resultCode: "00089",
      sales: salesData,
    });
  } catch (err) {
    console.error('Error fetching monthly sales:', err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Error handling
  }
};
