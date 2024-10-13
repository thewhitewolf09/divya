import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

// Search Products API
export default async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No search query provided."
      resultCode: "00022",
    });
  }

  try {
    const products = await Product.find({
      $text: { $search: q },
    });

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
