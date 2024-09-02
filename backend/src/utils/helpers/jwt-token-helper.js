import pkg from "jsonwebtoken";
const { sign } = pkg;
import { jwtSecretKey } from "../../config/index.js";

export function signAccessToken (userId) {
  const accessToken = sign({ _id: userId }, jwtSecretKey, {
    expiresIn: "30d",
  });
  return accessToken;
}