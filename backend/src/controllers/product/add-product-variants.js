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
import { errorHelper, getText } from "../../utils/index.js";

export default  async (req, res) => {
  const { id } = req.params;
  const { variantName, variantPrice, variantStockQuantity } = req.body;

  console.log(req.body)

  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No id provided in params. Please enter an id."
      resultCode: "00022",
    });
  }

  if (!variantName || variantPrice === undefined || variantStockQuantity === undefined) {
    return res.status(400).json({
      resultMessage: getText("00023"), // "Variant details are required."
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

    // Add new variant to the product's variants array
    product.variants.push({
      variantName,
      variantPrice,
      variantStockQuantity
    });

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


