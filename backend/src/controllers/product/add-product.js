import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { name, category, price, stockQuantity, unit, description, variants } = req.body;
  const addedBy = req.user._id;

  // Validate required fields
  if (!name || !category || !price || stockQuantity === undefined) {
    console.log(req.body);
    return res.status(400).json({
      resultMessage: getText("00025"),
      resultCode: "00025",
    });
  }

  // Format variants to match expected structure
  const formattedVariants = variants.map((variant) => ({
    variantName: variant.variantName || variant, // Use the variant name from the object or fallback to string
    variantPrice: variant.variantPrice || price, // Default to main price if not provided
    variantStockQuantity: variant.variantStockQuantity || stockQuantity // Default to main stock if not provided
  }));

  try {
    // Create a new product with formatted variants
    const newProduct = new Product({
      name,
      category,
      price,
      stockQuantity,
      unit,
      description,
      variants: formattedVariants, // Use the formatted variants
      addedBy,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      product: savedProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};
