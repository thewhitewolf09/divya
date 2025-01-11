/**
 * @swagger
 * /api/customers/{id}/membership-summary:
 *   get:
 *     summary: Fetch the total fee for a customer's membership for a specific month and year
 *     description: Retrieves the total fee a customer owes for a particular month and year, calculated based on daily attendance records for daily items.
 *     tags:
 *       - Membership
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the customer whose membership summary is being fetched.
 *         schema:
 *           type: string
 *           example: "60d5f7f3b6b8f62b8b9f3c6d"
 *       - name: month
 *         in: query
 *         required: true
 *         description: The month for which the membership summary is being calculated (1-12).
 *         schema:
 *           type: integer
 *           example: 11
 *       - name: year
 *         in: query
 *         required: true
 *         description: The year for which the membership summary is being calculated.
 *         schema:
 *           type: integer
 *           example: 2024
 *     responses:
 *       200:
 *         description: Successfully fetched the membership summary.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Successfully fetched membership summary."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 totalFee:
 *                   type: number
 *                   format: float
 *                   example: 500.00
 *       400:
 *         description: Missing required fields (customer ID, month, or year) or invalid month.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Internal server error.
 */

import { Customer } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const { month, year } = req.query;

  // Validate the required fields
  if (!id || !month || !year) {
    return res.status(400).json({
      resultMessage: "Missing required fields.",
      resultCode: "00022",
    });
  }

  try {
    // Fetch customer details with populated dailyItems and itemName (to get the price)
    const customer = await Customer.findById(id)
      .populate("addedBy")
      .populate("shops")
      .populate("dailyItems.itemName") // populate itemName to get price directly
      .exec();

    if (!customer) {
      return res.status(404).json({
        resultMessage: "Customer not found.",
        resultCode: "00052",
      });
    }

    // Ensure month is a valid number between 1 and 12
    const monthNumber = parseInt(month, 10);
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({
        resultMessage: "Invalid month value.",
        resultCode: "00022",
      });
    }

    // Define the start and end date for the month
    const startDate = new Date(year, monthNumber - 1, 1); // Start of the month
    const endDate = new Date(year, monthNumber, 0); // Last day of the month

    let totalFee = 0;

    // Iterate over each daily item to calculate the total fee
    for (const item of customer.dailyItems) {
      const itemName = item.itemName.name; // Get the item name
      const price = item.itemName.price; // Get the price of the item

      // Iterate through attendance records for the item
      for (const record of item.attendance) {
        const recordDate = new Date(record.date);

        // Check if the record's date is within the given month and if the item was taken
        if (recordDate >= startDate && recordDate <= endDate && record.taken) {
          totalFee += record.quantity * price; // Add to total fee if valid
        }
      }
    }

    // Return the calculated total fee
    return res.status(200).json({
      resultMessage: "Success", // "Membership summary fetched successfully"
      resultCode: "00089",
      totalFee, // Return the total fee calculated
    });
  } catch (err) {
    console.error("Error fetching membership summary:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Internal server error
  }
};
