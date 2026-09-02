import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateCardNumber } from "../../src/card-validation.service.js";
import HTTPError from "../../src/lib/http-error.js";
import { HTTP_STATUS_CODES } from "../../src/lib/http-status-codes.js";

describe("Unit | validateCardNumber", () => {
  it("throws an error when cardNumber is missing", () => {
    assert.throws(
      () => validateCardNumber(undefined),
      (error: unknown) => {
        assert.ok(error instanceof HTTPError);
        assert.equal(error.statusCode, HTTP_STATUS_CODES.BAD_REQUEST);
        assert.equal(error.message, "cardNumber is required");

        return true;
      },
    );
  });

  it("throws an error when cardNumber is null", () => {
    assert.throws(
      () => validateCardNumber(null),
      (error: unknown) => {
        assert.ok(error instanceof HTTPError);
        assert.equal(error.statusCode, HTTP_STATUS_CODES.BAD_REQUEST);
        assert.equal(error.message, "cardNumber is required");

        return true;
      },
    );
  });

  it("throws an error when cardNumber is not a string", () => {
    assert.throws(
      () => validateCardNumber(4111111111111111),
      (error: unknown) => {
        assert.ok(error instanceof HTTPError);
        assert.equal(error.statusCode, HTTP_STATUS_CODES.BAD_REQUEST);
        assert.equal(error.message, "cardNumber must be a string");

        return true;
      },
    );
  });

  it("throws an error when cardNumber is empty", () => {
    assert.throws(
      () => validateCardNumber(""),
      (error: unknown) => {
        assert.ok(error instanceof HTTPError);
        assert.equal(error.statusCode, HTTP_STATUS_CODES.BAD_REQUEST);
        assert.equal(error.message, "cardNumber is required");

        return true;
      },
    );
  });

  it("throws an error when cardNumber contains non-digit characters", () => {
    assert.throws(
      () => validateCardNumber("4111-1111-1111-1111"),
      (error: unknown) => {
        assert.ok(error instanceof HTTPError);
        assert.equal(error.statusCode, HTTP_STATUS_CODES.BAD_REQUEST);
        assert.equal(error.message, "cardNumber must contain only digits");

        return true;
      },
    );
  });

  it("throws an error when cardNumber is shorter than 10 digits", () => {
    assert.throws(
      () => validateCardNumber("123456789"),
      (error: unknown) => {
        assert.ok(error instanceof HTTPError);
        assert.equal(error.statusCode, HTTP_STATUS_CODES.BAD_REQUEST);
        assert.equal(
          error.message,
          "cardNumber must contain between 10 and 19 digits",
        );

        return true;
      },
    );
  });

  it("throws an error when cardNumber is longer than 19 digits", () => {
    assert.throws(
      () => validateCardNumber("12345678901234567890"),
      (error: unknown) => {
        assert.ok(error instanceof HTTPError);
        assert.equal(error.statusCode, HTTP_STATUS_CODES.BAD_REQUEST);
        assert.equal(
          error.message,
          "cardNumber must contain between 10 and 19 digits",
        );

        return true;
      },
    );
  });

  it("returns true for a valid card number", () => {
    assert.equal(validateCardNumber("4111111111111111"), true);
  });

  it("returns false for a validly formatted number with an invalid checksum", () => {
    assert.equal(validateCardNumber("4111111111111112"), false);
  });
});
