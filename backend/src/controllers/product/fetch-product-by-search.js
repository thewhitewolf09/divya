/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products by query
 *     description: Allows users to search for products based on a search query. Returns products that match the search criteria.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: The search query for finding products
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
 *         description: Bad request, no search query provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "No search query provided."
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

// Search Products API
export default async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      resultMessage: "No search query provided.",
      resultCode: "40001", // Custom code for missing query
    });
  }

  try {
    const products = await Product.find({
      $text: { $search: q },
    });

    return res.status(200).json({
      resultMessage: "Products successfully retrieved based on search query.",
      resultCode: "20001", // Custom code for successful retrieval
      products,
    });
  } catch (err) {
    console.error("Error during product search:", err);
    return res.status(500).json({
      resultMessage: "An error occurred while searching for products.",
      resultCode: "50001", // Custom code for server error
      error: err.message,
    });
  }
};
