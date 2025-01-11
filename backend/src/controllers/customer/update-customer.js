/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer details by ID
 *     description: Allows an authenticated user to update the details of an existing customer by their unique ID. Only the provided fields will be updated.
 *     tags:
 *       - Customer
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the customer to be updated.
 *         schema:
 *           type: string
 *           example: "60d60eafefbd070015f19a56"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               mobile:
 *                 type: string
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               address:
 *                 type: string
 *                 example: "123 Street Name, City, Country"
 *               notes:
 *                 type: string
 *                 example: "Customer notes here"
 *               membershipStatus:
 *                 type: string
 *                 example: "Active"
 *               creditBalance:
 *                 type: number
 *                 example: 5000
 *               whatsappNumber:
 *                 type: string
 *                 example: "0987654321"
 *     responses:
 *       200:
 *         description: Successfully updated customer details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Customer updated successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 customer:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d60eafefbd070015f19a56"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     mobile:
 *                       type: string
 *                       example: "1234567890"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     address:
 *                       type: string
 *                       example: "123 Street Name, City, Country"
 *                     membershipStatus:
 *                       type: string
 *                       example: "Active"
 *                     creditBalance:
 *                       type: number
 *                       example: 5000
 *                     whatsappNumber:
 *                       type: string
 *                       example: "0987654321"
 *       400:
 *         description: Invalid customer ID or missing required data.
 *       404:
 *         description: Customer not found with the given ID.
 *       500:
 *         description: Internal server error.
 */

import { Customer } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user._id;

  // Validate if the customer ID is provided
  if (!id) {
    return res.status(400).json({
      resultMessage: "Missing customer ID.",
      resultCode: "00022",
    });
  }

  try {
    // Find the customer by ID and populate necessary fields
    const customer = await Customer.findById(id)
      .populate("addedBy")
      .populate({
        path: "dailyItems.itemName",
      })
      .populate("shops");

    // Check if customer exists
    if (!customer) {
      return res.status(404).json({
        resultMessage: "Customer not found.",
        resultCode: "00052",
      });
    }

    // Update customer fields based on the request body
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        if (
          ["street", "city", "state", "postalCode", "country"].includes(key)
        ) {
          // Ensure address object exists
          customer.address = customer.address || {};
          customer.address[key] = updates[key];
        } else {
          customer[key] = updates[key];
        }
      }
    });

    // Save the updated customer data to the database
    const updatedCustomer = await customer.save();

    // Respond with success message
    return res.status(200).json({
      resultMessage: "Customer updated successfully.",
      resultCode: "00089",
      customer: updatedCustomer,
    });
  } catch (err) {
    console.error("Error updating customer details:", err);
    return res.status(500).json({
      resultMessage: "Internal server error while updating customer details.",
      resultCode: "00008",
      error: err.message,
    });
  }
};
