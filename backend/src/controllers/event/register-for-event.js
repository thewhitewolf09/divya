import Event from "../../models/event.js";
import { errorHelper, getText } from "../../utils/index.js";

const registerForEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"),
      resultCode: "00022",
    });
  }

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        resultMessage: getText("00052"),
        resultCode: "00052",
      });
    }

    // Check if the event was created by the user attempting to register
    if (event.createdBy.toString() === userId.toString()) {
      return res.status(403).json({
        resultMessage: "You cannot register for your own event.",
        resultCode: "00003",
      });
    }

    if (event.registeredAttendees.includes(userId)) {
      return res.status(400).json({
        resultMessage: "You are already registered for this event.",
        resultCode: "00000",
      });
    }

    event.registeredAttendees.push(userId);
    await event.save();

    return res.status(200).json({
      resultMessage: "Successfully registered for the event.",
      resultCode: "00000",
      event,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00008", req, err.message));
  }
};

export default registerForEvent;
