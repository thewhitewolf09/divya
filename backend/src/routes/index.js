import { Router } from "express";
import user from "./user.js";
import product from "./product.js";
import sale from "./sale.js";
import customer from "./customer.js";
const router = Router();

router.use("/users", user);
router.use("/products", product);
router.use("/customers", customer);
router.use("/sale", sale);

export default router;
