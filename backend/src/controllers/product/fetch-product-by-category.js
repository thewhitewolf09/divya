import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

// Get Products by Category API
export default async (req, res) => {
  const { category } = req.params;

  if (!category) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No category provided in params."
      resultCode: "00022",
    });
  }

  try {
    const products = await Product.find({ category });

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
