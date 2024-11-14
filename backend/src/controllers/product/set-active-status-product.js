/**
 * @swagger
 * /api/products/{id}/activate:
 *   patch:
 *     summary: Toggle product activation status
 *     description: Toggles the activation status of a product, making it active or inactive.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to update.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Product status updated successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 product:
 *                   $ref: "#/components/schemas/Product"
 *       400:
 *         description: No product ID provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "No product ID provided."
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
 *                   example: "Failed to update product status."
 *                 resultCode:
 *                   type: string
 *                   example: "00090"
 */




import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;


  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No product ID provided."
      resultCode: "00022",
    });
  }

  try {
    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        resultMessage: getText("00052"), // "Product not found."
        resultCode: "00052",
      });
    }

    product.isActive = !product.isActive;

    const updatedProduct = await product.save();

    return res.status(200).json({
      resultMessage: getText("00089"), // "Product status updated successfully."
      resultCode: "00089",
      product: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
