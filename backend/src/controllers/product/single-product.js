import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"),
      resultCode: "00022",
    });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        resultMessage: getText("00052"),
        resultCode: "00052",
      });
    }

    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      product,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00008", req, err.message));
  }
};
