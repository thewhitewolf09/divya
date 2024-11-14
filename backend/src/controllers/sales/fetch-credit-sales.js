/**
 * @swagger
 * /api/sales/credit:
 *   get:
 *     summary: Retrieve all credit sales
 *     description: Fetch sales that have been made on credit, including product and customer details.
 *     tags:
 *       - Sales
 *     responses:
 *       200:
 *         description: Credit sales data fetched successfully
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
 *                       saleId:
 *                         type: string
 *                         description: The ID of the sale
 *                       productId:
 *                         type: string
 *                         description: The ID of the product sold
 *                       productName:
 *                         type: string
 *                         description: The name of the product
 *                       customerId:
 *                         type: string
 *                         description: The ID of the customer
 *                       customerName:
 *                         type: string
 *                         description: The name of the customer
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the product sold
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: The price of a single unit of the product
 *                       totalAmount:
 *                         type: number
 *                         format: float
 *                         description: The total amount for the sale (quantity * price)
 *                       creditDetails:
 *                         type: object
 *                         properties:
 *                           amountOwed:
 *                             type: number
 *                             format: float
 *                             description: The amount owed by the customer
 *                           paymentStatus:
 *                             type: string
 *                             description: The payment status (e.g., "Pending", "Paid")
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         description: The date of the sale
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
import { errorHelper, getText } from '../../utils/index.js';

export default async (req, res) => {
  try {
    const creditSales = await Sale.find({ isCredit: true })
      .populate('productId') 
      .populate('customerId') 
      .exec();

    const formattedSales = creditSales.map((sale) => ({
      saleId: sale._id,
      productId: sale.productId?._id,
      productName: sale.productId?.name,
      customerId: sale.customerId?._id,
      customerName: sale.customerId?.name,
      quantity: sale.quantity,
      price: sale.price,
      totalAmount: sale.quantity * sale.price,
      creditDetails: sale.creditDetails,
      date: sale.date,
    }));

    return res.status(200).json({
      resultMessage: getText("00089"), // Success message
      resultCode: "00089",
      sales: formattedSales,
    });
  } catch (err) {
    console.error('Error fetching credit sales:', err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Error handling
  }
};


