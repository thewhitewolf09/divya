import { Router } from "express";
import {
  createNotification,
  fetchNotification,
  markReadNotification,
  deleteNotification,
} from "../controllers/notification/index.js";

import { auth } from "../middlewares/index.js"; 

const router = Router();

router.post("/create", auth, createNotification);
router.get("/fetch/:role/:id", auth, fetchNotification);
router.patch("/mark-read/:id", auth, markReadNotification);
router.delete("/delete/:id", auth, deleteNotification);

export default router;
