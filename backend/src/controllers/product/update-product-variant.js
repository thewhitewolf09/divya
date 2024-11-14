/**
 * @swagger
 * /api/products/{id}/variants/{variantId}:
 *   put:
 *     summary: Update a product variant
 *     description: Update the details of a specific variant of a product by providing new values for variant name, price, and stock quantity.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product containing the variant to update
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the variant to update
 *       - in: body
 *         name: variant
 *         required: false
 *         schema:
 *           type: object
 *           properties:
 *             variantName:
 *               type: string
 *               description: The name of the variant (e.g., size, color)
 *             variantPrice:
 *               type: number
 *               description: The new price of the variant
 *             variantStockQuantity:
 *               type: number
 *               description: The new stock quantity for the variant
 *     responses:
 *       200:
 *         description: Product variant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Product variant updated successfully."
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
 *         description: Invalid request parameters (e.g., missing required details for update)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "At least one variant detail is required to update."
 *                 resultCode:
 *                   type: string
 *                   example: "00023"
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
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id, variantId } = req.params;
  const { variantName, variantPrice, variantStockQuantity } = req.body;

  if (!id || !variantId) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No id provided in params. Please enter an id."
      resultCode: "00022",
    });
  }

  if (
    variantName === undefined &&
    variantPrice === undefined &&
    variantStockQuantity === undefined
  ) {
    return res.status(400).json({
      resultMessage: getText("00023"), // "At least one variant detail is required to update."
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

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        resultMessage: getText("00053"), // "Variant not found."
        resultCode: "00053",
      });
    }

    // Update the variant details
    if (variantName !== undefined) {
      variant.variantName = variantName;
    }
    if (variantPrice !== undefined) {
      variant.variantPrice = variantPrice;
    }
    if (variantStockQuantity !== undefined) {
      variant.variantStockQuantity = variantStockQuantity;
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
