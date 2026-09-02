import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isLuhnValid } from "../../src/lib/luhn.js";

describe("Unit | isLuhnValid", () => {
  it("returns true for a valid Luhn number", () => {
    const result = isLuhnValid("4111111111111111");

    assert.equal(result, true);
  });

  it("returns false for an invalid Luhn number", () => {
    const result = isLuhnValid("4111111111111112");

    assert.equal(result, false);
  });

  it("correctly normalizes doubled digits greater than nine", () => {
    const result = isLuhnValid("79927398713");

    assert.equal(result, true);
  });
});
