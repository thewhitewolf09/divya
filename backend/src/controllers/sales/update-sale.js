/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Update sale details
 *     description: Update the details of an existing sale based on the provided sale ID. Fields like quantity, price, and credit information can be updated.
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the sale to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated sale details. Only fields that need to be modified should be provided.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: New quantity of the product in the sale
 *               price:
 *                 type: number
 *                 format: float
 *                 description: New price of the product in the sale
 *               isCredit:
 *                 type: boolean
 *                 description: Whether the sale is a credit sale
 *               creditDetails:
 *                 type: object
 *                 properties:
 *                   amountOwed:
 *                     type: number
 *                     format: float
 *                     description: The amount owed in case of a credit sale
 *                   paymentStatus:
 *                     type: string
 *                     description: The status of the credit payment (e.g., "pending")
 *     responses:
 *       200:
 *         description: Sale updated successfully
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
 *                 sale:
 *                   type: object
 *                   description: Updated sale details
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Sale ID
 *                     quantity:
 *                       type: integer
 *                       description: Quantity of the product
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: Sale price per product
 *                     isCredit:
 *                       type: boolean
 *                       description: Indicates if the sale is on credit
 *                     creditDetails:
 *                       type: object
 *                       properties:
 *                         amountOwed:
 *                           type: number
 *                           format: float
 *                           description: Amount owed in credit sale
 *                         paymentStatus:
 *                           type: string
 *                           description: Payment status (e.g., "pending")
 *       400:
 *         description: Bad request. Invalid or missing fields.
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

import { Sale } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const { quantity, price, isCredit, creditDetails } = req.body;

  try {
    // Check if the sale exists
    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({
        resultMessage: "Sale not found.",
        resultCode: "40401", // Custom code for sale not found
      });
    }

    // Update sale details if provided
    if (quantity !== undefined) {
      sale.quantity = quantity;
    }
    if (price !== undefined) {
      sale.price = price;
    }

    // Update credit details if applicable
    if (isCredit !== undefined) {
      sale.isCredit = isCredit;
      if (isCredit && creditDetails) {
        sale.creditDetails.amountOwed =
          creditDetails.amountOwed || sale.creditDetails.amountOwed;
        sale.creditDetails.paymentStatus =
          creditDetails.paymentStatus || sale.creditDetails.paymentStatus;
      } else {
        sale.creditDetails = {}; // Reset credit details if the sale is no longer on credit
      }
    }

    // Save updated sale
    const updatedSale = await sale.save();

    return res.status(200).json({
      resultMessage: "Sale updated successfully.",
      resultCode: "20001", // Custom code for successful update
      sale: updatedSale,
    });
  } catch (err) {
    console.error("Error updating sale:", err);
    return res.status(500).json({
      resultMessage: "An error occurred while updating the sale.",
      resultCode: "50001", // Custom code for server error
      error: err.message,
    });
  }
};
