import { Router } from "express";
import user from "./user.js";
import eventRoutes from "./events.js"
const router = Router();

router.use("/users", user);
router.use("/events", eventRoutes);

export default router;
