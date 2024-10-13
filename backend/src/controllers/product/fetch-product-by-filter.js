import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";


// Filter Products API
export default async (req, res) => {
    const {
      category,
      priceMin,
      priceMax,
      stockStatus,
      discounted,
      active
    } = req.query;
  
    const query = {};
  
    if (category) {
      query.category = category;
    }
  
    if (priceMin !== undefined && priceMax !== undefined) {
      query.price = { $gte: Number(priceMin), $lte: Number(priceMax) };
    } else if (priceMin !== undefined) {
      query.price = { $gte: Number(priceMin) };
    } else if (priceMax !== undefined) {
      query.price = { $lte: Number(priceMax) };
    }
  
    if (stockStatus !== undefined) {
      query.stockStatus = stockStatus;
    }
  
    if (discounted !== undefined) {
      query.discounted = discounted === "true";
    }
  
    if (active !== undefined) {
      query.active = active === "true";
    }
  
    try {
      const products = await Product.find(query);
  
      return res.status(200).json({
        resultMessage: getText("00089"),
        resultCode: "00089",
        products,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json(errorHelper("00090", req, err.message));
    }
  };