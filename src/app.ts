import express from "express";
import type { Request, Response } from "express";
import morgan from "morgan";
import cardRouter from "./card-validation.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { HTTP_STATUS_CODES } from "./lib/http-status-codes.js";
import { ApiErrorResponse } from "./types/card-validation.types.js";

const API_BASE_PATH = "/api/v1";
const app = express();

// middlewares
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use(`${API_BASE_PATH}/card-validations`, cardRouter);

// handle 404 errors
app.use((req: Request, res: Response<ApiErrorResponse>) => {
  res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
    status: "error",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// error handling middleware
app.use(errorMiddleware);

export default app;
