/**
 * @swagger
 * /api/orders/order/{orderId}:
 *   get:
 *     summary: Get order details by ID
 *     description: This endpoint is used to retrieve the details of a specific order by its ID. It includes the order's products and the associated customer information.
 *     tags:
 *       - Order
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order to retrieve.
 *         schema:
 *           type: string
 *           example: "60c72b2f9f1b2c001f7b3c6a"
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message.
 *                   example: "Order details retrieved successfully."
 *                 resultCode:
 *                   type: string
 *                   description: Success result code.
 *                   example: "00089"
 *                 order:
 *                   type: object
 *                   description: The fetched order object.
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The order ID.
 *                       example: "60c72b2f9f1b2c001f7b3c6a"
 *                     customerId:
 *                       type: object
 *                       description: The associated customer object.
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: Customer ID.
 *                           example: "60c72b2f9f1b2c001f7b3c6b"
 *                         name:
 *                           type: string
 *                           description: Customer's name.
 *                           example: "John Doe"
 *                     products:
 *                       type: array
 *                       description: List of products in the order.
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: object
 *                             description: Product ID.
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: Product ID.
 *                                 example: "60c72b2f9f1b2c001f7b3c6c"
 *                           quantity:
 *                             type: number
 *                             description: Quantity of the product ordered.
 *                             example: 2
 *                           price:
 *                             type: number
 *                             description: Price per unit of the product.
 *                             example: 500
 *       400:
 *         description: Bad request (Missing or invalid parameters)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message.
 *                   example: "Invalid order ID."
 *                 resultCode:
 *                   type: string
 *                   description: Error result code.
 *                   example: "00025"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message.
 *                   example: "Order not found."
 *                 resultCode:
 *                   type: string
 *                   description: Error result code.
 *                   example: "00028"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message.
 *                   example: "Internal server error"
 *                 resultCode:
 *                   type: string
 *                   description: Error result code.
 *                   example: "00090"
 */

import { Order } from "../../models/index.js"; // Import the Order model
import { errorHelper } from "../../utils/index.js"; // Import utilities

export default async (req, res) => {
  const { orderId } = req.params; // Get the order ID from the request params

  // Validate the required parameter
  if (!orderId) {
    return res.status(400).json({
      resultMessage: "Order ID is required.", // Error message for missing orderId
      resultCode: "00025",
    });
  }

  try {
    // Find the order by ID, populate related fields like products and customer if needed
    const order = await Order.findById(orderId)
      .populate("customerId")
      .populate("products.productId");

    // Check if the order exists
    if (!order) {
      return res.status(404).json({
        resultMessage: "Order not found.", // Error message when order is not found
        resultCode: "00028",
      });
    }

    // Return the order details in the response
    return res.status(200).json({
      resultMessage: "Order fetched successfully.", // Success message
      resultCode: "00089",
      order, // Return the fetched order
    });
  } catch (err) {
    console.error(err);
    // Handle any errors during fetching
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
