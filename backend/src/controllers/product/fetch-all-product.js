/**
 * @swagger
 * /api/products/all:
 *   get:
 *     summary: Retrieve a paginated list of all products
 *     description: Fetches products with optional filters such as category, price range, availability, search text, discount status, stock status, and active status.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: available
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter products based on availability
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name or description
 *       - in: query
 *         name: discounted
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter products by discount status
 *       - in: query
 *         name: stockStatus
 *         schema:
 *           type: string
 *         description: Filter products by stock status (e.g., "low", "out of stock")
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter products by active status
 *     responses:
 *       200:
 *         description: A paginated list of products
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
 *                 totalProducts:
 *                   type: integer
 *                   description: Total number of products matching the filters
 *                 currentPage:
 *                   type: integer
 *                   description: Current page number
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
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

// Get All Products API
export default async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    available,
    search,
    discounted,
    stockStatus,
    active,
    sort,
  } = req.query;

  const query = {};

  // Category Filter: Convert comma-separated string to an array and apply case-insensitive regex
  if (category) {
    query.category = {
      $in: category.split(",").map((cat) => new RegExp(`^${cat.trim()}$`, "i")),
    }; // Use case-insensitive regex for each category
  }

  // Price Filter: Check if minPrice and maxPrice are provided
  if (minPrice !== undefined && maxPrice !== undefined) {
    query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
  } else if (minPrice !== undefined) {
    query.price = { $gte: Number(minPrice) };
  } else if (maxPrice !== undefined) {
    query.price = { $lte: Number(maxPrice) };
  }

  // Available Stock Filter
  if (available !== undefined) {
    query.stockQuantity = available === "true" ? { $lte: 5 } : { $gt: 0 };
  }

  // Search Query: Use MongoDB text search
  if (search) {
    query.$text = { $search: search };
  }

  // Discounted Filter: Check if discounted is true
  if (discounted !== undefined) {
    query.discount = discounted === "true" ? { $gt: 0 } : { $lte: 0 }; // Filter by non-zero discount
  }

  // Stock Status Filter
  if (stockStatus !== undefined) {
    query.stockStatus = stockStatus; // Ensure the correct field name is used in the schema
  }

  // Active Filter
  if (active !== undefined) {
    query.isActive = active === "true"; // Check the `isActive` field in the model
  }

  // Sorting logic
  const sortOptions = {
    "price-asc": { price: 1 }, // Price: Low to High
    "price-desc": { price: -1 }, // Price: High to Low
    "newest-first": { createdAt: -1 }, // Newest First
  };

  const sortQuery = sortOptions[sort] || {};

  try {
    // Fetch the products based on the constructed query
    const products = await Product.find(query).sort(sortQuery);

    // Count the total number of products matching the query
    const totalProducts = await Product.countDocuments(query);

    // Send the response with products and pagination info
    return res.status(200).json({
      resultMessage: "Products retrieved successfully.",
      resultCode: "20001", // Custom code for success
      totalProducts,
      products,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({
      resultMessage:
        "An internal server error occurred while fetching products.",
      resultCode: "50001", // Custom code for server error
      error: err.message,
    });
  }
};
