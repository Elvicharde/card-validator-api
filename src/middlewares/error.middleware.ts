import type { ErrorRequestHandler, Response } from "express";
import type { CardValidationApiResponse } from "../types/card-validation.types.js";

import HTTPError from "../lib/http-error.js";
import { HTTP_STATUS_CODES } from "../lib/http-status-codes.js";

const errorMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res: Response<CardValidationApiResponse>,
  _next,
) => {
  if (err instanceof HTTPError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });

    return;
  }

  // handle invalid JSON request body error from express.json() middleware
  if (err instanceof SyntaxError && "status" in err && err.status === 400) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      status: "error",
      message: "Invalid JSON request body",
    });

    return;
  }

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: "Internal Server Error",
  });
};

export default errorMiddleware;
