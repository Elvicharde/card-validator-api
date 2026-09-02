import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../../src/app.js";

describe("Integration | POST /api/v1/card-validations", () => {
  it("returns 200 and isValid true for a valid card number", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: "4111111111111111",
    });

    assert.equal(response.status, 200);

    assert.deepEqual(response.body, {
      status: "success",
      message: "Card validation successful",
      data: {
        isValid: true,
      },
    });
  });

  it("returns 200 and isValid false for an invalid checksum", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: "4111111111111112",
    });

    assert.equal(response.status, 200);

    assert.deepEqual(response.body, {
      status: "success",
      message: "Card validation successful",
      data: {
        isValid: false,
      },
    });
  });

  it("returns 400 when cardNumber is missing", async () => {
    const response = await request(app)
      .post("/api/v1/card-validations")
      .send({});

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "cardNumber is required");
  });

  it("returns 400 when cardNumber is null", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: null,
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "cardNumber is required");
  });

  it("returns 400 when cardNumber is not a string", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: 4111111111111111,
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "cardNumber must be a string");
  });

  it("returns 400 when cardNumber is an empty string", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: "",
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "cardNumber is required");
  });

  it("returns 400 when cardNumber contains only whitespace", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: "   ",
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "cardNumber is required");
  });

  it("returns 400 when cardNumber contains spaces", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: "4111 1111 1111 1111",
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "cardNumber must contain only digits");
  });

  it("returns 400 when cardNumber contains hyphens", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: "4111-1111-1111-1111",
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "cardNumber must contain only digits");
  });

  it("returns 400 when cardNumber contains letters", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: "4111abcd11111111",
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "cardNumber must contain only digits");
  });

  it("returns 400 when cardNumber contains special characters", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: "41111111@1111111",
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "cardNumber must contain only digits");
  });

  it("returns 400 when cardNumber is shorter than 10 digits", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: "123456789",
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(
      response.body.message,
      "cardNumber must contain between 10 and 19 digits",
    );
  });

  it("returns 400 when cardNumber is longer than 19 digits", async () => {
    const response = await request(app).post("/api/v1/card-validations").send({
      cardNumber: "12345678901234567890",
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(
      response.body.message,
      "cardNumber must contain between 10 and 19 digits",
    );
  });

  it("returns 400 for an invalid JSON request body", async () => {
    const response = await request(app)
      .post("/api/v1/card-validations")
      .set("Content-Type", "application/json")
      .send('{"cardNumber":"4111111111111111"');

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(response.body.message, "Invalid JSON request body");
  });
});

describe("Integration | Application Routes", () => {
  it("returns 404 for an unknown route", async () => {
    const response = await request(app).get("/api/v1/non-existent-route");

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, {
      status: "error",
      message: "Route GET /api/v1/non-existent-route not found",
    });
  });

  it("returns 404 when an unsupported HTTP method is used", async () => {
    const response = await request(app).get("/api/v1/card-validations");

    assert.equal(response.status, 404);

    assert.deepEqual(response.body, {
      status: "error",
      message: "Route GET /api/v1/card-validations not found",
    });
  });
});
