/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Retrieve a single product by its ID
 *     description: Fetches detailed information of a specific product based on the provided product ID.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the product to retrieve
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Product retrieved successfully."
 *                 resultCode:
 *                   type: string
 *                   example: "00089"
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request, ID not provided
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
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      resultMessage: "No product ID provided.",
      resultCode: "40001", // Custom error code
    });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        resultMessage: "Product not found.",
        resultCode: "40401", // Custom error code
      });
    }

    return res.status(200).json({
      resultMessage: "Product fetched successfully.",
      resultCode: "20001", // Custom success code
      product,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      resultMessage: "An error occurred while fetching the product.",
      resultCode: "50001", // Custom error code
      error: err.message,
    });
  }
};
