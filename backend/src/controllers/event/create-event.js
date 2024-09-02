import Event from "../../models/event.js";
import { errorHelper, getText } from "../../utils/index.js";

const createEvent = async (req, res) => {
  const { title, description, eventLocation, eventDate, registrationFee } = req.body;
  const createdBy = req.user._id; // Automatically set createdBy to the ID of the authenticated user

  if (!title || !description || !eventLocation || !eventDate || !registrationFee) {
    return res.status(400).json({
      resultMessage: getText("00025"),
      resultCode: "00025",
    });
  }

  try {
    const newEvent = new Event({
      title,
      description,
      eventLocation,
      eventDate,
      registrationFee,
      createdBy,
      registeredAttendees: [createdBy],
    });

    const savedEvent = await newEvent.save();
    return res.status(201).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      event: savedEvent,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};

export default createEvent;
