import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Weekly Quickly API",
      version: "1.0.0",
      description: "API documentation for the Weekly Quickly App",
    },
    servers: [
      {
        // url: "http://localhost:5000",
        url: "https://weekly-server.onrender.com",
      },
    ],
  },
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    "./dist/routes/*.js",
    "./dist/controllers/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        withCredentials: true,
        persistAuthorization: true,
      },
    }),
  );
}
