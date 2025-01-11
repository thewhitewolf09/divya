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
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  try {
    // Fetch discounted products that are active
    const discountedProducts = await Product.find({
      discount: { $gt: 0 },
      isActive: true,
    });

    return res.status(200).json({
      resultMessage: "Discounted products fetched successfully.",
      resultCode: "20001", // Custom code for success
      products: discountedProducts,
    });
  } catch (err) {
    console.error("Error fetching discounted products:", err);
    return res.status(500).json({
      resultMessage:
        "An internal server error occurred while fetching discounted products.",
      resultCode: "50001", // Custom code for server error
      error: err.message,
    });
  }
};
