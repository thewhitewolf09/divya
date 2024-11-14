/**
 * @swagger
 * /api/customers/{id}/daily-items/{itemName}/quantity:
 *   post:
 *     summary: Update the daily quantity for a customer's item
 *     description: Updates the quantity per day for a specific daily item associated with a customer.
 *     tags:
 *       - Membership
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the customer whose daily item quantity is being updated.
 *         schema:
 *           type: string
 *           example: "60d5f7f3b6b8f62b8b9f3c6d"
 *       - name: itemName
 *         in: path
 *         required: true
 *         description: The name of the daily item whose quantity is being updated.
 *         schema:
 *           type: string
 *           example: "Item A"
 *       - name: quantity
 *         in: body
 *         required: true
 *         description: The new quantity to set for the daily item.
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Successfully updated the daily item quantity.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Successfully updated item quantity."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 customer:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d5f7f3b6b8f62b8b9f3c6d"
 *                     dailyItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemName:
 *                             type: string
 *                             example: "Item A"
 *                           quantityPerDay:
 *                             type: integer
 *                             example: 5
 *       400:
 *         description: Missing required fields (customer ID, item name, or quantity).
 *       404:
 *         description: Customer or daily item not found.
 *       500:
 *         description: Internal server error.
 */



import { Customer } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id, itemName } = req.params;
  const { quantity } = req.body;


  if (!id || !itemName || quantity === undefined) {
    return res.status(400).json({
      resultMessage: getText("00022"), // Missing required fields
      resultCode: "00022",
    });
  }

  try {
    // Fetch customer details without using lean()
    const customer = await Customer.findById(id)
      .populate("addedBy")
      .populate("shops")
      .populate("dailyItems.itemName")
      .exec();

    if (!customer) {
      return res.status(404).json({
        resultMessage: getText("00052"), // Customer not found
        resultCode: "00052",
      });
    }

    // Check if the item exists in dailyItems array
    const dailyItem = customer.dailyItems.find(
      (item) => item.itemName.name === itemName
    );

    if (!dailyItem) {
      return res.status(404).json({
        resultMessage: getText("00093"), // Daily item not found
        resultCode: "00093",
      });
    }

    // Update the quantity for the specific daily item
    dailyItem.quantityPerDay = quantity;

    // Save the updated customer record
    await customer.save();

    return res.status(200).json({
      resultMessage: getText("00089"), // Successfully updated item quantity
      resultCode: "00089",
      customer: customer, // Return the updated customer object
    });
  } catch (err) {
    console.error("Error updating daily item quantity:", err);
    return res.status(500).json(errorHelper("00008", req, err.message)); // Error handling
  }
};
