/**
 * @swagger
 * /api/sales/range:
 *   get:
 *     summary: Retrieve sales by date range
 *     description: Fetch all sales records within the specified date range.
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           example: "01/01/2024"
 *           description: Start date in DD/MM/YYYY format
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           example: "31/12/2024"
 *           description: End date in DD/MM/YYYY format
 *     responses:
 *       200:
 *         description: Sales data fetched successfully
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
 *                       productId:
 *                         type: object
 *                         description: Product details related to the sale
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                             format: float
 *                       customerId:
 *                         type: object
 *                         description: Customer details related to the sale
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: Date of the sale
 *                       quantity:
 *                         type: integer
 *                         description: Quantity of product sold
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: Price of the sale
 *       400:
 *         description: Missing or invalid date range parameters
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

import { Sale } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

// Helper function to parse date in DD/MM/YYYY format
const parseDate = (dateString) => {
  const [day, month, year] = dateString.split("/");
  return new Date(`${year}-${month}-${day}`);
};

export default async (req, res) => {
  const { startDate, endDate } = req.query;

  // Ensure both startDate and endDate are provided
  if (!startDate || !endDate) {
    return res.status(400).json({
      resultMessage: "Missing date range.",
      resultCode: "00026",
    });
  }

  try {
    // Parse dates from DD/MM/YYYY format to valid Date objects
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    // Check if parsed dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        resultMessage: "Invalid date format.",
        resultCode: "00027",
      });
    }

    // Fetch sales within the specified date range
    const sales = await Sale.find({
      date: {
        $gte: start,
        $lte: end,
      },
    });

    return res.status(200).json({
      resultMessage: "Sales data fetched successfully.",
      resultCode: "00096",
      sales, // Return sales data directly
    });
  } catch (err) {
    console.error("Error fetching sales by date range:", err);
    return res.status(500).json({
      resultMessage: "An error occurred while fetching sales data.",
      resultCode: "00090",
      error: err.message,
    });
  }
};
