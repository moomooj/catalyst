import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isProtectedInventoryOption,
  normalizeInventoryOptionName,
} from "./optionRules.ts";

describe("inventory option rules", () => {
  it("normalizes option names before saving", () => {
    assert.equal(normalizeInventoryOptionName("  dry   goods  "), "dry goods");
    assert.equal(normalizeInventoryOptionName("Bottle"), "Bottle");
    assert.equal(normalizeInventoryOptionName("   "), "");
  });

  it("protects fallback category and unit records from deletion", () => {
    assert.equal(isProtectedInventoryOption("Uncategorized", true), true);
    assert.equal(isProtectedInventoryOption("unit", true), true);
    assert.equal(isProtectedInventoryOption("Alcohol", false), false);
    assert.equal(isProtectedInventoryOption("unit", false), false);
  });
});
