/**
 * @swagger
 * /api/orders/{orderId}:
 *   put:
 *     summary: Update the status, payment status, or delivery address of an order
 *     description: This endpoint allows updating an existing order's status, payment status, or delivery address. The order will be updated with the provided data.
 *     tags:
 *       - Order
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order to update.
 *         schema:
 *           type: string
 *           example: "60c72b2f9f1b2c001f7b3c6a"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the order (e.g., "Shipped", "Delivered", "Cancelled").
 *                 example: "Shipped"
 *               paymentStatus:
 *                 type: string
 *                 description: The new payment status (e.g., "Completed", "Failed").
 *                 example: "Completed"
 *               deliveryAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     description: The street address for delivery.
 *                     example: "123 Main St"
 *                   city:
 *                     type: string
 *                     description: The city for delivery.
 *                     example: "Mumbai"
 *                   state:
 *                     type: string
 *                     description: The state for delivery.
 *                     example: "Maharashtra"
 *                   postalCode:
 *                     type: string
 *                     description: The postal code for delivery.
 *                     example: "400001"
 *                   country:
 *                     type: string
 *                     description: The country for delivery.
 *                     example: "India"
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message.
 *                   example: "Order updated successfully."
 *                 resultCode:
 *                   type: string
 *                   description: Success result code.
 *                   example: "00091"
 *                 order:
 *                   type: object
 *                   description: The updated order object.
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The order ID.
 *                       example: "60c72b2f9f1b2c001f7b3c6a"
 *                     status:
 *                       type: string
 *                       description: Current status of the order.
 *                       example: "Shipped"
 *                     payment:
 *                       type: object
 *                       description: Payment details of the order.
 *                       properties:
 *                         status:
 *                           type: string
 *                           description: Payment status.
 *                           example: "Completed"
 *                         method:
 *                           type: string
 *                           description: Payment method.
 *                           example: "Credit Card"
 *                     deliveryAddress:
 *                       type: object
 *                       description: Delivery address details.
 *                       properties:
 *                         street:
 *                           type: string
 *                           description: Street address.
 *                           example: "123 Main St"
 *                         city:
 *                           type: string
 *                           description: City for delivery.
 *                           example: "Mumbai"
 *                         state:
 *                           type: string
 *                           description: State for delivery.
 *                           example: "Maharashtra"
 *                         postalCode:
 *                           type: string
 *                           description: Postal code for delivery.
 *                           example: "400001"
 *                         country:
 *                           type: string
 *                           description: Country for delivery.
 *                           example: "India"
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
 *                   example: "Invalid order ID or parameters."
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
 *                   example: "00030"
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



import { Order } from "../../models/index.js"; // Import Order model
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { orderId } = req.params;
  const { status, paymentStatus, deliveryAddress } = req.body;

  try {
    // Find the order by its ID
    const order = await Order.findById(orderId).populate('customerId').populate('products.productId');

    // If the order doesn't exist, return a 404 error
    if (!order) {
      return res.status(404).json({
        resultMessage: getText("00030"), // "Order not found"
        resultCode: "00030",
      });
    }

    // Update order status, payment status, or delivery address if provided in the request body
    if (status) {
      order.status = status;
    }

    if (paymentStatus) {
      order.payment.status = paymentStatus;
    }

    if (deliveryAddress) {
      // Update only the fields provided to avoid overwriting unchanged fields
      order.deliveryAddress = {
        ...order.deliveryAddress,
        ...deliveryAddress,
      };
    }

    // Save the updated order
    const updatedOrder = await order.save();

    // Return the updated order details
    return res.status(200).json({
      resultMessage: getText("00091"), // "Order updated successfully"
      resultCode: "00091",
      order: updatedOrder, // Send the updated order back
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Internal server error response
  }
};
