import { Router } from "express";

import { auth } from "../middlewares/index.js";
import {
  getPaymentHistory,
  getPaymentReceipt,
  initiatePayment,
  paymentCallback,
} from "../controllers/payments/index.js";

const router = Router();

router.post("/initiate", auth, initiatePayment);
router.post("/callback", auth, paymentCallback);
router.get("/history", getPaymentHistory);
router.get("/receipt/:transactionId", getPaymentReceipt);

export default router;
