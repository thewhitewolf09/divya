import { User } from "../../models/index.js";
import {
  generateRandomCode,
  errorHelper,
  getText,
  logger,
} from "../../utils/index.js";
import bcrypt from "bcryptjs";
const { hash } = bcrypt;

export default async (req, res) => {
  const anon = "anon" + generateRandomCode(8);
  const hashed = await hash(anon, 10);
  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        name: anon,
        email: anon + "@anon.com",
        password: hashed,
        photoUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1200px-Node.js_logo.svg.png",
        isActivated: false,
        deletedAt: Date.now(),
      },
    }
  ).catch((err) => {
    return res.status(500).json(errorHelper("00090", req, err.message));
  });


  logger("00092", req.user._id, getText("00092"), "Info", req);
  return res.status(200).json({
    resultMessage: getText("00092"),
    resultCode: "00092",
  });
};
