import { Router } from "express";
import {
  addItemToCart,
  calculateTotal,
  clearCart,
  createCart,
  getCart,
  removeItemFromCart,
  updateItemQuantity,
} from "../controllers/cart/index.js";

import { auth } from "../middlewares/index.js";

const router = Router();

router.post("/create", auth, createCart);
router.get("/get-cart/:customerId", getCart);
router.put("/clear-cart/:customerId", auth, clearCart);
router.post("/add-item/:customerId", auth, addItemToCart);
router.put("/remove-item/:customerId/:productId", auth, removeItemFromCart);
router.put("/update-item/:customerId/:productId", auth, updateItemQuantity);
router.put("/calculate-total/:customerId", auth, calculateTotal);

export default router;
