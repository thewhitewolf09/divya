import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

const RECENT_DAYS_THRESHOLD = 30; 

// Calculate the date for the threshold
const calculateRecentDate = () => {
  const today = new Date();
  return new Date(today.setDate(today.getDate() - RECENT_DAYS_THRESHOLD));
};

export default async (req, res) => {
  try {
    const recentDate = calculateRecentDate();

    const recentProducts = await Product.find({ createdAt: { $gte: recentDate } });

    return res.status(200).json({
      resultMessage: getText("00089"), // "Recently added products fetched successfully."
      resultCode: "00089",
      products: recentProducts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};