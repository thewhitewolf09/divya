/**
 * @swagger
 * /api/carts/create:
 *   post:
 *     summary: Create a new cart for a customer
 *     description: Creates a new cart for the specified customer if one does not already exist.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: The ID of the customer for whom the cart is being created.
 *                 example: "64f9cabc12e8b4c4b8a1d7e4"
 *     responses:
 *       201:
 *         description: Cart successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message.
 *                 resultCode:
 *                   type: string
 *                   description: Success code.
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Cart already exists for the customer or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message.
 *                 resultCode:
 *                   type: string
 *                   description: Error code.
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
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
 *                 resultCode:
 *                   type: string
 *                   description: Error code.
 */



import { Cart } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { customerId } = req.body;

  // Validate required fields
  if (!customerId) {
    console.log(req.body);
    return res.status(400).json({
      resultMessage: getText("00025"), // Replace with an appropriate message for missing customerId
      resultCode: "00025",
    });
  }

  try {
    // Check if the cart already exists for the customer
    let existingCart = await Cart.findOne({ customerId });
    if (existingCart) {
      return res.status(400).json({
        resultMessage: getText("00026"), // Message indicating the cart already exists
        resultCode: "00026",
        cart: existingCart,
      });
    }

    // Create a new cart
    const newCart = new Cart({
      customerId,
      items: [], // Initialize with an empty array of items
      totalAmount: 0, // Initialize total amount
    });

    const savedCart = await newCart.save();

    return res.status(201).json({
      resultMessage: getText("00089"), // Message for successful creation
      resultCode: "00089",
      cart: savedCart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Handle unexpected errors
  }
};
