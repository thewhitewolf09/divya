import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Divya-backend",
      version: "1.0.0",
      description: "The API documentation of Shop Management App",
      license: {
        name: "ISC",
        url: "https://choosealicense.com/licenses/gpl-3.0/",
      },
      contact: {
        name: "Sumit Nirmal",
        url: "https://sumitnirmal.netlify.app",
        email: "sumitramprakashnirmal@gmail.com",
      },
    },
    servers: [
      { url: "https://divya-blond.vercel.app/" },
      { url: "http://localhost:8080/" },
    ],
  },
  tags: [
    { name: "User", description: "API for user data" },
    { name: "Customer", description: "API for customer data" },
    { name: "Product", description: "API for product management" },
    { name: "Sales", description: "API for sales management" },
    { name: "Membership", description: "API for membership management" },
    { name: "Payment", description: "API for payment management" },
    { name: "Order", description: "API for order management" },
    { name: "Cart", description: "API for cart management" },
    { name: "Notification", description: "API for notification management" },
  ],
  apis: [
    path.resolve(__dirname, "../routes/*.js"), 
    path.resolve(__dirname, "../models/*.js"), 
    path.resolve(__dirname, "../controllers/user/*.js"),
    path.resolve(__dirname, "../controllers/user/auth/*.js"),
    path.resolve(__dirname, "../controllers/customer/*.js"),
    path.resolve(__dirname, "../controllers/product/*.js"),
    path.resolve(__dirname, "../controllers/sales/*.js"),
    path.resolve(__dirname, "../controllers/membership/*.js"),
    path.resolve(__dirname, "../controllers/payments/*.js"),
    path.resolve(__dirname, "../controllers/order/*.js"),
    path.resolve(__dirname, "../controllers/cart/*.js"),
    path.resolve(__dirname, "../controllers/notification/*.js"),
    path.resolve(__dirname, "../middlewares/*.js"),
  ],
};
