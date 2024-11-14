/**
 * @swagger
 * /api/products/{id}/stock:
 *   patch:
 *     summary: Manage product stock by adding or subtracting quantity
 *     description: Adjust the stock of a specific product based on the provided action (add or subtract) and quantity.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to manage stock for
 *       - in: body
 *         name: stock
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             quantity:
 *               type: number
 *               description: The quantity to add or subtract from the stock
 *             action:
 *               type: string
 *               enum: [add, subtract]
 *               description: The action to perform on stock (either add or subtract)
 *     responses:
 *       200:
 *         description: Product stock updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Product stock updated successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 product:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     stock:
 *                       type: number
 *                     category:
 *                       type: string
 *                     price:
 *                       type: number
 *       400:
 *         description: Invalid request parameters (e.g., missing ID, quantity, or invalid action)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Quantity and action are required."
 *                 resultCode:
 *                   type: string
 *                   example: "00023"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Product not found."
 *                 resultCode:
 *                   type: string
 *                   example: "00052"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "An error occurred."
 *                 resultCode:
 *                   type: string
 *                   example: "00090"
 */



import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const { quantity, action } = req.body;

  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No id provided in params. Please enter an id."
      resultCode: "00022",
    });
  }

  if (quantity === undefined || !action) {
    return res.status(400).json({
      resultMessage: getText("00023"), // "Quantity and action are required."
      resultCode: "00023",
    });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        resultMessage: getText("00052"), // "Product not found."
        resultCode: "00052",
      });
    }

    // Perform stock adjustment based on action
    switch (action.toLowerCase()) {
      case "add":
        product.stock += Number(quantity);
        break;
      case "subtract":
        product.stock -= Number(quantity);
        if (product.stock < 0) {
          return res.status(400).json({
            resultMessage: getText("00026"), // "Insufficient stock."
            resultCode: "00026",
          });
        }
        break;
      default:
        return res.status(400).json({
          resultMessage: getText("00024"), // "Invalid action. Use 'add' or 'subtract'."
          resultCode: "00024",
        });
    }

    const updatedProduct = await product.save();

    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      product: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
