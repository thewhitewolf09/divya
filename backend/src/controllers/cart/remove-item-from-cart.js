/**
 * @swagger
 * /api/carts/remove-item/{customerId}/{productId}:
 *   put:
 *     summary: Remove an item from a customer's cart
 *     description: Removes a specified product (and variant, if applicable) from the customer's cart and updates the total amount.
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the customer whose cart is being updated.
 *         example: "64f9cabc12e8b4c4b8a1d7e4"
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to be removed from the cart.
 *         example: "65123abc45de67f89012a3bc"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variantId:
 *                 type: string
 *                 description: The ID of the product variant, if applicable.
 *                 example: "a2b34cde56fg78hi9012jklm"
 *     responses:
 *       200:
 *         description: Item successfully removed from the cart
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
 *         description: Cart or item not found.
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
  const { customerId, productId } = req.params;
  const { variantId } = req.body;

  // Validate required fields
  if (!customerId || !productId) {
    return res.status(400).json({
      resultMessage: "Customer ID and Product ID are required in the request.",
      resultCode: "00025",
    });
  }

  try {
    // Find the cart for the specified customer
    const cart = await Cart.findOne({ customerId }).populate("items.productId");

    if (!cart) {
      return res.status(404).json({
        resultMessage: "Cart not found for the specified customer.",
        resultCode: "00028",
      });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex((item) => {
      const isProductMatch = item.productId._id.toString() === productId;
      const isVariantMatch = variantId
        ? item.variantId.toString() === variantId
        : !item.variantId;
      return isProductMatch && isVariantMatch;
    });

    if (itemIndex === -1) {
      return res.status(404).json({
        resultMessage: "Item not found in the cart.",
        resultCode: "00029",
      });
    }

    // Remove the item from the cart
    const removedItem = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1); // Remove the item from the array

    // Update the total amount
    cart.totalAmount -= removedItem.price * removedItem.quantity;

    // Save the updated cart
    const updatedCart = await cart.save();

    return res.status(200).json({
      resultMessage: "Item successfully removed from the cart.",
      resultCode: "00089",
      cart: updatedCart, // Return the updated cart
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      resultMessage: "An error occurred while removing the item from the cart.",
      resultCode: "00090",
      error: err.message,
    }); // Handle unexpected errors
  }
};
