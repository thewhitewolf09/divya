import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const { quantity, action } = req.body;

  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No id provided in params. Please enter an id."
      resultCode: "00022",
    });
  }

  if (quantity === undefined || !action) {
    return res.status(400).json({
      resultMessage: getText("00023"), // "Quantity and action are required."
      resultCode: "00023",
    });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        resultMessage: getText("00052"), // "Product not found."
        resultCode: "00052",
      });
    }

    // Perform stock adjustment based on action
    switch (action.toLowerCase()) {
      case "add":
        product.stock += Number(quantity);
        break;
      case "subtract":
        product.stock -= Number(quantity);
        if (product.stock < 0) {
          return res.status(400).json({
            resultMessage: getText("00026"), // "Insufficient stock."
            resultCode: "00026",
          });
        }
        break;
      default:
        return res.status(400).json({
          resultMessage: getText("00024"), // "Invalid action. Use 'add' or 'subtract'."
          resultCode: "00024",
        });
    }

    const updatedProduct = await product.save();

    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      product: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
