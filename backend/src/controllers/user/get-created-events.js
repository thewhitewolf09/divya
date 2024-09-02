import Event from "../../models/event.js";
import { errorHelper, getText } from "../../utils/index.js";
import mongoose from "mongoose";

export default async (req, res) => {
  const userId = req.user._id;
  console.log("Created Events Function")
  console.log(userId)
  console.log(typeof(userId))
  try {
    const events = await Event.find({ createdBy: userId }).sort({ updatedAt: -1 });
    return res.status(200).json({
      resultMessage: getText("00094"),
      resultCode: "00094",
      events,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00008", req, err.message));
  }
};
