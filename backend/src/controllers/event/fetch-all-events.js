import Event from "../../models/event.js";
import { errorHelper, getText } from "../../utils/index.js";

const fetchEvents = async (req, res) => {
  try {
    // Fetch events and sort by `updatedAt` in descending order
    const events = await Event.find().sort({ updatedAt: -1 });
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

export default fetchEvents;
