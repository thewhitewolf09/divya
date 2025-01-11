/**
 * @swagger
 * /api/sales/customer/{customerId}:
 *   get:
 *     summary: Retrieve all sales for a specific customer
 *     description: Fetch sales made by a specific customer, including product details and associated sales information.
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: The ID of the customer for whom to retrieve sales
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sales data for the specified customer fetched successfully
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
 *                         description: The name of the product sold
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
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         description: The date of the sale
 *       400:
 *         description: Invalid customer ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message indicating an invalid customer ID
 *                 resultCode:
 *                   type: string
 *                   description: Error code for invalid ID
 *       404:
 *         description: No sales found for the specified customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message indicating no sales found for the customer
 *                 resultCode:
 *                   type: string
 *                   description: Error code for no sales found
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
  const { customerId } = req.params;

  if (!customerId) {
    return res.status(400).json({
      resultMessage: "Invalid customer ID.",
      resultCode: "00025",
    });
  }

  try {
    const customerSales = await Sale.find({ customerId })
      .populate({
        path: "productId",
        populate: { path: "addedBy" }, 
      })
      .populate("customerId")
      .exec();

    if (customerSales.length === 0) {
      return res.status(404).json({
        resultMessage: "No sales found for this customer.",
        resultCode: "00091",
      });
    }

    // Return the raw customer sales data without formatting
    return res.status(200).json({
      resultMessage: "Sales fetched successfully.",
      resultCode: "00089",
      sales: customerSales,
    });
  } catch (err) {
    console.error("Error fetching customer sales:", err);
    return res.status(500).json({
      resultMessage: "An error occurred while fetching customer sales.",
      resultCode: "00090",
      error: err.message,
    }); // Error handling
  }
};
