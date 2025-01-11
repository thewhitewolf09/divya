/**
 * @swagger
 * /api/products/{id}/variants/{variantId}:
 *   delete:
 *     summary: Delete a product variant
 *     description: Delete a specific variant of a product by its variant ID.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product containing the variant to delete
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the variant to delete
 *     responses:
 *       200:
 *         description: Product variant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Variant deleted successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00092"
 *                 product:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           variantName:
 *                             type: string
 *                           variantPrice:
 *                             type: number
 *                           variantStockQuantity:
 *                             type: number
 *       400:
 *         description: Invalid request parameters (e.g., missing required details for deletion)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "No id provided in params. Please enter an id."
 *                 resultCode:
 *                   type: string
 *                   example: "00022"
 *       404:
 *         description: Product or variant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Product or variant not found."
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
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id, variantId } = req.params;

  if (!id || !variantId) {
    return res.status(400).json({
      resultMessage:
        "Product ID and Variant ID are required in the request parameters.",
      resultCode: "40001", // Custom code for missing parameters
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

    // Find the variant within the product's variants array
    const variantIndex = product.variants.findIndex(
      (variant) => variant._id.toString() === variantId
    );

    if (variantIndex === -1) {
      return res.status(404).json({
        resultMessage: "Variant not found. Please provide a valid Variant ID.",
        resultCode: "40402", // Custom code for variant not found
      });
    }

    // Remove the variant from the variants array
    product.variants.splice(variantIndex, 1);

    const updatedProduct = await product.save();

    return res.status(200).json({
      resultMessage: "Variant deleted successfully.",
      resultCode: "20001", // Custom code for successful operation
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Error while deleting variant:", err);
    return res.status(500).json({
      resultMessage:
        "An internal server error occurred while attempting to delete the variant.",
      resultCode: "50001", // Custom code for server error
      error: err.message,
    });
  }
};
