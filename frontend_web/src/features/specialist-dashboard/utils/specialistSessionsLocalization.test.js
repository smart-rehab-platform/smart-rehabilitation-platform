import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import { formatAppDate } from "../../../i18n/formatters.js";
import {
  applySessionListItemLocalization,
  buildSessionListFilterOptions,
  formatSessionCalendarDayHeading,
  formatSessionCalendarMonthYear,
  formatSessionDurationLabel,
  getCalendarNextMonthLabel,
  getCalendarPreviousMonthLabel,
  getSessionCalendarWeekdayLabels,
  getSessionDisplayStatusMeta,
  getSessionListFilterLabel,
  getSessionRequestReasonLabel,
  resolveScheduleSessionFieldErrors,
} from "./specialistSessionsLocalization.js";
import { SCHEDULE_SESSION_VALIDATION_KEYS } from "./specialistScheduleSessionMappers.js";
import { validateScheduleSessionForm } from "./specialistScheduleSessionMappers.js";

function buildMonthGrid(monthDate) {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const gridStart = new Date(monthStart);
  const weekday = gridStart.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  gridStart.setDate(gridStart.getDate() + diff);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function tFactory(locale) {
  const messages = locale === "ar" ? ar : en;
  return (key, params) => {
    const parts = key.split(".");
    let value = messages;
    for (const part of parts) {
      value = value?.[part];
    }
    if (typeof value !== "string") {
      return key;
    }
    return Object.entries(params || {}).reduce(
      (result, [name, paramValue]) => result.replace(`{${name}}`, String(paramValue)),
      value,
    );
  };
}

describe("specialistSessionsLocalization", () => {
  it("maps session page labels in EN/AR", () => {
    assert.equal(tFactory("en")("specialist.sessions.title"), "Sessions");
    assert.equal(tFactory("ar")("specialist.sessions.title"), "الجلسات");
    assert.equal(tFactory("en")("specialist.sessions.scheduleSession"), "Schedule Session");
    assert.equal(tFactory("ar")("specialist.sessions.scheduleSession"), "جدولة جلسة");
  });

  it("maps all session statuses in EN/AR while preserving raw values", () => {
    for (const status of ["scheduled", "completed", "cancelled", "no_show"]) {
      const enMeta = getSessionDisplayStatusMeta(status, tFactory("en"));
      const arMeta = getSessionDisplayStatusMeta(status, tFactory("ar"));
      assert.equal(enMeta.id, status);
      assert.equal(arMeta.id, status);
      assert.notEqual(enMeta.label, arMeta.label);
    }
  });

  it("maps weekday labels in EN/AR without changing grid order", () => {
    const enWeekdays = getSessionCalendarWeekdayLabels("en");
    const arWeekdays = getSessionCalendarWeekdayLabels("ar");
    assert.equal(enWeekdays.length, 7);
    assert.equal(arWeekdays.length, 7);

    const march = startOfMonth(new Date(2026, 2, 15));
    const grid = buildMonthGrid(march);
    assert.equal(grid[0].getDay(), 1);
    assert.equal(grid[6].getDay(), 0);
  });

  it("formats month and day headings using locale", () => {
    const date = new Date(2026, 2, 15);
    const enMonth = formatSessionCalendarMonthYear(date, "en");
    const arMonth = formatSessionCalendarMonthYear(date, "ar");
    assert.match(enMonth, /March|2026/);
    assert.notEqual(enMonth, arMonth);

    const enDay = formatSessionCalendarDayHeading(date, "en", tFactory("en"));
    const arDay = formatSessionCalendarDayHeading(date, "ar", tFactory("ar"));
    assert.match(enDay, /15/);
    assert.notEqual(enDay, arDay);
  });

  it("preserves previous/next temporal semantics via direction values", () => {
    const month = startOfMonth(new Date(2026, 2, 1));
    const previous = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);

    assert.equal(previous.getMonth(), 1);
    assert.equal(next.getMonth(), 3);
    assert.equal(getCalendarPreviousMonthLabel(tFactory("ar")), "الشهر السابق");
    assert.equal(getCalendarNextMonthLabel(tFactory("ar")), "الشهر التالي");
  });

  it("localizes session duration UI without changing numeric value", () => {
    assert.equal(formatSessionDurationLabel(30, tFactory("en")), "30 min");
    assert.equal(formatSessionDurationLabel(30, tFactory("ar")), "30 د");
  });

  it("preserves patient, location, and notes content", () => {
    const session = applySessionListItemLocalization({
      id: "session-1",
      patientName: "Omar Ali",
      sessionType: "Therapy Session",
      status: "scheduled",
      scheduledAt: new Date("2026-03-20T09:00:00.000Z"),
      physicalLocation: "Al Amal Center - Room 3",
      locationOrLink: "Al Amal Center - Room 3",
    }, { t: tFactory("ar"), locale: "ar" });

    assert.equal(session.patientName, "Omar Ali");
    assert.equal(session.physicalLocation, "Al Amal Center - Room 3");
    assert.equal(session.status, "scheduled");
    assert.equal(session.dateLabel, formatAppDate(session.scheduledAt, "ar"));
  });

  it("maps session list filters in EN/AR", () => {
    const filters = buildSessionListFilterOptions(tFactory("ar"));
    assert.equal(filters.find((item) => item.id === "today")?.label, "اليوم");
    assert.equal(getSessionListFilterLabel("upcoming", tFactory("en")), "Upcoming");
  });

  it("maps request reason labels and keeps custom other text unchanged", () => {
    assert.equal(
      getSessionRequestReasonLabel({ reason: "consultation" }, tFactory("ar")),
      "استشارة",
    );
    assert.equal(
      getSessionRequestReasonLabel({
        reason: "other",
        reasonOtherText: "Need weekend slot",
      }, tFactory("ar")),
      "Need weekend slot",
    );
  });

  it("localizes schedule validation messages in EN/AR", () => {
    const result = validateScheduleSessionForm({
      title: "",
      patientId: "",
      dateValue: "2020-01-01",
      timeValue: "09:00",
      durationValue: "0",
    });

    const localized = resolveScheduleSessionFieldErrors(result.errors, tFactory("ar"));
    assert.equal(result.errors.title, SCHEDULE_SESSION_VALIDATION_KEYS.TITLE_REQUIRED);
    assert.equal(localized.title, "أدخل نوع الجلسة أو العنوان.");
    assert.equal(localized.patientId, "اختر مريضاً معيّناً.");
  });

  it("uses English fallback for unknown session status display", () => {
    const meta = getSessionDisplayStatusMeta("custom_status", tFactory("en"));
    assert.equal(meta.id, "custom_status");
    assert.equal(meta.label, "custom status");
  });
});
