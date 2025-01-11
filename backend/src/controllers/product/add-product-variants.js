/**
 * @swagger
 * /api/products/{id}/variants:
 *   post:
 *     summary: Add a variant to a product
 *     description: Add a new variant (such as size or color) to an existing product by providing variant details such as name, price, and stock quantity.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to which the variant should be added
 *       - in: body
 *         name: variant
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             variantName:
 *               type: string
 *               description: The name of the variant (e.g., size, color)
 *             variantPrice:
 *               type: number
 *               description: The price of the variant
 *             variantStockQuantity:
 *               type: number
 *               description: The stock quantity available for the variant
 *     responses:
 *       200:
 *         description: Product variant added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Product variant added successfully."
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
 *         description: Invalid request parameters (e.g., missing variant details)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Variant details are required."
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
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const { variantName, variantPrice, variantStockQuantity } = req.body;

  console.log(req.body);

  // Validate product ID in params
  if (!id) {
    return res.status(400).json({
      resultMessage:
        "No product ID provided in the request parameters. Please provide a valid ID.",
      resultCode: "40001", // Custom code for missing ID
    });
  }

  // Validate variant details in the request body
  if (
    !variantName ||
    variantPrice === undefined ||
    variantStockQuantity === undefined
  ) {
    return res.status(400).json({
      resultMessage:
        "All variant details (name, price, and stock quantity) are required.",
      resultCode: "40002", // Custom code for missing variant details
    });
  }

  try {
    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        resultMessage: "Product not found. Please check the provided ID.",
        resultCode: "40401", // Custom code for product not found
      });
    }

    // Add new variant to the product's variants array
    product.variants.push({
      variantName,
      variantPrice,
      variantStockQuantity,
    });

    // Save the updated product
    const updatedProduct = await product.save();

    return res.status(200).json({
      resultMessage: "Variant added successfully to the product.",
      resultCode: "20001", // Custom code for successful addition
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Error adding variant to product:", err);
    return res.status(500).json({
      resultMessage:
        "An error occurred while adding the variant to the product.",
      resultCode: "50001", // Custom code for server error
      error: err.message,
    });
  }
};
