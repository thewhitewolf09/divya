/**
 * @swagger
 * /api/sales/product/{productId}:
 *   get:
 *     summary: Retrieve sales report for a specific product within a date range
 *     description: Fetch the total quantity sold and total revenue generated for a specific product within the specified start and end dates.
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product for which to retrieve the sales report
 *         schema:
 *           type: string
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
 *         description: Sales report for the specified product fetched successfully
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
 *                 report:
 *                   type: object
 *                   properties:
 *                     totalSold:
 *                       type: integer
 *                       description: The total quantity sold during the given period
 *                     totalRevenue:
 *                       type: number
 *                       format: float
 *                       description: The total revenue generated from the sales during the given period
 *       400:
 *         description: Invalid request (missing product ID, dates, or invalid date format)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message indicating a bad request
 *                 resultCode:
 *                   type: string
 *                   description: Error code for invalid request
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message indicating that the product was not found
 *                 resultCode:
 *                   type: string
 *                   description: Error code for product not found
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


import { Product, Sale } from "../../models/index.js"; // Import your models
import { errorHelper, getText } from "../../utils/index.js";
import mongoose from "mongoose";

export default async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query; // Expecting dates in query params

  // Validate the ID
  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No product ID provided."
      resultCode: "00022",
    });
  }

  // Validate the dates
  if (!startDate || !endDate) {
    return res.status(400).json({
      resultMessage: getText("00023"), // "Start date and end date are required."
      resultCode: "00023",
    });
  }

  try {
    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        resultMessage: getText("00024"), // "Invalid date format."
        resultCode: "00024",
      });
    }

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        resultMessage: getText("00052"), // "Product not found."
        resultCode: "00052",
      });
    }

    // Fetch sales data
    const sales = await Sale.aggregate([
      {
        $match: {
          productId: mongoose.Types.ObjectId(id),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$productId",
          totalSold: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } }
        }
      }
    ]);

    // Prepare report data
    const report = sales.length > 0 ? sales[0] : { totalSold: 0, totalRevenue: 0 };

    return res.status(200).json({
      resultMessage: getText("00089"), // "Sales report retrieved successfully."
      resultCode: "00089",
      report
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};


