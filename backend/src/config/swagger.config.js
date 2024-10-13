export default {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Divya-backend",
      version: "1.0.0",
      description:
        "The API documentation of Shop Management App",
      license: {
        name: "ISC",
        url: "https://choosealicense.com/licenses/gpl-3.0/",
      },
      contact: {
        name: "Sumit Nirmal",
      },
    },
    basePath: "/api",
    servers: [
      {
        url: "http://localhost:8080/api/",
      },
    ],
  },
  tags: [
    {
      name: "User",
      description: "API for user data",
    },
    {
      name: "Customer",
      description: "API for customer data",
    },
    {
      name: "Product",
      description: "API for product management",
    },
    {
      name: "Sales",
      description: "API for sales management",
    },
    {
      name: "Membership",
      description: "API for membership management",
    },
  ],
  apis: [
    "src/routes/*.js", // Route definitions
    "src/models/*.js", // Models
    "src/controllers/user/*.js", // User-related controllers
    "src/controllers/user/auth/*.js", // User authentication controllers
    "src/controllers/customer/*.js", // Customer-related controllers
    "src/controllers/product/*.js", // Product-related controllers
    "src/controllers/sales/*.js", // Sales-related controllers
    "src/controllers/membership/*.js", // Membership-related controllers
    "src/middlewares/*.js", // Middleware if you want to document it
  ],
};
