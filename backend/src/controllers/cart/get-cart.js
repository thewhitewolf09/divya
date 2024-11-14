/**
 * @swagger
 * /api/carts/get-cart/{customerId}:
 *   get:
 *     summary: Retrieve a customer's cart
 *     description: Fetches the cart details for a specified customer, including the list of items in the cart.
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the customer whose cart is being retrieved.
 *         example: "64f9cabc12e8b4c4b8a1d7e4"
 *     responses:
 *       200:
 *         description: Cart successfully retrieved
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
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { customerId } = req.params; 

  // Validate required fields
  if (!customerId) {
    return res.status(400).json({
      resultMessage: getText("00025"), 
      resultCode: "00025",
    });
  }

  try {
    // Find the cart for the specified customer
    const cart = await Cart.findOne({ customerId }).populate('items.productId'); 

    if (!cart) {
      return res.status(404).json({
        resultMessage: getText("00027"), // Message indicating that the cart does not exist
        resultCode: "00027",
      });
    }

    return res.status(200).json({
      resultMessage: getText("00088"), // Message for successful retrieval
      resultCode: "00088",
      cart, // Include the cart details in the response
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message)); // Handle unexpected errors
  }
};
