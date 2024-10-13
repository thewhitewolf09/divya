import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user._id;

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

    if (product.addedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        resultMessage: getText("00017"),
        resultCode: "00017",
      });
    }

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        product[key] = updates[key];
      }
    });

    const updatedProduct = await product.save();

    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      product: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00008", req, err.message));
  }
};
