/**
 * @swagger
 * /api/sales/add:
 *   post:
 *     summary: Add new sales
 *     description: Add new sales data for one or more products. The sales data should include product details, quantity, price, and optional customer information (if applicable). If credit sales, credit details are also required.
 *     tags:
 *       - Sales
 *     requestBody:
 *       description: Array of sales objects to be added.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 productId:
 *                   type: string
 *                   description: ID of the product being sold
 *                 quantity:
 *                   type: integer
 *                   description: Quantity of the product being sold
 *                 price:
 *                   type: number
 *                   format: float
 *                   description: Price of the product per unit
 *                 customerId:
 *                   type: string
 *                   description: (Optional) Customer ID if the sale is associated with a customer
 *                 isCredit:
 *                   type: boolean
 *                   description: Whether the sale is a credit sale
 *                 creditDetails:
 *                   type: object
 *                   properties:
 *                     amountOwed:
 *                       type: number
 *                       format: float
 *                       description: The amount owed in case of a credit sale
 *                     paymentStatus:
 *                       type: string
 *                       description: The status of the credit payment, e.g., "pending"
 *     responses:
 *       201:
 *         description: Sale added successfully
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
 *                   description: Array of created sales records
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Sale ID
 *                       productId:
 *                         type: string
 *                         description: Product ID
 *                       quantity:
 *                         type: integer
 *                         description: Quantity sold
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: Sale price
 *                       customerId:
 *                         type: string
 *                         description: (Optional) Customer ID
 *                       isCredit:
 *                         type: boolean
 *                         description: Indicates if it's a credit sale
 *                       creditDetails:
 *                         type: object
 *                         properties:
 *                           amountOwed:
 *                             type: number
 *                             format: float
 *                             description: Amount owed in case of credit sale
 *                           paymentStatus:
 *                             type: string
 *                             description: Status of the credit payment
 *       400:
 *         description: Bad request. Missing required fields or invalid data.
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
 *         description: Product not found
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



import { Product, Sale, Customer } from "../../models/index.js"; // Make sure to import Customer model
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const salesData = req.body; // Expecting an array of sale objects

  // Validate that the request body is an array
  if (!Array.isArray(salesData) || salesData.length === 0) {
    return res.status(400).json({
      resultMessage: getText("00025"), // Missing required fields
      resultCode: "00025",
    });
  }

  const createdSales = []; // Array to hold successfully created sales

  try {
    // Loop through each sale in the sales data array
    for (const sale of salesData) {
      const {
        productId,
        quantity,
        price,
        customerId,
        isCredit,
        creditDetails,
      } = sale;

      // Validate required fields for each sale
      if (!productId || !quantity || !price) {
        return res.status(400).json({
          resultMessage: getText("00025"), // Missing required fields
          resultCode: "00025",
        });
      }

      // Check if the product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          resultMessage: getText("00093"), // Product not found
          resultCode: "00093",
        });
      }

      // Create new sale object
      const newSale = new Sale({
        productId,
        quantity,
        price: price.toFixed(2),
        customerId: customerId || null, // Optional customer ID
        isCredit: isCredit || false,
        creditDetails: isCredit
          ? {
              amountOwed: creditDetails?.amountOwed,
              paymentStatus: creditDetails?.paymentStatus || "pending",
            }
          : null,
      });

      // Save the sale
      const savedSale = await newSale.save();
      createdSales.push(savedSale); // Add to created sales

      // Update customer totalPurchases and creditBalance
      if (customerId) {
        const totalPrice = parseFloat((price * quantity).toFixed(2));

        // Find the customer
        const customer = await Customer.findById(customerId);
        if (customer) {
          // Update totalPurchases
          customer.totalPurchases += totalPrice;

          // Update creditBalance if the payment method is credit
          if (isCredit) {
            customer.creditBalance += totalPrice; // Increase credit balance
          }

          // Save the updated customer document
          await customer.save();
        }
      }
    }

    return res.status(201).json({
      resultMessage: getText("00089"), // Sale added successfully
      resultCode: "00089",
      sales: createdSales, // Return all created sales
    });
  } catch (err) {
    console.error("Error adding new sales:", err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Error handling
  }
};
