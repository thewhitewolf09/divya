/**
 * @swagger
 * /api/products/{id}/image:
 *   post:
 *     summary: Upload product image
 *     description: Upload an image for a product by providing the product ID. The image URL will be saved to the product's record.
 *     tags:
 *       - Product
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The product ID to update with the image.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to be uploaded.
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Image uploaded successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 product:
 *                   $ref: "#/components/schemas/Product"
 *       400:
 *         description: Invalid product ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Invalid product ID."
 *                 resultCode:
 *                   type: string
 *                   example: "00022"
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
 *                   example: "Failed to update product."
 *                 resultCode:
 *                   type: string
 *                   example: "00090"
 */

import { Product } from "../../models/index.js";

export default async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      resultMessage: "Invalid product ID.",
      resultCode: "40001", // Custom error code
    });
  }

  // Find the product by ID
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      resultMessage: "Product not found.",
      resultCode: "40401", // Custom error code
    });
  }

  try {
    // Update product with uploaded image URL
    product.productImage = req.imageUrl;
    await product.save();

    return res.status(200).json({
      resultMessage: "Image uploaded successfully.",
      resultCode: "20001", // Custom success code
      product,
    });
  } catch (err) {
    return res.status(500).json({
      resultMessage: "Failed to update product.",
      resultCode: "50001", // Custom error code
      error: err.message,
    });
  }
};
