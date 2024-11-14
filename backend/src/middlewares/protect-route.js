import { User, Customer } from "../models/index.js"; // Import both models
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
    const flag = jwt.verify(token, jwtSecretKey); // Verify token
    req.user = flag;

    if (!Types.ObjectId.isValid(req.user._id))
      return res.status(400).json(errorHelper("00007", req));

    let user;

    // First, check in the User (shop owner) collection
    user = await User.findOne({
      _id: req.user._id,
      isVerified: true,
    }).catch((err) => {
      return res.status(500).json(errorHelper("00008", req, err.message));
    });

    // If not found in the User collection, check in the Customer collection
    if (!user) {
      user = await Customer.findOne({
        _id: req.user._id,
        isVerified: true,
      }).catch((err) => {
        return res.status(500).json(errorHelper("00008", req, err.message));
      });
    }

    if (!user) return res.status(404).json(errorHelper("00009", req)); // "User not found."

    // Proceed to next middleware if the user is a customer
    next();
  } catch (err) {
    return res.status(401).json(errorHelper("00012", req, err.message));
  }
};
