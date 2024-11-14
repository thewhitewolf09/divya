/**
 * @swagger
 * /api/carts/update-item/{customerId}/{productId}:
 *   put:
 *     summary: Update the quantity of an item in a customer's cart
 *     description: Updates the quantity of a specified item in the customer's cart and recalculates the total amount.
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
 *         description: The ID of the product whose quantity is being updated.
 *         example: "65123abc45de67f89012a3bc"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: The new quantity for the item.
 *                 example: 3
 *     responses:
 *       200:
 *         description: Item quantity successfully updated
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
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { customerId, productId } = req.params; // Assuming customerId and productId are passed as URL parameters
  const { quantity } = req.body; // Expecting quantity in the request body


  // Validate required fields
  if (!customerId || !productId || quantity === undefined) {
    return res.status(400).json({
      resultMessage: getText("00025"), // Message for missing fields
      resultCode: "00025",
    });
  }

  // Check if the quantity is valid
  if (quantity < 1) {
    return res.status(400).json({
      resultMessage: getText("00026"), // Message for invalid quantity
      resultCode: "00026",
    });
  }

  try {
    // Find the cart for the specified customer
    const cart = await Cart.findOne({ customerId }).populate('items.productId'); 
    
    if (!cart) {
      return res.status(404).json({
        resultMessage: getText("00028"), // Message indicating the cart does not exist
        resultCode: "00028",
      });
    }


    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === productId);


    if (itemIndex === -1) {
      return res.status(404).json({
        resultMessage: getText("00029"), // Message indicating the item does not exist in the cart
        resultCode: "00029",
      });
    }

    // Update the item's quantity
    const existingItem = cart.items[itemIndex];
    const previousQuantity = existingItem.quantity; 
    existingItem.quantity = quantity;
    
    // Update total amount based on the change in quantity
    const priceDifference = existingItem.price * (quantity - previousQuantity);
    cart.totalAmount += priceDifference;

    // Save the updated cart
    const updatedCart = await cart.save();




    return res.status(200).json({
      resultMessage: getText("00089"), // Message for successful update
      resultCode: "00089",
      cart,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Handle unexpected errors
  }
};
