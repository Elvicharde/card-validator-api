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
      status: "failure",
      message: err.message,
    });

    return;
  }

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    status: "failure",
    message: "Internal Server Error",
  });
};

export default errorMiddleware;
