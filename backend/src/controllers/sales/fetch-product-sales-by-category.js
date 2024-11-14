/**
 * @swagger
 * /api/sales/category/{categoryId}:
 *   get:
 *     summary: Retrieve sales by product category
 *     description: Fetch all sales records for products in the specified category, including total sales and revenue.
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           example: "60f2a4c7f1b2c14b8d6d4d9d"  # Example category ID
 *           description: The ID of the product category
 *     responses:
 *       200:
 *         description: Sales data for the specified category fetched successfully
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
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: integer
 *                       description: Total number of sales for products in the category
 *                     totalRevenue:
 *                       type: number
 *                       format: float
 *                       description: Total revenue from sales in the category
 *                     sales:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: The ID of the sale
 *                           productId:
 *                             type: object
 *                             description: Product details related to the sale
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               price:
 *                                 type: number
 *                                 format: float
 *                           customerId:
 *                             type: object
 *                             description: Customer details related to the sale
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           quantity:
 *                             type: integer
 *                             description: Quantity of product sold
 *                           price:
 *                             type: number
 *                             format: float
 *                             description: Price of the sale
 *       400:
 *         description: Missing category ID
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



import { Product, Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    return res.status(400).json({
      resultMessage: getText('00027'), // Missing category ID
      resultCode: '00027',
    });
  }

  try {
    // Fetch products that belong to the given category
    const products = await Product.find({ category: categoryId }).select('_id');
    const productIds = products.map((product) => product._id);

    // Fetch sales for the products in the specified category
    const sales = await Sale.find({ productId: { $in: productIds } });

    // Calculate total sales and revenue
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.price * sale.quantity, 0);

    return res.status(200).json({
      resultMessage: getText('00097'), // Sales data fetched successfully
      resultCode: '00097',
      data: {
        totalSales,
        totalRevenue,
        sales,
      },
    });
  } catch (err) {
    console.error('Error fetching sales by product category:', err);
    return res.status(500).json(errorHelper('00090', req, err.message)); // Error handling
  }
};


