import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getInventoryPageItems, getInventoryPageCount } from "./pagination.ts";

const items = Array.from({ length: 45 }, (_, index) => ({ id: index + 1 }));

describe("inventory pagination", () => {
  it("calculates page count from item count", () => {
    assert.equal(getInventoryPageCount(0, 20), 1);
    assert.equal(getInventoryPageCount(20, 20), 1);
    assert.equal(getInventoryPageCount(21, 20), 2);
    assert.equal(getInventoryPageCount(45, 20), 3);
  });

  it("returns only the items for the selected page", () => {
    assert.deepEqual(getInventoryPageItems(items, 1, 20).map((item) => item.id), items.slice(0, 20).map((item) => item.id));
    assert.deepEqual(getInventoryPageItems(items, 3, 20).map((item) => item.id), [41, 42, 43, 44, 45]);
  });
});
