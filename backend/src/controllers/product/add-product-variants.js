import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default  async (req, res) => {
  const { id } = req.params;
  const { variantName, variantPrice, variantStockQuantity } = req.body;

  console.log(req.body)

  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No id provided in params. Please enter an id."
      resultCode: "00022",
    });
  }

  if (!variantName || variantPrice === undefined || variantStockQuantity === undefined) {
    return res.status(400).json({
      resultMessage: getText("00023"), // "Variant details are required."
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

    // Add new variant to the product's variants array
    product.variants.push({
      variantName,
      variantPrice,
      variantStockQuantity
    });

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


