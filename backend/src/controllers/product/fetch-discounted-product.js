/**
 * @swagger
 * /api/products/discounted:
 *   get:
 *     summary: Get discounted products
 *     description: Retrieves products that are currently discounted and active.
 *     tags:
 *       - Product
 *     responses:
 *       200:
 *         description: List of discounted products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Discounted products fetched successfully."
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
 *                   example: "Failed to retrieve discounted products."
 *                 resultCode:
 *                   type: string
 *                   example: "00090"
 */



import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";


export default async (req, res) => {
    try {
      const discountedProducts = await Product.find({ discount: { $gt: 0 }, isActive: true });
  
      return res.status(200).json({
        resultMessage: getText("00089"), // "Discounted products fetched successfully."
        resultCode: "00089",
        products: discountedProducts,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json(errorHelper("00090", req, err.message));
    }
  };