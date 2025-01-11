/**
 * @swagger
 * /api/sales/all:
 *   get:
 *     summary: Retrieve all sales
 *     description: Fetch all sales records, including related product and customer details.
 *     tags:
 *       - Sales
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
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
 *                 sales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the sale
 *                       productId:
 *                         type: object
 *                         description: Product details related to the sale
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                             format: float
 *                       customerId:
 *                         type: object
 *                         description: Customer details related to the sale
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *       404:
 *         description: No sales found
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


import { Sale } from '../../models/index.js';
import { errorHelper } from '../../utils/index.js';

export default async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('productId')
      .populate("customerId")
      .exec();

    if (sales.length === 0) {
      return res.status(404).json({
        resultMessage: "No sales found. Please check again.",
        resultCode: "00091",
      });
    }

    return res.status(200).json({
      resultMessage: "Sales fetched successfully.",
      resultCode: "00089",
      sales: sales,
    });
  } catch (err) {
    console.error('Error fetching sales:', err);
    return res.status(500).json({
      resultMessage: "An error occurred while fetching the sales.",
      resultCode: "00090",
      error: err.message,
    }); // Error handling
  }
};

