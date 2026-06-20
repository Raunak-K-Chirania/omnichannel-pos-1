import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import "express-async-errors";

import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import orderRoutes from "./routes/orderRoutes";
import userRoutes from "./routes/userRoutes";
import storeRoutes from "./routes/storeRoutes";

// For testing in swagger UI and Postman, we need to allow CORS from all origins. In production, you should restrict this to your frontend domain.
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

import { errorHandler, notFound } from "./middleware/errorMiddleware";

const app = express();


// Middlewares
app.use(cors());

app.use(express.json());

app.use(morgan("dev"));

// Static files directory for product image uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Omnichannel POS Backend is running",
  });
});


// Prevent favicon 404 error
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// Swagger API Docs Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// API Routes
app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/users", userRoutes);

app.use("/api/stores", storeRoutes);



// 404 Middleware
app.use(notFound);


// Global Error Handler
app.use(errorHandler);


export default app;