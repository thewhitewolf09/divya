import { User } from "../../models/index.js";
import { errorHelper, logger, getText } from "../../utils/index.js";

export default async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).catch((err) => {
    return res.status(500).json(errorHelper("00088", req, err.message));
  });

  logger("00089", req.user._id, getText("00089"), "Info", req);
  return res.status(200).json({
    resultMessage: getText("00089"),
    resultCode: "00089",
    user,
  });
};
