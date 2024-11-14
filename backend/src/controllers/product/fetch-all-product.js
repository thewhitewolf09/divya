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
import { errorHelper, getText } from "../../utils/index.js";

// Get All Products API
export default  async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice,
    available,
    search,
    discounted,
    stockStatus,
    active
  } = req.query;

  const query = {};

  if (category) {
    query.category = category;
  }

  if (minPrice !== undefined && maxPrice !== undefined) {
    query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
  } else if (minPrice !== undefined) {
    query.price = { $gte: Number(minPrice) };
  } else if (maxPrice !== undefined) {
    query.price = { $lte: Number(maxPrice) };
  }

  if (available !== undefined) {
    query.stock = available === "true" ? { $gt: 0 } : { $lte: 0 };
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (discounted !== undefined) {
    query.discounted = discounted === "true";
  }

  if (stockStatus !== undefined) {
    query.stockStatus = stockStatus;
  }

  if (active !== undefined) {
    query.active = active === "true";
  }

  try {
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit)).lean();

    const totalProducts = await Product.countDocuments(query);

    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};



