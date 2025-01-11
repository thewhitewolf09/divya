/**
 * @swagger
 * /api/sales/top-products:
 *   get:
 *     summary: Retrieve the top-selling products
 *     description: Fetch the top 10 selling products based on total quantity sold and total revenue.
 *     tags:
 *       - Sales
 *     responses:
 *       200:
 *         description: Top-selling products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Success message
 *                 resultCode:
 *                   type: string
 *                   description: Success code
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the product
 *                       name:
 *                         type: string
 *                         description: The name of the product
 *                       category:
 *                         type: string
 *                         description: The category of the product
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: Price of the product
 *                       totalQuantitySold:
 *                         type: integer
 *                         description: Total quantity of the product sold
 *                       totalRevenue:
 *                         type: number
 *                         format: float
 *                         description: Total revenue generated from the product
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultMessage:
 *                   type: string
 *                   description: Error message
 *                 resultCode:
 *                   type: string
 *                   description: Error code
 */

import { Product, Sale } from "../../models/index.js";
import { errorHelper } from "../../utils/index.js";

export default async (req, res) => {
  try {
    // Aggregate sales by productId, summing quantity and revenue
    const salesAggregation = await Sale.aggregate([
      {
        $group: {
          _id: "$productId",
          totalQuantitySold: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } },
        },
      },
      {
        $sort: { totalQuantitySold: -1 }, // Sort by the highest quantity sold
      },
      {
        $limit: 10, // Return top 10 selling products
      },
    ]);

    if (salesAggregation.length === 0) {
      return res.status(404).json({
        resultMessage: "No top-selling products found.",
        resultCode: "40401", // Custom code for no top-selling products
      });
    }

    // Populate product details for the top-selling products
    const topSellingProducts = await Product.populate(salesAggregation, {
      path: "_id",
      select: "name category price",
    });

    // Format the response to include both product details and aggregated data
    const formattedData = topSellingProducts.map((item) => ({
      productId: item._id._id,
      productName: item._id.name,
      category: item._id.category,
      price: item._id.price,
      totalQuantitySold: item.totalQuantitySold,
      totalRevenue: item.totalRevenue,
    }));

    return res.status(200).json({
      resultMessage: "Top-selling products fetched successfully.",
      resultCode: "20001", // Custom code for success
      data: formattedData,
    });
  } catch (err) {
    console.error("Error fetching top-selling products:", err);
    return res.status(500).json({
      resultMessage: "An error occurred while fetching top-selling products.",
      resultCode: "50001", // Custom code for server error
      error: err.message,
    });
  }
};
