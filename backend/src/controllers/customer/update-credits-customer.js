/**
 * @swagger
 * /api/customers/credit/{customerId}/payment:
 *   patch:
 *     summary: Update credit payment status for a customer
 *     description: Updates the payment status for a customer's credit sales and modifies the credit balance based on the provided payment status and amount paid.
 *     tags:
 *       - Customer
 *     parameters:
 *       - name: customerId
 *         in: path
 *         required: true
 *         description: The ID of the customer whose credit payment is being updated.
 *         schema:
 *           type: string
 *           example: "60d5f7f3b6b8f62b8b9f3c6d"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: ["pending", "paid", "partially_paid"]
 *                 description: The new payment status for the customer's credit.
 *                 example: "paid"
 *               amountPaid:
 *                 type: number
 *                 format: float
 *                 description: The amount paid by the customer (required if paymentStatus is "partially_paid").
 *                 example: 500.0
 *     responses:
 *       200:
 *         description: Successfully updated the credit payment status for the customer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Payment updated successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 customer:
 *                   $ref: "#/components/schemas/Customer"
 *       400:
 *         description: Invalid payment status or amount.
 *       404:
 *         description: Customer or credit sales not found.
 *       500:
 *         description: Internal server error.
 */

import { Sale, Customer, User, Notification } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";
import { sendPushNotification } from "../../utils/sendNotification.js";

export default async (req, res) => {
  const { customerId } = req.params; // Get customer ID from params
  const { paymentStatus, amountPaid } = req.body;

  // Validate paymentStatus
  if (!["pending", "paid", "partially_paid"].includes(paymentStatus)) {
    return res.status(400).json({
      resultMessage: getText("00025"), // Invalid payment status
      resultCode: "00025",
    });
  }

  try {
    // Find the customer by ID
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        resultMessage: getText("00093"), // Customer not found
        resultCode: "00093",
      });
    }

    // Find the customer's credit sales
    const creditSales = await Sale.find({
      customerId: customerId,
      isCredit: true,
    });

    if (!creditSales.length) {
      return res.status(404).json({
        resultMessage: getText("00092"), // No credit sales found for this customer
        resultCode: "00092",
      });
    }

    // Total credit owed by the customer
    let totalOwed = parseFloat(customer.creditBalance.toFixed(2));

    if (paymentStatus === "paid") {
      customer.creditBalance = 0;
      creditSales.forEach((sale) => {
        sale.creditDetails.amountOwed = 0;
        sale.creditDetails.paymentStatus = "paid";
      });
    } else if (paymentStatus === "partially_paid") {
      if (!amountPaid || amountPaid <= 0 || amountPaid > totalOwed) {
        return res.status(400).json({
          resultMessage: getText("00026"), // Invalid amount
          resultCode: "00026",
        });
      }

      // Deduct the amount paid from the customer's credit balance
      customer.creditBalance = parseFloat(
        (customer.creditBalance - amountPaid).toFixed(2)
      );

      // Update the sales based on the payment
      let remainingAmount = parseFloat(amountPaid.toFixed(2));

      for (const sale of creditSales) {
        if (remainingAmount <= 0) break;

        const saleOwed = parseFloat(sale.creditDetails.amountOwed.toFixed(2));
        if (remainingAmount >= saleOwed) {
          sale.creditDetails.amountOwed = 0;
          sale.creditDetails.paymentStatus = "paid";
          remainingAmount = parseFloat((remainingAmount - saleOwed).toFixed(2));
        } else {
          sale.creditDetails.amountOwed = parseFloat(
            (saleOwed - remainingAmount).toFixed(2)
          );
          sale.creditDetails.paymentStatus = "partially_paid";
          remainingAmount = 0;
        }
      }
    } else if (paymentStatus === "pending") {
      // No need to change anything if status is pending
      creditSales.forEach((sale) => {
        sale.creditDetails.paymentStatus = "pending";
      });
    }

    // Save updated customer and sales
    await customer.save();
    for (const sale of creditSales) {
      await sale.save();
    }

    // Notifications
    // Notify the customer
    if (customer.deviceToken) {
      const customerMessage = {
        title: "Payment Update",
        body:
          paymentStatus === "paid"
            ? "Your udhar payment has been confirmed as fully paid."
            : `Your udhar payment of ₹${amountPaid} has been confirmed.`,
        data: {
          paymentStatus,
          amountPaid,
          totalBalance: customer.creditBalance,
        },
      };

      await sendPushNotification([customer.deviceToken], customerMessage);

      // Save customer notification in the database
      await Notification.create({
        title: customerMessage.title,
        message: customerMessage.body,
        recipientRole: "customer",
        recipientId: customer._id,
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
        title: "Udhar Payment Received",
        body:
          paymentStatus === "paid"
            ? `Customer ${customer.name} has paid their full udhar of ₹${totalOwed}.`
            : `Customer ${customer.name} has paid ₹${amountPaid} towards their udhar.`,
        data: {
          customerId: customer._id,
          customerName: customer.name,
          paymentStatus,
        },
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

    // Return the updated customer along with the credit details of the sales
    return res.status(200).json({
      resultMessage: getText("00089"), // Payment updated successfully
      resultCode: "00089",
      customer,
    });
  } catch (err) {
    console.error("Error updating credit sale payment:", err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Error handling
  }
};
