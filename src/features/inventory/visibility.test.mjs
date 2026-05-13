import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { selectInventoryItemsByDeletedState } from "./visibility.ts";

const items = [
  { name: "Active lime", isActive: true },
  { name: "Deleted syrup", isActive: false },
];

describe("inventory visibility", () => {
  it("selects active items by default", () => {
    assert.deepEqual(selectInventoryItemsByDeletedState(items, false).map((item) => item.name), ["Active lime"]);
  });

  it("selects deleted items for trash view", () => {
    assert.deepEqual(selectInventoryItemsByDeletedState(items, true).map((item) => item.name), ["Deleted syrup"]);
  });

  it("moves restored items back to active view", () => {
    const restoredItems = items.map((item) =>
      item.name === "Deleted syrup" ? { ...item, isActive: true } : item,
    );

    assert.deepEqual(selectInventoryItemsByDeletedState(restoredItems, false).map((item) => item.name), [
      "Active lime",
      "Deleted syrup",
    ]);
    assert.deepEqual(selectInventoryItemsByDeletedState(restoredItems, true), []);
  });
});
