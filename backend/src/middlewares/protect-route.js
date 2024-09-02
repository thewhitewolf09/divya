import { User } from "../models/index.js";
import { errorHelper } from "../utils/index.js";
import { jwtSecretKey } from "../config/index.js";
import pkg from "mongoose";
const { Types } = pkg;
import jwt from "jsonwebtoken";

export default async (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(401).json(errorHelper("00006", req));

  if (token.includes("Bearer"))
    token = req.header("Authorization").replace("Bearer ", "");

  try {
    const flag = jwt.verify(token, jwtSecretKey);
    // console.log(flag)
    req.user = flag;
    if (!Types.ObjectId.isValid(req.user._id))
      return res.status(400).json(errorHelper("00007", req));

    const exists = await User.exists({
      _id: req.user._id,
      isActivated: true,
    }).catch((err) => {
      return res.status(500).json(errorHelper("00008", req, err.message));
    });

    if (!exists) return res.status(400).json(errorHelper("00009", req));
    // console.log(req.user._id)
    next();
  } catch (err) {
    return res.status(401).json(errorHelper("00012", req, err.message));
  }
};
