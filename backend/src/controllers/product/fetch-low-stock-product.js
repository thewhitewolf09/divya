/**
 * @swagger
 * /api/products/low-stock:
 *   get:
 *     summary: Get low stock products
 *     description: Retrieves products that have stock quantities below the predefined low stock threshold (10).
 *     tags:
 *       - Product
 *     responses:
 *       200:
 *         description: List of low stock products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Success"
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Product"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Failed to retrieve low stock products."
 *                 resultCode:
 *                   type: string
 *                   example: "00090"
 */



import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

const LOW_STOCK_THRESHOLD = 10;

export default async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      stockQuantity: { $lt: LOW_STOCK_THRESHOLD },
    });

    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      products: lowStockProducts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
