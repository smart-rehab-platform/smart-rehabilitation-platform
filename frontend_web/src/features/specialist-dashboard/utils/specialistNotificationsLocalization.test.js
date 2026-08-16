import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import {
  applySpecialistNotificationLocalization,
  applySpecialistNotificationsLocalization,
  getNotificationTypeLabel,
  getSpecialistNotificationsPageLabels,
  localizeNotificationBody,
  localizeNotificationTitle,
} from "./specialistNotificationsLocalization.js";
import { sortSpecialistNotificationsNewestFirst as sortRaw } from "./specialistNotificationUtils.js";

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

describe("specialistNotificationsLocalization", () => {
  it("maps notifications page labels in EN/AR", () => {
    assert.equal(getSpecialistNotificationsPageLabels(tFactory("en")).title, "Notifications");
    assert.equal(getSpecialistNotificationsPageLabels(tFactory("ar")).title, "الإشعارات");
    assert.equal(getSpecialistNotificationsPageLabels(tFactory("ar")).markAllRead, "تحديد الكل كمقروء");
    assert.equal(getSpecialistNotificationsPageLabels(tFactory("ar")).refresh, "تحديث");
  });

  it("maps known notification type labels in EN/AR", () => {
    assert.equal(getNotificationTypeLabel("new_message", tFactory("en")), "New message");
    assert.equal(getNotificationTypeLabel("new_message", tFactory("ar")), "رسالة جديدة");
  });

  it("translates known system notification patterns", () => {
    assert.equal(
      localizeNotificationTitle("New message from Dr. Sami", "new_message", tFactory("ar")),
      "رسالة جديدة من Dr. Sami",
    );
    assert.equal(localizeNotificationBody("Sent an image", tFactory("ar")), "أرسل صورة");
  });

  it("keeps interpolated names unchanged in system titles", () => {
    const localized = localizeNotificationTitle("New message from Sara Hassan", "new_message", tFactory("ar"));
    assert.match(localized, /Sara Hassan/);
  });

  it("leaves unknown backend text unchanged", () => {
    const custom = "Custom backend notification copy";
    assert.equal(localizeNotificationTitle(custom, "general", tFactory("ar")), custom);
    assert.equal(localizeNotificationBody(custom, tFactory("ar")), custom);
  });

  it("preserves newest-first ordering when localizing", () => {
    const rows = [
      { id: "1", type: "general", title: "Older", body: "", createdAt: "2026-03-10T10:00:00.000Z", unread: false },
      { id: "2", type: "general", title: "Newer", body: "", createdAt: "2026-03-15T10:00:00.000Z", unread: true },
    ];
    const sorted = sortRaw(rows);
    const localized = applySpecialistNotificationsLocalization(sorted, { t: tFactory("ar"), locale: "ar" });
    assert.equal(localized[0].titleRaw, "Newer");
    assert.equal(localized[1].titleRaw, "Older");
  });

  it("formats notification dates using locale", () => {
    const localized = applySpecialistNotificationLocalization({
      id: "n1",
      type: "report_ready",
      title: "Report ready",
      body: "",
      createdAt: "2026-03-15T10:00:00.000Z",
      unread: true,
    }, { t: tFactory("ar"), locale: "ar" });
    assert.match(localized.displayDate, /\d/);
    assert.equal(localized.typeLabel, "التقرير جاهز");
  });

  it("falls back to English when translation key is missing", () => {
    const brokenT = () => "specialist.notifications.title";
    assert.equal(getSpecialistNotificationsPageLabels(brokenT).title, "Notifications");
  });

  it("does not reverse chronological ordering in utility sort", () => {
    const notifications = [
      { createdAt: "2026-03-01T10:00:00.000Z" },
      { createdAt: "2026-03-03T10:00:00.000Z" },
    ];
    const sorted = sortRaw(notifications);
    assert.equal(sorted[0].createdAt, "2026-03-03T10:00:00.000Z");
  });
});
