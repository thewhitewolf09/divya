/**
 * @swagger
 * /api/customers/{id}/credit/outstanding:
 *   get:
 *     summary: Get outstanding credit for a customer
 *     description: Retrieves the outstanding credit transactions for a customer based on their ID, where the credit payment status is either "pending" or "partially_paid".
 *     tags:
 *       - Customer
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the customer for whom the outstanding credit transactions are to be fetched.
 *         schema:
 *           type: string
 *           example: "60d5f7f3b6b8f62b8b9f3c6d"
 *     responses:
 *       200:
 *         description: Successfully retrieved outstanding credit transactions for the customer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Successfully retrieved outstanding credits."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 outstandingCredits:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       saleId:
 *                         type: string
 *                         example: "60d5f7f3b6b8f62b8b9f3c6d"
 *                       amount:
 *                         type: number
 *                         example: 1000
 *                       dueDate:
 *                         type: string
 *                         example: "2024-11-30"
 *                       paymentStatus:
 *                         type: string
 *                         example: "pending"
 *       400:
 *         description: Missing or invalid customer ID.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Internal server error.
 */

import { Customer, Sale } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      resultMessage: "Customer ID is required.", // Missing customer ID
      resultCode: "00022",
    });
  }

  try {
    // Check if the customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        resultMessage: "Customer not found.", // Customer not found
        resultCode: "00052",
      });
    }

    // Fetch outstanding credit transactions for the customer
    const outstandingCredits = await Sale.find({
      customerId: id,
      isCredit: true,
      "creditDetails.paymentStatus": { $in: ["pending", "partially_paid"] },
    });

    return res.status(200).json({
      resultMessage: "Successfully retrieved outstanding credits.", // Success message
      resultCode: "00089",
      outstandingCredits,
    });
  } catch (err) {
    console.error("Error fetching outstanding credits:", err);
    return res.status(500).json({
      resultMessage:
        "Internal server error while fetching outstanding credits.", // Error message
      resultCode: "00008",
      error: err.message,
    });
  }
};
