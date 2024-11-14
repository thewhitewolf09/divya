import { fileURLToPath } from 'url';
import path from 'path';

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
        url: "https://sumitnirmal.netlify.app", // Add your contact URL if applicable
        email: "sumitramprakashnirmal@gmail.com", // Provide an email if available
      },
    },
    servers: [
      { url: "https://divya-blond.vercel.app/" },
      {
        url: "http://localhost:8080/", 
      },
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
  ],
  apis: [
    path.join(__dirname, '/src/routes/*.js'), // API route definitions
    path.join(__dirname, '/src/models/*.js'), // Model definitions
    path.join(__dirname, '/src/controllers/user/*.js'), // User-related controllers
    path.join(__dirname, '/src/controllers/user/auth/*.js'), // User authentication controllers
    path.join(__dirname, '/src/controllers/customer/*.js'), // Customer-related controllers
    path.join(__dirname, '/src/controllers/product/*.js'), // Product-related controllers
    path.join(__dirname, '/src/controllers/sales/*.js'), // Sales-related controllers
    path.join(__dirname, '/src/controllers/membership/*.js'), // Membership-related controllers
    path.join(__dirname, '/src/controllers/payments/*.js'), // Payment-related controllers
    path.join(__dirname, '/src/controllers/order/*.js'), // Order-related controllers
    path.join(__dirname, '/src/controllers/cart/*.js'), // Cart-related controllers
    path.join(__dirname, '/src/middlewares/*.js'), // Middleware if you want to document it
  ],
};
