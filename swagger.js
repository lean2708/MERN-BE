const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MERN-Ecommerce API",
      version: "1.0.0",
      description: "API documentation for MERN-Ecommerce backend",
    },
    servers: [
      {
        url: process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`,
        description: "Local server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  // quet
  apis: [
    "./routes/*.js",
    "./routes/**/*.js",
    "./controllers/*.js",
    "./controllers/**/*.js"
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
