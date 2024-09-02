import Event from "../../models/event.js";
import { errorHelper, getText } from "../../utils/index.js";

const unregisterUser = async (req, res) => {
  const { id: eventId } = req.params;
  const userId = req.user._id;

  try {
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, registeredAttendees: userId },
      { $pull: { registeredAttendees: userId } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        resultMessage: getText("00025"),
        resultCode: "00025",
      });
    }

    return res.status(200).json({
      resultMessage: getText("00095"),
      resultCode: "00095",
      event: updatedEvent,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00090", req, err.message));
  }
};

export default unregisterUser;
