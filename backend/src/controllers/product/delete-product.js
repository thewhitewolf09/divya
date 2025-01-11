/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product by its ID
 *     description: Allows an authenticated user to delete a product. Only the user who added the product can delete it.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the product to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Product deleted successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00092"
 *       400:
 *         description: Bad request, product ID not provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Product ID is required."
 *                 resultCode:
 *                   type: string
 *                   example: "00022"
 *       403:
 *         description: Forbidden, user does not have permission to delete this product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "You do not have permission to delete this product."
 *                 resultCode:
 *                   type: string
 *                   example: "00017"
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
 *                   example: "00008"
 */

import { Product } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!id) {
    return res.status(400).json({
      resultMessage: "Product ID is required in the request parameters.",
      resultCode: "40001", // Custom code for missing Product ID
    });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        resultMessage: "Product not found. Please provide a valid Product ID.",
        resultCode: "40401", // Custom code for product not found
      });
    }

    if (product.addedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        resultMessage: "You do not have permission to delete this product.",
        resultCode: "40301", // Custom code for forbidden access
      });
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      resultMessage: "Product deleted successfully.",
      resultCode: "20001", // Custom code for successful deletion
    });
  } catch (err) {
    console.error("Error while deleting product:", err);
    return res.status(500).json({
      resultMessage:
        "An internal server error occurred while attempting to delete the product.",
      resultCode: "50001", // Custom code for server error
      error: err.message,
    });
  }
};
