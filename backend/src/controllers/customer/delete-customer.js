/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer by ID
 *     description: Allows an authenticated user to delete an existing customer by their unique ID. The user must have permission to delete the customer (i.e., the customer must be added by the authenticated user).
 *     tags:
 *       - Customer
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the customer to be deleted.
 *         schema:
 *           type: string
 *           example: "60d60eafefbd070015f19a56"
 *     responses:
 *       200:
 *         description: Successfully deleted the customer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Customer deleted successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *       400:
 *         description: Missing customer ID.
 *       403:
 *         description: Permission denied to delete the customer.
 *       404:
 *         description: Customer not found with the given ID.
 *       500:
 *         description: Internal server error.
 */

import { Customer } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id; // Assuming you have user authentication and can get the user ID

  if (!id) {
    return res.status(400).json({
      resultMessage: "Customer ID is required", // Error message for missing customer ID
      resultCode: "00022",
    });
  }

  try {
    // Find the customer by ID
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        resultMessage: "Customer not found", // Error message for customer not found
        resultCode: "00052",
      });
    }

    // Optional: Check if the user making the request has permissions to delete this customer
    if (customer.addedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        resultMessage: "Permission denied", // Error message for permission denial
        resultCode: "00017",
      });
    }

    // Delete the customer
    await Customer.findByIdAndDelete(id);

    return res.status(200).json({
      resultMessage: "Customer deleted successfully", // Success message for customer deletion
      resultCode: "00089",
    });
  } catch (err) {
    console.error("Error deleting customer:", err);
    return res.status(500).json({
      resultMessage: "Internal server error while deleting customer", // General error message for deletion failure
      resultCode: "00008",
      error: err.message,
    }); // Error handling
  }
};
