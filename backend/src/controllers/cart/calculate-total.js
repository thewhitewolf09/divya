/**
 * @swagger
 * /api/carts/calculate-total/{customerId}:
 *   put:
 *     summary: Calculate the total amount for a customer's cart
 *     description: Calculates the total price of items in the cart, taking into account any available discounts, and updates the cart's totalAmount field.
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the customer whose cart total is being calculated.
 *         example: "64f9cabc12e8b4c4b8a1d7e4"
 *     responses:
 *       200:
 *         description: Total amount successfully calculated and updated
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
 *                 totalAmount:
 *                   type: number
 *                   description: The calculated total amount for the cart after applying any discounts.
 *                   example: 1200.00
 *       400:
 *         description: Missing required fields.
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
 *       404:
 *         description: Cart not found.
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
 *       500:
 *         description: Internal server error.
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




import { Cart, Product } from "../../models/index.js"; // Ensure Product is imported to access discount info
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { customerId } = req.params; // Assuming customerId is passed as a URL parameter

  // Validate required field
  if (!customerId) {
    return res.status(400).json({
      resultMessage: getText("00025"), // Message for missing customerId
      resultCode: "00025",
    });
  }

  try {
    // Find the cart for the specified customer
    const cart = await Cart.findOne({ customerId }).populate('items.productId'); // Populate productId to access product details
    if (!cart) {
      return res.status(404).json({
        resultMessage: getText("00028"), // Message indicating the cart does not exist
        resultCode: "00028",
      });
    }

    // Calculate the total amount
    let totalAmount = cart.items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity; // Calculate total for the item
      return total + itemTotal; // Sum up item totals
    }, 0);

    // Check for discounts
    const discount = cart.items.reduce(async (accumulator, item) => {
      const product = await Product.findById(item.productId); // Get product details to check for discount
      const itemDiscount = product.discount || 0; // Get discount, default to 0 if not available
      return accumulator + (item.price * item.quantity * (itemDiscount / 100)); // Calculate total discount for this item
    }, 0);

    // Await discount calculation before proceeding
    totalAmount -= await discount;

    // Update the total amount in the cart
    cart.totalAmount = Math.max(totalAmount, 0); // Ensure totalAmount is not negative

    // Save the updated cart
    await cart.save();

    return res.status(200).json({
      resultMessage: getText("00089"), // Message for successful calculation
      resultCode: "00089",
      totalAmount: cart.totalAmount, // Return the calculated total amount
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Handle unexpected errors
  }
};
