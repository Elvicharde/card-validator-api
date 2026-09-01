import HTTPError from "./lib/http-error.js";
import { HTTP_STATUS_CODES } from "./lib/http-status-codes.js";
import { isLuhnValid } from "./lib/luhn.js";

export const validateCardNumber = (cardNumber: string): boolean => {
  assertValidCardInput(cardNumber);
  return isLuhnValid(cardNumber);
};

function assertValidCardInput(
  cardNumber: unknown,
): asserts cardNumber is string {
  if (cardNumber === undefined || cardNumber === null) {
    throw new HTTPError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "cardNumber is required",
    );
  }

  if (typeof cardNumber !== "string") {
    throw new HTTPError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "cardNumber must be a string",
    );
  }

  if (cardNumber.trim() === "") {
    throw new HTTPError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "cardNumber is required",
    );
  }

  if (!/^\d+$/.test(cardNumber)) {
    throw new HTTPError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "cardNumber must contain only digits",
    );
  }

  if (cardNumber.length < 2 || cardNumber.length > 19) {
    throw new HTTPError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "cardNumber must contain between 13 and 19 digits",
    );
  }
}
