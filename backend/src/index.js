import express from "express";
import { port, dbUri, jwtSecretKey } from "./config/index.js";
import cors from "cors";
import routes from "./routes/index.js";
import { logger } from "./utils/index.js";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerConfig from "./config/swagger.config.js";
import cron from 'node-cron';
import { sendUdharPaymentReminders } from "./reminders/sendUdharPaymentReminders.js";
import { sendPickupReminders } from "./reminders/sendPickupReminders.js";
import { sendMissedPickupAlerts } from "./reminders/sendMissedPickupAlerts.js";

const app = express();

// MONGO DB connection
await mongoose
  .connect(dbUri)
  .then(() => {
    console.log("Mongodb Connection Successfull");
  })
  .catch((err) => {
    console.log(err);
  });

process.on("uncaughtException", async (error) => {
  console.log(error);
  logger("00001", "", error.message, "Uncaught Exception", "");
});

process.on("unhandledRejection", async (ex) => {
  console.log(ex);
  logger("00002", "", ex.message, "Unhandled Rejection", "");
});

if (!jwtSecretKey) {
  logger("00003", "", "Jwtprivatekey is not defined", "Process-Env", "");
  process.exit(1);
}

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders:
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// app.use(rateLimiter);
app.use("/api", routes);

app.get("/", (_req, res) => {
  return res
    .status(200)
    .json({
      resultMessage: "Project is successfully working",
      resultCode: "00004",
    })
    .end();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Content-Security-Policy-Report-Only", "default-src: https:");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT POST PATCH DELETE GET");
    return res.status(200).json({});
  }
  next();
});
app.use((error, req, res, _next) => {
  res.status(error.status || 500);
  let resultCode = "00015";
  let level = "External Error";
  if (error.status === 500) {
    resultCode = "00013";
    level = "Server Error";
  } else if (error.status === 404) {
    resultCode = "00014";
    level = "Client Error";
  }
  logger(resultCode, req?.user?._id ?? "", error.message, level, req);
  return res.json({
    resultMessage: error.message,
    resultCode: resultCode,
  });
});


// API Documentation
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

// Initialize swagger-jsdoc with your configuration
const specs = swaggerJsdoc(swaggerConfig);

// Serve Swagger documentation on the `/api-docs` endpoint
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss:
      ".swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }",
    customCssUrl: CSS_URL,
  })
);

// Schedule daily Udhar payment reminders
cron.schedule('0 9 * * *', sendUdharPaymentReminders); // Run daily at 9 AM

// Schedule daily pickup reminders
cron.schedule('0 8 * * *', sendPickupReminders); // Run daily at 8 AM

// Schedule missed pickup alerts (every 12 hours)
cron.schedule('0 */12 * * *', sendMissedPickupAlerts); // Run every 12 hours


// Server Listening
app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return process.exit(1);
  }
  console.log(`Server is running on ${port}`);
});

export default app;
