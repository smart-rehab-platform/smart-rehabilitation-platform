import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator } from "../../../i18n/index.js";
import { getRoleDisplayLabel } from "./profileDisplayUtils.js";

describe("getRoleDisplayLabel", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("localizes known roles in English and Arabic", () => {
    assert.equal(getRoleDisplayLabel("admin", translateEn), "Admin");
    assert.equal(getRoleDisplayLabel("specialist", translateEn), "Specialist");
    assert.equal(getRoleDisplayLabel("parent", translateEn), "Parent");

    assert.equal(getRoleDisplayLabel("admin", translateAr), "المسؤول");
    assert.equal(getRoleDisplayLabel("specialist", translateAr), "الأخصائي");
    assert.equal(getRoleDisplayLabel("parent", translateAr), "ولي الأمر");
  });

  it("falls back to the raw role or user label", () => {
    assert.equal(getRoleDisplayLabel("Coordinator", translateEn), "Coordinator");
    assert.equal(getRoleDisplayLabel("", translateEn), "User");
  });
});
