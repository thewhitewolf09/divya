import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

const LOW_STOCK_THRESHOLD = 10;

export default async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      stockQuantity: { $lt: LOW_STOCK_THRESHOLD },
    });

    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      products: lowStockProducts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
