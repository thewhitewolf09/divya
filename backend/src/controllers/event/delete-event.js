import Event from "../../models/event.js";
import { errorHelper, getText } from "../../utils/index.js";

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const { _id: userId } = req.user; // Extract the user ID from req.user

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

    if (event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        resultMessage: getText("00017"), // or another relevant error message
        resultCode: "00017",
      });
    }

    await Event.findByIdAndDelete(id);

    return res.status(200).json({
      resultMessage: getText("00092"),
      resultCode: "00092",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00008", req, err.message));
  }
};

export default deleteEvent;
