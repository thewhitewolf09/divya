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
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const { month, year } = req.query;

  if (!id || !month || !year) {
    return res.status(400).json({
      resultMessage: getText("00022"), // Missing required fields
      resultCode: "00022",
    });
  }

  try {
    // Fetch customer details with populated dailyItems and itemName
    const customer = await Customer.findById(id)
      .populate("addedBy")
      .populate("shops")
      .populate("dailyItems.itemName") // populate itemName to get price directly
      .exec();

    if (!customer) {
      return res.status(404).json({
        resultMessage: getText("00052"), // Customer not found
        resultCode: "00052",
      });
    }

    // Ensure month is a number and between 1 and 12
    const monthNumber = parseInt(month, 10);
    if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({
        resultMessage: getText("00022"), // Invalid month
        resultCode: "00022",
      });
    }

    // Define the start and end of the month
    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 0); // Last day of the month

    let totalFee = 0;

    // Iterate over daily items and calculate the total fee
    for (const item of customer.dailyItems) {
      const itemName = item.itemName.name; // get the item name
      const price = item.itemName.price;   // get the price

      // Sum up the total fee for the month's attendance
      for (const record of item.attendance) {
        const recordDate = new Date(record.date);

        if (recordDate >= startDate && recordDate <= endDate && record.taken) {
          totalFee += record.quantity * price;
        }
      }
    }

    return res.status(200).json({
      resultMessage: getText("00089"), // Success message
      resultCode: "00089",
      totalFee,
    });
  } catch (err) {
    console.error("Error fetching membership summary:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
  }
};
