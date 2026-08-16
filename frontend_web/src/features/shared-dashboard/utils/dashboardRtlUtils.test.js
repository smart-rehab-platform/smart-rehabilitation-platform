import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getMobileSidebarHiddenTransform,
  getSidebarCollapseIconName,
} from "./dashboardRtlUtils.js";

describe("dashboardRtlUtils", () => {
  it("returns opposite mobile slide transforms for RTL", () => {
    assert.equal(getMobileSidebarHiddenTransform(false), "translateX(-105%)");
    assert.equal(getMobileSidebarHiddenTransform(true), "translateX(105%)");
  });

  it("selects right-panel collapse icons in RTL", () => {
    assert.equal(getSidebarCollapseIconName(false, false), "PanelLeftClose");
    assert.equal(getSidebarCollapseIconName(false, true), "PanelLeftOpen");
    assert.equal(getSidebarCollapseIconName(true, false), "PanelRightClose");
    assert.equal(getSidebarCollapseIconName(true, true), "PanelRightOpen");
  });
});
