/**
 * @swagger
 * /api/carts/clear-cart/{customerId}:
 *   put:
 *     summary: Clear a customer's cart
 *     description: Removes all items from the specified customer's cart and resets the total amount to zero.
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the customer whose cart is being cleared.
 *         example: "64f9cabc12e8b4c4b8a1d7e4"
 *     responses:
 *       200:
 *         description: Cart successfully cleared
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
 *         description: Missing required customerId parameter.
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
 *         description: Cart not found for the specified customer.
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

import { Cart } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { customerId } = req.params; // Assuming customerId is passed as a URL parameter

  // Validate required field
  if (!customerId) {
    return res.status(400).json({
      resultMessage: "Customer ID is required in the request.",
      resultCode: "00025",
    });
  }

  try {
    // Find the cart for the specified customer
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({
        resultMessage: "Cart not found for the given customer.",
        resultCode: "00028",
      });
    }

    // Clear the items in the cart
    cart.items = [];
    cart.totalAmount = 0; // Reset total amount

    // Save the updated cart
    const updatedCart = await cart.save();

    return res.status(200).json({
      resultMessage: "Cart cleared successfully.",
      resultCode: "00089",
      cart: updatedCart, // Include the updated cart details in the response
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      resultMessage: "An error occurred while clearing the cart.",
      resultCode: "00090",
      error: err.message,
    }); // Handle unexpected errors
  }
};
