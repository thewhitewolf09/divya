/**
 * @swagger
 * /api/customers/filter/date-range:
 *   get:
 *     summary: Filter customers by registration date range
 *     description: Filters customers based on their registration date, allowing for a date range query. Both `startDate` and `endDate` are required for the filter.
 *     tags:
 *       - Customer
 *     parameters:
 *       - name: startDate
 *         in: query
 *         required: true
 *         description: The start date of the registration date range. The format should be YYYY-MM-DD.
 *         schema:
 *           type: string
 *           example: "2023-01-01"
 *       - name: endDate
 *         in: query
 *         required: true
 *         description: The end date of the registration date range. The format should be YYYY-MM-DD.
 *         schema:
 *           type: string
 *           example: "2023-12-31"
 *     responses:
 *       200:
 *         description: Successfully retrieved customers based on the specified date range.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Successfully retrieved customers."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 customers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Jane Doe"
 *                       mobile:
 *                         type: string
 *                         example: "9876543210"
 *                       registrationDate:
 *                         type: string
 *                         format: date
 *                         example: "2023-05-01"
 *       400:
 *         description: Missing required query parameters `startDate` or `endDate`.
 *       500:
 *         description: Internal server error.
 */

import { Customer, Sale } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { startDate, endDate } = req.query;

  // Validate query parameters
  if (!startDate || !endDate) {
    return res.status(400).json({
      resultMessage: "Both startDate and endDate are required.", // Missing required fields error message
      resultCode: "00022",
    });
  }

  try {
    // Build the query object
    let query = {
      registrationDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    // Fetch customers based on the date range
    const customers = await Customer.find(query);

    return res.status(200).json({
      resultMessage:
        "Successfully retrieved customers within the specified date range.", // Success message
      resultCode: "00089",
      customers,
    });
  } catch (err) {
    console.error("Error fetching customers by date range:", err);
    return res.status(500).json({
      resultMessage:
        "Internal server error while fetching customers by date range.", // Error message
      resultCode: "00008",
      error: err.message,
    });
  }
};
