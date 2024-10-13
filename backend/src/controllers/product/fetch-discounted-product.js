import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";


export default async (req, res) => {
    try {
      const discountedProducts = await Product.find({ discount: { $gt: 0 }, isActive: true });
  
      return res.status(200).json({
        resultMessage: getText("00089"), // "Discounted products fetched successfully."
        resultCode: "00089",
        products: discountedProducts,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json(errorHelper("00090", req, err.message));
    }
  };