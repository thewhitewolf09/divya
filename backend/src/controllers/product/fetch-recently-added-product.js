/**
 * @swagger
 * /api/products/recent:
 *   get:
 *     summary: Get recently added products
 *     description: Retrieves products that were added within the last 30 days.
 *     tags:
 *       - Product
 *     responses:
 *       200:
 *         description: List of recently added products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   example: "Recently added products fetched successfully."
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
 *                   example: "Failed to retrieve recently added products."
 *                 resultCode:
 *                   type: string
 *                   example: "00090"
 */

import { Product } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

const RECENT_DAYS_THRESHOLD = 30;

// Calculate the date for the threshold
const calculateRecentDate = () => {
  const today = new Date();
  return new Date(today.setDate(today.getDate() - RECENT_DAYS_THRESHOLD));
};

export default async (req, res) => {
  try {
    const recentDate = calculateRecentDate();

    const recentProducts = await Product.find({
      createdAt: { $gte: recentDate },
    });

    return res.status(200).json({
      resultMessage: "Recently added products fetched successfully.",
      resultCode: "20001", // Custom success code
      products: recentProducts,
    });
  } catch (err) {
    console.error("Error fetching recent products:", err);
    return res.status(500).json({
      resultMessage:
        "An error occurred while fetching recently added products.",
      resultCode: "50001", // Custom error code
      error: err.message,
    });
  }
};
