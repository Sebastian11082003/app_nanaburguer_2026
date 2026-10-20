import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { kitchenJobTitle, toKitchenJobLines } from "./kitchen-print-job.ts";

describe("kitchen reprint job", () => {
  it("uses the full comanda title, not the round delta", () => {
    assert.equal(kitchenJobTitle(), "COMANDA");
    assert.equal(kitchenJobTitle(false), "COMANDA");
    assert.equal(kitchenJobTitle(true), "COMANDA RONDA");
  });

  it("keeps canceled lines so a reprint still shows CANCELADO", () => {
    const lines = toKitchenJobLines([
      { quantity: 1, menuItem: { name: "Burger smoke" } },
      {
        quantity: 2,
        menuItem: { name: "Papas" },
        canceledAt: "2026-10-20T12:00:00.000Z",
        notes: "sin salsa",
      },
    ]);
    assert.deepEqual(lines, [
      { qty: 1, name: "Burger smoke", notes: undefined, canceled: false },
      { qty: 2, name: "Papas", notes: "sin salsa", canceled: true },
    ]);
  });
});
