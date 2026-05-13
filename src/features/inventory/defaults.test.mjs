import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldSeedEditableDefaults } from "./defaults.ts";

describe("inventory defaults", () => {
  it("seeds editable defaults only when no records exist", () => {
    assert.equal(shouldSeedEditableDefaults(0), true);
    assert.equal(shouldSeedEditableDefaults(1), false);
    assert.equal(shouldSeedEditableDefaults(5), false);
  });
});
