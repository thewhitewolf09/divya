import { Router } from "express";

import { auth } from "../middlewares/index.js";
import {
  canceledOrder,
  createOrder,
  getAllOrderBycustomer,
  getOrderByCustomer,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order/index.js";

const router = Router();

router.post("/", auth, createOrder);
router.put("/:orderId/cancel", auth, canceledOrder);
router.get("/order/:orderId", getOrderById);
router.put("/:orderId", auth, updateOrderStatus);
router.get("/all", getAllOrderBycustomer);
router.get("/customer/:customerId", getOrderByCustomer);

export default router;
