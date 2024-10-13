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


