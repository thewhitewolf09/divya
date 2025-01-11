/**
 * @swagger
 * /api/customers/{id}/membership:
 *   patch:
 *     summary: Update a customer's membership status
 *     description: Updates the membership status of a customer to either "active" or "inactive".
 *     tags:
 *       - Membership
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the customer whose membership status is being updated.
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
 *               membershipStatus:
 *                 type: string
 *                 enum: ["active", "inactive"]
 *                 description: The new membership status of the customer.
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Successfully updated the membership status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Successfully updated membership status."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Missing required fields or invalid membership status.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Internal server error.
 */

import { Customer } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const { membershipStatus } = req.body;

  if (!id || !membershipStatus) {
    return res.status(400).json({
      resultMessage: "Missing required fields", // Missing required fields error
      resultCode: "00022",
    });
  }

  // Validate membershipStatus
  const validStatuses = ["active", "inactive"];
  if (!validStatuses.includes(membershipStatus)) {
    return res.status(400).json({
      resultMessage: "Invalid membership status", // Invalid membership status error
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
        resultMessage: "Customer not found", // Customer not found error
        resultCode: "00052",
      });
    }

    // Update membership status
    customer.membershipStatus = membershipStatus;
    const updatedCustomer = await customer.save();

    return res.status(200).json({
      resultMessage: "Successfully updated membership status", // Success message
      resultCode: "00089",
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error("Error updating membership status:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Internal server error handling
  }
};
