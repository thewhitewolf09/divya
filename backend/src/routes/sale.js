import { Router } from "express";
import { auth } from "../middlewares/index.js";
import {
  addNewSale,
  deleteSale,
  getAllSales,
  getCreditSales,
  getCustomerSales,
  getMonthlySales,
  getOutstandingCredit,
  getProductSalesReport,
  getSalesByDateRange,
  getSalesByProductCategory,
  getSalesReport,
  getSalesSummary,
  getTopSellingProducts,
  updateSale,
} from "../controllers/sales/index.js";

const router = Router();

router.post("/add", auth, addNewSale);
router.put("/:id", auth, updateSale);
router.delete("/:id", auth, deleteSale);
router.get("/all", getAllSales);
router.get("/range", getSalesByDateRange);
router.get("/category/:categoryId", getSalesByProductCategory);
router.get("/top-products", getTopSellingProducts);
router.get("/monthly", getMonthlySales);
router.get("/credit", getCreditSales);
router.get("/customer/:customerId", getCustomerSales);
router.get("/product/:productId", getProductSalesReport);
router.get("/report", getSalesReport);
router.get("/summary", getSalesSummary);
router.get("/credit/outstanding", getOutstandingCredit);


export default router;
