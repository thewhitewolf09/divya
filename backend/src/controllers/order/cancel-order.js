/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   put:
 *     summary: Cancel an order
 *     description: This endpoint is used to cancel an order. It checks the order's status, ensures it can be canceled, and updates the order's status to "Cancelled". It also handles associated sale and customer updates.
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order to be canceled.
 *         schema:
 *           type: string
 *           example: "60c72b2f9f1b2c001f7b3c6a"
 *     responses:
 *       200:
 *         description: Order canceled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message.
 *                   example: "Order canceled successfully."
 *                 resultCode:
 *                   type: string
 *                   description: Success result code.
 *                   example: "00094"
 *                 order:
 *                   type: object
 *                   description: The updated canceled order object.
 *       400:
 *         description: Bad request (Order already canceled or delivered)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message.
 *                   example: "Order is already canceled."
 *                 resultCode:
 *                   type: string
 *                   description: Error result code.
 *                   example: "00092"
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

import { Order, Sale, Customer, User, Notification } from "../../models/index.js"; // Import Order, Sale, and Customer models
import { errorHelper, getText } from "../../utils/index.js";
import { sendPushNotification } from "../../utils/sendNotification.js";

export default async (req, res) => {
  const { orderId } = req.params;

  try {
    // Find the order by its ID
    const order = await Order.findById(orderId)
      .populate("customerId")
      .populate("products.productId");

    // If the order doesn't exist, return a 404 error
    if (!order) {
      return res.status(404).json({
        resultMessage: getText("00030"), // "Order not found"
        resultCode: "00030",
      });
    }

    // Check if the order is already canceled or delivered
    if (order.status === "Cancelled") {
      return res.status(400).json({
        resultMessage: getText("00092"), // "Order is already canceled"
        resultCode: "00092",
      });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({
        resultMessage: getText("00093"), // "Delivered orders cannot be canceled"
        resultCode: "00093",
      });
    }

    // Gather sale IDs from the order products
    const saleIds = order.products
      .map((product) => product.saleId)
      .filter((saleId) => saleId);

    // Find and update associated sales and customers
    if (saleIds.length > 0) {
      const sales = await Sale.find({ _id: { $in: saleIds } }).populate(
        "customerId"
      );

      for (const sale of sales) {
        if (sale.customerId) {
          const totalPrice = (sale.price * sale.quantity).toFixed(2);
          const customer = await Customer.findById(sale.customerId);

          if (customer) {
            customer.totalPurchases -= totalPrice;
            await customer.save();
          }
        }

        // Delete the sale record
        await Sale.deleteOne({ _id: sale._id });
      }
    }

    // Update the order status to 'Cancelled'
    order.status = "Cancelled";
    const canceledOrder = await order.save();

    // Notifications
    // Notify the customer
    if (order.customerId && order.customerId.deviceToken) {
      const customerMessage = {
        title: "Order Canceled",
        body: `Your order #${order._id} has been canceled.`,
        data: { orderId: order._id },
      };

      await sendPushNotification(
        [order.customerId.deviceToken],
        customerMessage
      );

      // Save customer notification in the database
      await Notification.create({
        title: customerMessage.title,
        message: customerMessage.body,
        recipientRole: "customer",
        recipientId: order.customerId._id,
      });
    }

    // Notify the shop owner
    const adminUsers = await User.find({
      role: "shopOwner",
      deviceToken: { $exists: true },
    });
    const adminDeviceTokens = adminUsers
      .map((admin) => admin.deviceToken)
      .filter(Boolean);

    if (adminDeviceTokens.length > 0) {
      const adminMessage = {
        title: "Order Canceled",
        body: `Order #${order._id} has been canceled by the customer.`,
        data: { orderId: order._id },
      };

      await sendPushNotification(adminDeviceTokens, adminMessage);

      // Save admin notifications in the database
      const adminNotificationPromises = adminUsers.map((admin) =>
        Notification.create({
          title: adminMessage.title,
          message: adminMessage.body,
          recipientRole: "shopOwner",
          recipientId: admin._id,
        })
      );
      await Promise.all(adminNotificationPromises);
    }

    // Return the canceled order details
    return res.status(200).json({
      resultMessage: getText("00094"), // "Order canceled successfully"
      resultCode: "00094",
      order: canceledOrder, // Send the updated order with 'Cancelled' status
    });
  } catch (err) {
    console.error("Error canceling order:", err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Internal server error response
  }
};
