/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     description: Retrieve a list of products filtered by a specific category.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: The category to filter products by
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Products retrieved successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                       price:
 *                         type: number
 *                       description:
 *                         type: string
 *       400:
 *         description: Bad request, no category provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "No category provided in params."
 *                 resultCode:
 *                   type: string
 *                   example: "00022"
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

// Get Products by Category API
export default async (req, res) => {
  const { category } = req.params;

  // Check if category is provided in the request params
  if (!category) {
    return res.status(400).json({
      resultMessage: "No category provided in params.",
      resultCode: "40001", // Custom code for missing category
    });
  }

  try {
    // Fetch products based on the provided category
    const products = await Product.find({ category });

    return res.status(200).json({
      resultMessage: "Products fetched successfully.",
      resultCode: "20001", // Custom code for success
      products,
    });
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return res.status(500).json({
      resultMessage:
        "An internal server error occurred while fetching products.",
      resultCode: "50001", // Custom code for server error
      error: err.message,
    });
  }
};
