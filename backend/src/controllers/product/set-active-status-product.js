import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;


  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No product ID provided."
      resultCode: "00022",
    });
  }

  try {
    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        resultMessage: getText("00052"), // "Product not found."
        resultCode: "00052",
      });
    }

    product.isActive = !product.isActive;

    const updatedProduct = await product.save();

    return res.status(200).json({
      resultMessage: getText("00089"), // "Product status updated successfully."
      resultCode: "00089",
      product: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
