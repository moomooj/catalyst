import assert from "node:assert/strict";
import test from "node:test";

import { formatBookingDateLabel } from "./date.ts";

test("formats stored booking dates as calendar dates instead of local instants", () => {
  const storedDate = new Date("2026-07-04T00:00:00.000Z");

  assert.equal(formatBookingDateLabel(storedDate), "Jul 4, 2026");
});
