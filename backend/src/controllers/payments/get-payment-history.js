/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Retrieve payment history of the authenticated customer
 *     description: This endpoint retrieves the payment history for the currently authenticated customer, sorted by most recent payments.
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the payment history.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Message indicating the result of the operation.
 *                 resultCode:
 *                   type: string
 *                   description: The result code indicating the success of the operation.
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *       404:
 *         description: No payment history found for the authenticated customer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                 resultCode:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                 resultCode:
 *                   type: string
 *                 error:
 *                   type: string
 *     components:
 *       schemas:
 *         Payment:
 *           type: object
 *           properties:
 *             orderId:
 *               type: string
 *             customerId:
 *               type: string
 *             amount:
 *               type: number
 *               format: float
 *             method:
 *               type: string
 *             status:
 *               type: string
 *             transactionId:
 *               type: string
 */




import { Payment } from "../../models/index.js"; // Import Payment model
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const customerId = req.user._id; // Assuming customer ID is retrieved from the authenticated user session

  try {
    // Fetch the payment history for the authenticated customer
    const payments = await Payment.find({ customerId }).sort({ createdAt: -1 }); // Sort payments by most recent

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        resultMessage: getText("00102"), // "No payment history found"
        resultCode: "00102",
      });
    }

    // Respond with the payment history
    return res.status(200).json({
      resultMessage: getText("00103"), // "Payment history retrieved successfully"
      resultCode: "00103",
      payments,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Internal server error response
  }
};
