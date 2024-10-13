import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id, variantId } = req.params;

  if (!id || !variantId) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No id provided in params. Please enter an id."
      resultCode: "00022",
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

    // Find the variant within the product's variants array
    const variantIndex = product.variants.findIndex(
      (variant) => variant._id.toString() === variantId
    );

    if (variantIndex === -1) {
      return res.status(404).json({
        resultMessage: getText("00053"), // "Variant not found."
        resultCode: "00053",
      });
    }

    // Remove the variant from the variants array
    product.variants.splice(variantIndex, 1);

    const updatedProduct = await product.save();

    return res.status(200).json({
      resultMessage: getText("00092"), // "Variant deleted successfully."
      resultCode: "00092",
      product: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
