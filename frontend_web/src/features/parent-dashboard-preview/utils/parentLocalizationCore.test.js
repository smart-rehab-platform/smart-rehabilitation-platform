import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator } from "../../../i18n/index.js";
import {
  formatParentDate,
  formatParentLongDate,
  formatRelativeSessionDate,
  formatTimeAgo,
  translateKey,
} from "./parentLocalizationCore.js";

describe("parentLocalizationCore", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("formats dates with locale-aware output", () => {
    const value = "2026-03-15T10:00:00.000Z";
    const enDate = formatParentDate(value, "en", translateEn);
    const arDate = formatParentDate(value, "ar", translateAr);

    assert.match(enDate, /2026/);
    assert.match(arDate, /2026/);
    assert.notEqual(enDate, arDate);
  });

  it("formats relative session and time-ago labels", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    assert.equal(formatRelativeSessionDate(tomorrow, "en", translateEn).dateLabel, "Tomorrow");
    assert.equal(formatRelativeSessionDate(tomorrow, "ar", translateAr).dateLabel, "غداً");

    const recent = new Date(Date.now() - 5 * 60 * 1000);
    assert.match(formatTimeAgo(recent, "en", translateEn), /5m ago/);
  });

  it("falls back when translation keys are missing", () => {
    assert.equal(translateKey(null, "parent.common.today", "Today"), "Today");
    assert.equal(formatParentLongDate("invalid-date", "en", translateEn), "Date unavailable");
  });
});
