/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update an existing product by its ID
 *     description: Allows an authenticated user to update specific fields of a product. Only the user who added the product can update it.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the product to update
 *       - in: body
 *         name: updates
 *         required: true
 *         description: The fields to update in the product
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             category:
 *               type: string
 *             price:
 *               type: number
 *             stockQuantity:
 *               type: number
 *             unit:
 *               type: string
 *             description:
 *               type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Product updated successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 product:
 *                   $ref: '#/components/schemas/Product'
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
 *         description: Forbidden, user does not have permission to update this product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "You do not have permission to update this product."
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
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user._id;

  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"),
      resultCode: "00022",
    });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        resultMessage: getText("00052"),
        resultCode: "00052",
      });
    }

    if (product.addedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        resultMessage: getText("00017"),
        resultCode: "00017",
      });
    }

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        product[key] = updates[key];
      }
    });

    const updatedProduct = await product.save();

    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      product: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00008", req, err.message));
  }
};
