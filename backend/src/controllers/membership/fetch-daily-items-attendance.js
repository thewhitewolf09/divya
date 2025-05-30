/**
 * @swagger
 * /api/customers/{id}/daily-items/attendance:
 *   get:
 *     summary: Get daily attendance data for a customer's items
 *     description: Retrieves the attendance data for daily items associated with a customer, including item names, quantities per day, and attendance status.
 *     tags:
 *       - Membership
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the customer for whom daily item attendance is being retrieved.
 *         schema:
 *           type: string
 *           example: "60d5f7f3b6b8f62b8b9f3c6d"
 *     responses:
 *       200:
 *         description: Successfully retrieved the daily item attendance data for the customer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Successfully retrieved daily item attendance."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 dailyItemAttendance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       itemName:
 *                         type: string
 *                         example: "Item A"
 *                       quantityPerDay:
 *                         type: number
 *                         example: 5
 *                       attendance:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "Present"
 *       400:
 *         description: Missing customer ID.
 *       404:
 *         description: Customer not found or no daily items available for the customer.
 *       500:
 *         description: Internal server error.
 */



import { Customer } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;

  // Check if the customer ID is provided
  if (!id) {
    return res.status(400).json({
      resultMessage: "Missing customer ID", // Missing customer ID error
      resultCode: "00022",
    });
  }

  try {
    // Fetch customer details with populated fields
    const customer = await Customer.findById(id)
      .populate("addedBy")
      .populate("shops")
      .populate("dailyItems.itemName")
      .exec();

    // If customer is not found, return an error
    if (!customer) {
      return res.status(404).json({
        resultMessage: "Customer not found", // Customer not found error
        resultCode: "00052",
      });
    }

    // Check if the customer has daily items
    if (!customer.dailyItems || Object.keys(customer.dailyItems).length === 0) {
      return res.status(404).json({
        resultMessage: "No daily items found for the customer", // No daily items error
        resultCode: "00093",
      });
    }

    // Prepare attendance data
    const dailyItemAttendance = Object.entries(customer.dailyItems).map(
      ([itemName, itemData]) => ({
        itemName,
        quantityPerDay: itemData.quantityPerDay,
        attendance: Array.from(itemData.attendance.values()),
      })
    );

    // Return success response with daily item attendance
    return res.status(200).json({
      resultMessage: "Successfully retrieved daily item attendance", // Success message
      resultCode: "00089",
      dailyItemAttendance,
    });
  } catch (err) {
    console.error("Error fetching daily item attendance:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Internal server error handling
  }
};
