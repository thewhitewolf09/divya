/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete a sale
 *     description: Delete a sale by its ID and update the associated customer's total purchases and credit balance accordingly.
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the sale to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message
 *                 resultCode:
 *                   type: string
 *                   description: Success code
 *       404:
 *         description: Sale not found with the provided ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message
 *                 resultCode:
 *                   type: string
 *                   description: Error code
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
 *                 resultCode:
 *                   type: string
 *                   description: Error code
 */


import { Sale, Customer } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the sale exists
    const sale = await Sale.findById(id).populate("customerId");

    if (!sale) {
      return res.status(404).json({
        resultMessage: getText("00093"), // Sale not found
        resultCode: "00093",
      });
    }

    // Update the customer
    if (sale.customerId) {
      const totalPrice = (sale.price * sale.quantity).toFixed(2);

      const customer = await Customer.findById(sale.customerId);

      if (customer) {
        // Update totalPurchases
        customer.totalPurchases -= totalPrice;

        if (sale.isCredit) {
          customer.creditBalance -= totalPrice; 
        }

        // Save the updated customer document
        await customer.save();
      }
    }

    // Delete the sale
    await Sale.deleteOne({ _id: id });

    return res.status(200).json({
      resultMessage: getText("00095"), // Sale deleted successfully
      resultCode: "00095",
    });
  } catch (err) {
    console.error("Error deleting sale:", err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Error handling
  }
};
