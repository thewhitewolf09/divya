import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id, variantId } = req.params;
  const { variantName, variantPrice, variantStockQuantity } = req.body;

  if (!id || !variantId) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No id provided in params. Please enter an id."
      resultCode: "00022",
    });
  }

  if (
    variantName === undefined &&
    variantPrice === undefined &&
    variantStockQuantity === undefined
  ) {
    return res.status(400).json({
      resultMessage: getText("00023"), // "At least one variant detail is required to update."
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

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        resultMessage: getText("00053"), // "Variant not found."
        resultCode: "00053",
      });
    }

    // Update the variant details
    if (variantName !== undefined) {
      variant.variantName = variantName;
    }
    if (variantPrice !== undefined) {
      variant.variantPrice = variantPrice;
    }
    if (variantStockQuantity !== undefined) {
      variant.variantStockQuantity = variantStockQuantity;
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
