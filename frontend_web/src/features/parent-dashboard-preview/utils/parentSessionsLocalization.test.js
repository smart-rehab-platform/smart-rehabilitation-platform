import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator } from "../../../i18n/index.js";
import {
  SESSION_STATUS_VALUES,
  buildSessionStatusFilterOptions,
  getSessionStatusLabel,
  getSessionRequestStatusLabel,
} from "./parentSessionsLocalization.js";

describe("parentSessionsLocalization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("translates session statuses", () => {
    assert.equal(getSessionStatusLabel("scheduled", translateEn), "Scheduled");
    assert.equal(getSessionStatusLabel("completed", translateAr), "مكتملة");
    assert.equal(getSessionStatusLabel("no_show", translateEn), "No Show");
    assert.equal(getSessionRequestStatusLabel("pending", translateAr), "قيد الانتظار");
  });

  it("includes all session statuses in filter options", () => {
    const options = buildSessionStatusFilterOptions(translateEn);
    const statusIds = options.filter((option) => option.id !== "all").map((option) => option.id);
    assert.deepEqual(statusIds, SESSION_STATUS_VALUES);
  });
});
