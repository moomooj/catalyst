import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { filterInventoryItems } from "./search.ts";

const items = [
  {
    categoryId: 1,
    name: "Tequila Blanco",
    categoryName: "Alcohol",
    unitName: "bottle",
    supplierName: "Legacy Liquor",
  },
  {
    categoryId: 2,
    name: "Lime Juice",
    categoryName: "Mixer",
    unitName: "liter",
    supplierName: "Produce Market",
  },
];

describe("inventory search", () => {
  it("returns every item when the query is empty", () => {
    assert.equal(filterInventoryItems(items, "").length, 2);
    assert.equal(filterInventoryItems(items, "   ").length, 2);
  });

  it("matches item, category, unit, and supplier text", () => {
    assert.deepEqual(filterInventoryItems(items, "tequila").map((item) => item.name), ["Tequila Blanco"]);
    assert.deepEqual(filterInventoryItems(items, "mixer").map((item) => item.name), ["Lime Juice"]);
    assert.deepEqual(filterInventoryItems(items, "bottle").map((item) => item.name), ["Tequila Blanco"]);
    assert.deepEqual(filterInventoryItems(items, "legacy").map((item) => item.name), ["Tequila Blanco"]);
  });

  it("filters by category while preserving search matching", () => {
    assert.deepEqual(filterInventoryItems(items, "", 2).map((item) => item.name), ["Lime Juice"]);
    assert.deepEqual(filterInventoryItems(items, "liquor", 2).map((item) => item.name), []);
  });
});
