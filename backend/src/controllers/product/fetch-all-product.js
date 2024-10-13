import { Product } from "../../models/index.js";
import { errorHelper, getText } from "../../utils/index.js";

// Get All Products API
export default  async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice,
    available,
    search,
    discounted,
    stockStatus,
    active
  } = req.query;

  const query = {};

  if (category) {
    query.category = category;
  }

  if (minPrice !== undefined && maxPrice !== undefined) {
    query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
  } else if (minPrice !== undefined) {
    query.price = { $gte: Number(minPrice) };
  } else if (maxPrice !== undefined) {
    query.price = { $lte: Number(maxPrice) };
  }

  if (available !== undefined) {
    query.stock = available === "true" ? { $gt: 0 } : { $lte: 0 };
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (discounted !== undefined) {
    query.discounted = discounted === "true";
  }

  if (stockStatus !== undefined) {
    query.stockStatus = stockStatus;
  }

  if (active !== undefined) {
    query.active = active === "true";
  }

  try {
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit)).lean();

    const totalProducts = await Product.countDocuments(query);

    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};



