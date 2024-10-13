import { Product, Sale } from '../../models/index.js';
import { errorHelper, getText } from '../../utils/index.js';

export default  async (req, res) => {
  try {
    // Aggregate sales by productId, summing quantity and revenue
    const salesAggregation = await Sale.aggregate([
      {
        $group: {
          _id: '$productId',
          totalQuantitySold: { $sum: '$quantity' },
          totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      },
      {
        $sort: { totalQuantitySold: -1 } // Sort by the highest quantity sold
      },
      {
        $limit: 10 // Return top 10 selling products
      }
    ]);

    // Populate product details for the top-selling products
    const topSellingProducts = await Product.populate(salesAggregation, {
      path: '_id',
      select: 'name category price'
    });

    return res.status(200).json({
      resultMessage: getText('00098'), // Top-selling products fetched successfully
      resultCode: '00098',
      data: topSellingProducts,
    });
  } catch (err) {
    console.error('Error fetching top-selling products:', err);
    return res.status(500).json(errorHelper('00090', req, err.message)); // Error handling
  }
};


