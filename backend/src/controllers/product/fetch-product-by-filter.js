/**
 * @swagger
 * /api/products/filter:
 *   get:
 *     summary: Filter products based on query parameters
 *     description: Retrieve a list of products that match specified filter criteria.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category to filter products by
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *         description: Minimum price for filtering products
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *         description: Maximum price for filtering products
 *       - in: query
 *         name: stockStatus
 *         schema:
 *           type: string
 *           enum: [inStock, outOfStock]
 *         description: Stock status of products
 *       - in: query
 *         name: discounted
 *         schema:
 *           type: boolean
 *         description: Filter products that are discounted (true/false)
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter products that are active (true/false)
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


// Filter Products API
export default async (req, res) => {
    const {
      category,
      priceMin,
      priceMax,
      stockStatus,
      discounted,
      active
    } = req.query;
  
    const query = {};
  
    if (category) {
      query.category = category;
    }
  
    if (priceMin !== undefined && priceMax !== undefined) {
      query.price = { $gte: Number(priceMin), $lte: Number(priceMax) };
    } else if (priceMin !== undefined) {
      query.price = { $gte: Number(priceMin) };
    } else if (priceMax !== undefined) {
      query.price = { $lte: Number(priceMax) };
    }
  
    if (stockStatus !== undefined) {
      query.stockStatus = stockStatus;
    }
  
    if (discounted !== undefined) {
      query.discounted = discounted === "true";
    }
  
    if (active !== undefined) {
      query.active = active === "true";
    }
  
    try {
      const products = await Product.find(query);
  
      return res.status(200).json({
        resultMessage: getText("00089"),
        resultCode: "00089",
        products,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json(errorHelper("00090", req, err.message));
    }
  };