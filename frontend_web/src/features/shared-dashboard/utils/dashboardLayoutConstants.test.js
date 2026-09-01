import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DASHBOARD_DRAWER_BREAKPOINT,
  DASHBOARD_NARROW_HEADER_BREAKPOINT,
} from "./dashboardLayoutConstants.js";

describe("dashboardLayoutConstants", () => {
  it("uses tablet drawer cutover before the old 901–1150 squeeze band", () => {
    assert.equal(DASHBOARD_DRAWER_BREAKPOINT, 1100);
    assert.ok(DASHBOARD_DRAWER_BREAKPOINT > 900);
    assert.ok(DASHBOARD_DRAWER_BREAKPOINT <= 1150);
  });

  it("uses a tablet-width narrow header breakpoint for collapsible search", () => {
    assert.equal(DASHBOARD_NARROW_HEADER_BREAKPOINT, 768);
    assert.ok(DASHBOARD_NARROW_HEADER_BREAKPOINT > 480);
    assert.ok(DASHBOARD_NARROW_HEADER_BREAKPOINT < DASHBOARD_DRAWER_BREAKPOINT);
  });
});
