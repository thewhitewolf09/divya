/**
 * @swagger
 * /api/orders/:
 *   post:
 *     summary: Create a new order
 *     description: This endpoint is used to create a new order for the customer. It will check the customer's cart, validate the required fields, and create an order.
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: The ID of the customer placing the order.
 *                 example: "60c72b2f9f1b2c001f7b3c6a"
 *               paymentMethod:
 *                 type: string
 *                 description: The payment method for the order (e.g., 'Credit Card', 'UPI').
 *                 example: "Credit Card"
 *               deliveryAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     description: The street address for delivery.
 *                     example: "123 Main St"
 *                   city:
 *                     type: string
 *                     description: The city for delivery.
 *                     example: "New York"
 *                   state:
 *                     type: string
 *                     description: The state for delivery.
 *                     example: "NY"
 *                   postalCode:
 *                     type: string
 *                     description: The postal code for delivery.
 *                     example: "10001"
 *                   country:
 *                     type: string
 *                     description: The country for delivery. Default is India.
 *                     example: "India"
 *               totalAmount:
 *                 type: number
 *                 description: The total amount for the order.
 *                 example: 1000.50
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message.
 *                   example: "Order created successfully."
 *                 resultCode:
 *                   type: string
 *                   description: Success result code.
 *                   example: "00089"
 *                 order:
 *                   type: object
 *                   description: The created order object.
 *       400:
 *         description: Bad request (Missing required fields or cart items)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message.
 *                   example: "Missing required fields."
 *                 resultCode:
 *                   type: string
 *                   description: Error result code.
 *                   example: "00025"
 *       404:
 *         description: Cart not found or empty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message.
 *                   example: "No items found in the cart."
 *                 resultCode:
 *                   type: string
 *                   description: Error result code.
 *                   example: "00028"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message.
 *                   example: "Internal server error"
 *                 resultCode:
 *                   type: string
 *                   description: Error result code.
 *                   example: "00090"
 */



import { Order, Cart, Product, Customer } from "../../models/index.js"; // Import models
import { errorHelper, getText } from "../../utils/index.js";


export default async (req, res) => {
  const { customerId, paymentMethod, deliveryAddress, totalAmount } = req.body;

  // Validate required fields
  if (!customerId || !paymentMethod || !deliveryAddress) {
    return res.status(400).json({
      resultMessage: getText("00025"),
      resultCode: "00025",
    });
  }

  try {
    // Find the customer's cart
    const cart = await Cart.findOne({ customerId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({
        resultMessage: getText("00028"),
        resultCode: "00028",
      });
    }

    // Create the order, including the variantId if present
    const newOrder = new Order({
      customerId,
      products: cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.price,
        variantId: item.variantId || null, // Include variantId if it exists
      })),
      totalAmount,
      deliveryAddress: {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        postalCode: deliveryAddress.postalCode,
        country: deliveryAddress.country || "India",
      },
      payment: {
        method: paymentMethod,
        status: "Failed",
        transactionId: `TXN${Date.now()}`,
      },
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

  
    // Return success response
    return res.status(201).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      order: savedOrder,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
