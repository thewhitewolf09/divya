/**
 * @swagger
 * /api/sales/outstanding:
 *   get:
 *     summary: Retrieve a list of outstanding credit sales
 *     description: Fetch a list of sales that are on credit with a payment status of 'pending' or 'partially_paid'.
 *     tags:
 *       - Sales
 *     responses:
 *       200:
 *         description: Outstanding credit sales retrieved successfully
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
 *                 outstandingCredits:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       saleId:
 *                         type: string
 *                         description: The ID of the sale
 *                       productId:
 *                         type: string
 *                         description: The ID of the product sold
 *                       customerId:
 *                         type: string
 *                         description: The ID of the customer
 *                       creditDetails:
 *                         type: object
 *                         properties:
 *                           paymentStatus:
 *                             type: string
 *                             enum:
 *                               - pending
 *                               - partially_paid
 *                             description: The payment status of the credit sale
 *       404:
 *         description: No outstanding credit sales found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message indicating no outstanding credit sales were found
 *                 resultCode:
 *                   type: string
 *                   description: Error code for no outstanding credit sales
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
 *                   description: Error code for server errors
 */

import { Sale } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  try {
    // Find all sales where isCredit is true and paymentStatus is either 'pending' or 'partially_paid'
    const outstandingCredits = await Sale.find({
      isCredit: true,
      "creditDetails.paymentStatus": { $in: ["pending", "partially_paid"] },
    });

    if (outstandingCredits.length === 0) {
      return res.status(404).json({
        resultMessage: "No outstanding credit sales found.",
        resultCode: "00091",
      });
    }

    return res.status(200).json({
      resultMessage: "Outstanding credit sales fetched successfully.",
      resultCode: "00089",
      outstandingCredits,
    });
  } catch (err) {
    console.error("Error fetching outstanding credit sales:", err);
    return res.status(500).json({
      resultMessage:
        "An error occurred while fetching outstanding credit sales.",
      resultCode: "00090",
      error: err.message,
    }); // Error handling
  }
};
