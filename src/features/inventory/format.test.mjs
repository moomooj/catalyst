import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatCurrencyFromCents,
  formatOrderPriceLabel,
  normalizeDecimalInput,
  parseCurrencyToCents,
} from "./format.ts";

describe("inventory format helpers", () => {
  it("parses pre-tax currency values into cents", () => {
    assert.equal(parseCurrencyToCents("24.99"), 2499);
    assert.equal(parseCurrencyToCents("$1,350.00"), 135000);
    assert.equal(parseCurrencyToCents("12.999"), null);
    assert.equal(parseCurrencyToCents("-4.00"), null);
  });

  it("normalizes decimal quantities without losing fractional stock", () => {
    assert.equal(normalizeDecimalInput("20.50"), "20.5");
    assert.equal(normalizeDecimalInput("500.00"), "500");
    assert.equal(normalizeDecimalInput("0.25"), "0.25");
    assert.equal(normalizeDecimalInput("abc"), null);
  });

  it("formats purchase price labels for the whole minimum order quantity", () => {
    assert.equal(formatCurrencyFromCents(2499), "$24.99");
    assert.equal(formatOrderPriceLabel(2499, "500", "piece"), "$24.99 / 500 piece");
  });
});
