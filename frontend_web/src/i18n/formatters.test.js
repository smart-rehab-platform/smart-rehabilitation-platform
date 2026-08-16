import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatAppDate, formatAppDateTime } from "./formatters.js";

describe("formatAppDateTime", () => {
  it("formats dates using the English locale", () => {
    const formatted = formatAppDateTime("2026-03-15T14:30:00.000Z", "en");

    assert.match(formatted, /2026/);
    assert.match(formatted, /Mar|March/i);
  });

  it("formats dates using the Arabic locale", () => {
    const formatted = formatAppDateTime("2026-03-15T14:30:00.000Z", "ar");

    assert.ok(formatted);
    assert.notEqual(formatted, formatAppDateTime("2026-03-15T14:30:00.000Z", "en"));
  });

  it("returns null for invalid values", () => {
    assert.equal(formatAppDateTime("not-a-date", "en"), null);
    assert.equal(formatAppDate(undefined, "en"), null);
  });
});
