// controllers/event/index.js

import Event from "../../models/event.js";
import { errorHelper, getText } from "../../utils/index.js";

const singleEvent = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      resultMessage: getText("00022"), // "No id provided in params. Please enter an id."
      resultCode: "00022",
    });
  }

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        resultMessage: getText("00052"), // "The user could not find."
        resultCode: "00052",
      });
    }

    return res.status(200).json({
      resultMessage: getText("00089"),
      resultCode: "00089",
      event,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(errorHelper("00008", req, err.message));
  }
};

export default singleEvent;
