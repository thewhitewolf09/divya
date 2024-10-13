import { Product, Sale } from "../../models/index.js"; // Import your models
import { errorHelper, getText } from "../../utils/index.js";
import mongoose from "mongoose";

export default async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query; // Expecting dates in query params

  // Validate the ID
  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No product ID provided."
      resultCode: "00022",
    });
  }

  // Validate the dates
  if (!startDate || !endDate) {
    return res.status(400).json({
      resultMessage: getText("00023"), // "Start date and end date are required."
      resultCode: "00023",
    });
  }

  try {
    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        resultMessage: getText("00024"), // "Invalid date format."
        resultCode: "00024",
      });
    }

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        resultMessage: getText("00052"), // "Product not found."
        resultCode: "00052",
      });
    }

    // Fetch sales data
    const sales = await Sale.aggregate([
      {
        $match: {
          productId: mongoose.Types.ObjectId(id),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$productId",
          totalSold: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } }
        }
      }
    ]);

    // Prepare report data
    const report = sales.length > 0 ? sales[0] : { totalSold: 0, totalRevenue: 0 };

    return res.status(200).json({
      resultMessage: getText("00089"), // "Sales report retrieved successfully."
      resultCode: "00089",
      report
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};


