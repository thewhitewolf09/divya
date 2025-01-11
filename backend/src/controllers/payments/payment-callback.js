/**
 * @swagger
 * /api/payments/callback:
 *   post:
 *     summary: Callback for payment status update
 *     description: This endpoint receives the payment status from the payment gateway and updates the payment and order status accordingly.
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: The transaction ID and status received from the payment gateway to update the payment and order status.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: The unique transaction ID provided by the payment gateway.
 *               status:
 *                 type: string
 *                 enum: [Success, Failed]
 *                 description: The status of the payment, either "Success" or "Failed".
 *             required:
 *               - transactionId
 *               - status
 *     responses:
 *       200:
 *         description: Payment status successfully updated, and order status is updated accordingly.
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
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid payment status or other errors in the callback data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                 resultCode:
 *                   type: string
 *       404:
 *         description: Payment or order not found.
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
 *         Order:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             status:
 *               type: string
 *             totalAmount:
 *               type: number
 *               format: float
 *             products:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: string
 *                   quantity:
 *                     type: number
 *             payment:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 transactionId:
 *                   type: string
 */

import { Payment, Order } from "../../models/index.js"; // Import Payment and Order models
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { transactionId, status } = req.body; // Data from payment gateway callback (e.g., transaction ID, payment status)

  try {
    // Find the payment by transaction ID
    const payment = await Payment.findOne({ transactionId });

    if (!payment) {
      return res.status(404).json({
        resultMessage: "Payment record not found.",
        resultCode: "40401", // Custom error code for payment not found
      });
    }

    // Check if the status is valid (Success or Failed)
    if (!["Success", "Failed"].includes(status)) {
      return res.status(400).json({
        resultMessage: "Invalid payment status.",
        resultCode: "40001", // Custom error code for invalid payment status
      });
    }

    // Update payment status based on the callback
    payment.status = status;
    await payment.save();

    // Find the corresponding order
    const order = await Order.findById(payment.orderId);
    if (!order) {
      return res.status(404).json({
        resultMessage: "Order not found.",
        resultCode: "40402", // Custom error code for order not found
      });
    }

    // Update order status based on payment success or failure
    if (status === "Success") {
      order.status = "Shipped"; // Update order status to Shipped or next step after successful payment
    } else if (status === "Failed") {
      order.status = "Payment Failed"; // Optionally update order status
    }
    await order.save();

    // Respond with success
    return res.status(200).json({
      resultMessage: "Payment status updated successfully.",
      resultCode: "20001", // Custom success code for successfully updating payment status
      payment,
      order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("50001", req, err.message)); // Custom error code for server errors
  }
};
