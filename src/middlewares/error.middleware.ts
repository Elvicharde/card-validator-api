import type { ErrorRequestHandler } from "express";

import HTTPError from "../lib/http-error.js";
import { HTTP_STATUS_CODES } from "../lib/http-status-codes.js";

const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HTTPError) {
    res.status(err.statusCode).json({
      status: "error",
      statusCode: err.statusCode,
      message: err.message,
    });

    return;
  }

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    status: "error",
    statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    message: "Internal Server Error",
  });
};

export default errorMiddleware;
