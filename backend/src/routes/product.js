import { Router } from "express";
import { auth, imageUpload } from "../middlewares/index.js";
import {
  addProductVariant,
  bulkUpdateProducts,
  createProduct,
  deleteProduct,
  deleteProductVariant,
  filterProducts,
  getAllProducts,
  getDiscountedProducts,
  getLowStockProducts,
  getProductsByCategory,
  getRecentlyAddedProducts,
  getSingleProduct,
  manageProductStock,
  searchProducts,
  toggleProductStatus,
  updateProduct,
  updateProductVariant,
  uploadProductImage,
} from "../controllers/product/index.js";

const router = Router();

router.post("/add", auth, createProduct);
router.get("/all", getAllProducts);
router.get("/:id", getSingleProduct);
router.put("/:id", auth, updateProduct);
router.delete("/:id", auth, deleteProduct);
router.get("/search?q=:query", searchProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/filter", filterProducts);
router.patch("/:id/stock", auth, manageProductStock);
router.post("/:id/variants", auth, addProductVariant);
router.put("/:id/variants/:variantId", auth, updateProductVariant);
router.delete("/:id/variants/:variantId", auth, deleteProductVariant);
router.patch("/bulk", auth, bulkUpdateProducts);
router.post("/:id/image", auth, imageUpload, uploadProductImage);
router.get("/low-stock", getLowStockProducts);
router.get("/recent", getRecentlyAddedProducts);
router.get("/discounted", getDiscountedProducts);
router.patch("/:id/activate", auth, toggleProductStatus);

export default router;
