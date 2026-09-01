import type { HTTPStatusCode } from "./http-status-codes.js";

export default class HTTPError extends Error {
  constructor(
    public readonly statusCode: HTTPStatusCode = 500,
    message = "An Error Occurred!",
  ) {
    super(message);
    this.name = "HTTPError";
  }
}
