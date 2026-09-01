import express from "express";
import morgan from "morgan";
import cardRouter from "./card-validation.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { HTTP_STATUS_CODES } from "./lib/http-status-codes.js";

const app = express();

// middlewares
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/card", cardRouter);

// handle 404 errors
app.use((req, res) => {
  res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
    status: "error",
    statusCode: HTTP_STATUS_CODES.NOT_FOUND,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// error handling middleware
app.use(errorMiddleware);

export default app;
