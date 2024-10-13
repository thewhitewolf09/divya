import { Product } from "../../models/index.js";
import { getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "Invalid product ID."
      resultCode: "00022",
    });
  }

  // Find the product by ID
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      resultMessage: getText("00052"), // "Product not found."
      resultCode: "00052",
    });
  }

  try {
    // Update product with uploaded image URL
    product.productImage = req.imageUrl;
    await product.save();

    return res.status(200).json({
      resultMessage: getText("00089"), // "Image uploaded successfully."
      resultCode: "00089",
      product,
    });
  } catch (err) {
    return res.status(500).json({
      resultMessage: getText("00090"), // "Failed to update product."
      resultCode: "00090",
      error: err.message,
    });
  }
};
