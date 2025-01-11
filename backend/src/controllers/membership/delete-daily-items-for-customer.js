/**
 * @swagger
 * /api/customers/{id}/daily-items/{itemName}:
 *   delete:
 *     summary: Remove a daily item from a customer's record
 *     description: Removes a daily item (product) from a customer's record.
 *     tags:
 *       - Membership
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the customer whose daily item is to be removed.
 *         schema:
 *           type: string
 *           example: "60d5f7f3b6b8f62b8b9f3c6d"
 *       - name: itemName
 *         in: path
 *         required: true
 *         description: The name of the product to be removed from the customer's daily items.
 *         schema:
 *           type: string
 *           example: "Milk"
 *     responses:
 *       200:
 *         description: Successfully removed the daily item from the customer's record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Successfully removed daily item"
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Missing required fields or invalid input.
 *       404:
 *         description: Customer or daily item not found.
 *       500:
 *         description: Internal server error.
 */

import { Customer } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id, itemName } = req.params;

  if (!id || !itemName) {
    return res.status(400).json({
      resultMessage: "Missing required fields.",
      resultCode: "00022",
    });
  }

  try {
    // Find the customer
    const customer = await Customer.findById(id)
      .populate("addedBy")
      .populate("shops")
      .populate("dailyItems.itemName")
      .exec();

    if (!customer) {
      return res.status(404).json({
        resultMessage: "Customer not found.",
        resultCode: "00052",
      });
    }

    // Check if the daily item exists
    const dailyItemIndex = customer.dailyItems.findIndex(
      (item) => item.itemName.name === itemName
    );

    if (dailyItemIndex === -1) {
      return res.status(404).json({
        resultMessage: "Daily item not found.",
        resultCode: "00093",
      });
    }

    // Remove the daily item from the customer's record
    customer.dailyItems.splice(dailyItemIndex, 1);
    const updatedCustomer = await customer.save();

    return res.status(200).json({
      resultMessage: "Successfully removed daily item.",
      resultCode: "00089",
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error("Error removing daily item for customer:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Internal server error
  }
};
