/**
 * @swagger
 * /api/orders/all:
 *   get:
 *     summary: Retrieve all orders
 *     description: This endpoint fetches all orders from the database, including customer and product details.
 *     tags:
 *       - Order
 *     responses:
 *       200:
 *         description: A list of all orders successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message
 *                   example: "Orders fetched successfully"
 *                 resultCode:
 *                   type: string
 *                   description: Success result code
 *                   example: "00089"
 *                 orders:
 *                   type: array
 *                   description: List of orders
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The order ID
 *                         example: "60c72b2f9f1b2c001f7b3c6a"
 *                       customerId:
 *                         type: object
 *                         description: Customer details associated with the order
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Customer ID
 *                             example: "60c72b2f9f1b2c001f7b3c6b"
 *                           name:
 *                             type: string
 *                             description: Customer's full name
 *                             example: "John Doe"
 *                       products:
 *                         type: array
 *                         description: List of products in the order
 *                         items:
 *                           type: object
 *                           properties:
 *                             productId:
 *                               type: string
 *                               description: Product ID
 *                               example: "60c72b2f9f1b2c001f7b3c6c"
 *                             quantity:
 *                               type: number
 *                               description: Quantity of the product
 *                               example: 2
 *                             price:
 *                               type: number
 *                               description: Price of the product
 *                               example: 100
 *                       status:
 *                         type: string
 *                         description: Status of the order (e.g., "Shipped", "Delivered", "Cancelled")
 *                         example: "Shipped"
 *                       totalAmount:
 *                         type: number
 *                         description: Total order amount
 *                         example: 200
 *       404:
 *         description: No orders found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message
 *                   example: "No orders found"
 *                 resultCode:
 *                   type: string
 *                   description: Error result code
 *                   example: "00029"
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
 *                   example: "Internal server error"
 *                 resultCode:
 *                   type: string
 *                   description: Error result code
 *                   example: "00090"
 */

import { Order } from "../../models/index.js"; // Import Order model
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  try {
    // Fetch all orders, populating customer and product details if necessary
    const orders = await Order.find()
      .populate("customerId")
      .populate("products.productId");

    // If no orders found, return a not found response
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        resultMessage: "No orders found.",
        resultCode: "00029",
      });
    }

    // Return the list of all orders
    return res.status(200).json({
      resultMessage: "Orders fetched successfully.",
      resultCode: "00089",
      orders, // Send the list of all orders
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Internal server error response
  }
};
