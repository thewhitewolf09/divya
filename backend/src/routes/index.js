import { Router } from "express";
import user from "./user.js";
import product from "./product.js";
import sale from "./sale.js";
import customer from "./customer.js";
import cart from "./cart.js";
import order from "./order.js";
import payments from "./payments.js";

const router = Router();

router.use("/users", user);
router.use("/products", product);
router.use("/customers", customer);
router.use("/sales", sale);
router.use("/carts", cart);
router.use("/orders", order);
router.use("/payments", payments);

export default router;
