export { default as swaggerConfig } from "./swagger.config.js";
import { config } from "dotenv";
config();

const { DB_URI, PORT, JWT_SECRET_KEY, YOUR_EMAIL } = process.env;

export const port = PORT || 5000;
export const jwtSecretKey = JWT_SECRET_KEY;
export const dbUri = DB_URI;
export const email = YOUR_EMAIL;
export const specs = "/docs";
