import { Router } from "express";
import { auth } from "../middlewares/index.js";
import {createEvent,updateEvent, deleteEvent, registerForEvent, fetchEvents, singleEvent, unregisterUser} from "../controllers/event/index.js";


const router = Router();

router.post("/", auth, createEvent);
router.put("/:id",auth, updateEvent)
router.delete("/:id",auth, deleteEvent);
router.get("/",auth, fetchEvents)
router.get("/:id",auth, singleEvent)
router.post("/:id/register",auth, registerForEvent)
router.post("/:id/unregister",auth, unregisterUser);

export default router;