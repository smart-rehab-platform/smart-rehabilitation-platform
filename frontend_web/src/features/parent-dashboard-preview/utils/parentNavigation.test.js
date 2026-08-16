import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator } from "../../../i18n/index.js";
import { buildParentNavItems } from "./parentNavigation.js";

describe("buildParentNavItems", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("localizes parent nav labels in English and Arabic", () => {
    const enItems = buildParentNavItems(translateEn);
    const arItems = buildParentNavItems(translateAr);

    assert.equal(enItems.find((item) => item.id === "dashboard")?.label, "Home");
    assert.equal(enItems.find((item) => item.id === "children")?.label, "My Children");
    assert.equal(enItems.find((item) => item.id === "cases")?.label, "Case Requests");
    assert.equal(arItems.find((item) => item.id === "dashboard")?.label, "الرئيسية");
    assert.equal(arItems.find((item) => item.id === "myComplaints")?.label, "شكاواي");
  });

  it("preserves nav ids and order", () => {
    const items = buildParentNavItems(translateEn);

    assert.deepEqual(items.map((item) => item.id), [
      "dashboard",
      "children",
      "cases",
      "exercises",
      "progress",
      "sessions",
      "reports",
      "feedback",
      "reportSpecialist",
      "myComplaints",
      "messages",
      "ai",
      "notifications",
      "profile",
    ]);
  });
});
