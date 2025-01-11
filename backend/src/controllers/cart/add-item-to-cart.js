/**
 * @swagger
 * /api/carts/add-item/{customerId}:
 *   post:
 *     summary: Add an item to a customer's cart
 *     description: Adds a specified product (and variant, if applicable) to the customer's cart and updates the total amount.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The ID of the product to add to the cart.
 *                 example: "65123abc45de67f89012a3bc"
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the product to add.
 *                 example: 2
 *               variantId:
 *                 type: string
 *                 description: The ID of the product variant, if applicable.
 *                 example: "a2b34cde56fg78hi9012jklm"
 *     responses:
 *       200:
 *         description: Item successfully added to the cart
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
 *         description: Missing required fields or invalid quantity.
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
 *         description: Product or variant not found.
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

import { Cart, Product } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { customerId } = req.params;
  const { productId, quantity, variantId } = req.body; // Now accepting variantId from the request body

  // Validate required fields
  if (!customerId || !productId || !quantity) {
    return res.status(400).json({
      resultMessage:
        "Missing required fields (customerId, productId, quantity).",
      resultCode: "00025",
    });
  }

  // Check if the quantity is valid
  if (quantity < 1) {
    return res.status(400).json({
      resultMessage: "Invalid quantity. Quantity must be greater than 0.",
      resultCode: "00026",
    });
  }

  try {
    // Check if the product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        resultMessage: "Product not found.",
        resultCode: "00027",
      });
    }

    // Determine if the product has variants
    let price = product.price; // Default price
    let stockQuantity = product.stockQuantity; // Default stock
    let discount = product.discount || 0; // Default to 0 if no discount
    let finalPrice = price; // This will be the final price after discount

    if (product.variants && product.variants.length > 0) {
      // If variantId is provided, find the variant
      if (!variantId) {
        return res.status(400).json({
          resultMessage: "VariantId is required for products with variants.",
          resultCode: "00028",
        });
      }

      const variant = product.variants.find(
        (variant) => variant._id.toString() === variantId
      );

      if (!variant) {
        return res.status(404).json({
          resultMessage: "Variant not found.",
          resultCode: "00029",
        });
      }

      // Update the price and stock based on the selected variant
      price = variant.variantPrice;
      stockQuantity = variant.variantStockQuantity;
    }

    // Calculate the final price after applying discount
    if (discount > 0) {
      finalPrice = price - price * (discount / 100);
    }

    // Find the cart for the specified customer
    let cart = await Cart.findOne({ customerId }).populate("items.productId");

    // If cart doesn't exist, create a new one
    if (!cart) {
      cart = new Cart({
        customerId,
        items: [
          {
            productId,
            variantId,
            quantity,
            price: finalPrice, // Use the discounted or regular price
          },
        ],
        totalAmount: finalPrice * quantity, // Set total amount for the new cart
      });
    } else {
      // Check if the item with the same variant is already in the cart
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.productId._id.toString() === productId &&
          (!item.variantId || item.variantId.toString() === variantId)
      );

      if (existingItemIndex > -1) {
        // If item exists, update the quantity
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].price = finalPrice; // Update price based on variant and discount
      } else {
        // If item does not exist, add it to the cart
        cart.items.push({
          productId,
          variantId, // Add variantId to the cart item if applicable
          quantity,
          price: finalPrice, // Use the discounted or regular price
        });
      }

      // Update total amount in the cart
      cart.totalAmount += finalPrice * quantity;
    }

    // Save the cart
    const savedCart = await cart.save();

    // Populate the cart again to include variant and product details
    const populatedCart = await Cart.findById(savedCart._id).populate(
      "items.productId"
    );

    return res.status(200).json({
      resultMessage: "Product successfully added to the cart.",
      resultCode: "00089",
      cart: populatedCart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      resultMessage: "Internal server error while adding product to cart.",
      resultCode: "00090",
      error: err.message,
    });
  }
};
