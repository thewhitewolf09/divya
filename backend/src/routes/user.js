import { Router } from "express";
import { auth, imageUpload } from "../middlewares/index.js";
import {
  register,
  login,
  deleteUser,
  verifyOtp,
  sendOtp,
  fetchUser,
  updateUser,
  updateShopTimings,
} from "../controllers/user/index.js";

const router = Router();

// AUTH
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/send-otp", sendOtp);

router.get("/:id", fetchUser);
router.patch("/:id", auth, updateUser);
router.patch("/:id/shop-timing", auth, updateShopTimings);
router.delete("/:id", auth, deleteUser);

// EDIT
router.put("/", auth, imageUpload, updateUser);

export default router;
