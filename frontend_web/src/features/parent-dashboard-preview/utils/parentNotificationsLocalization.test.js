import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator } from "../../../i18n/index.js";
import {
  formatNotificationDisplayDate,
  getNotificationTypeLabel,
  localizeNotificationBody,
  localizeNotificationTitle,
} from "./parentNotificationsLocalization.js";

const translateEn = createTranslator("en");
const translateAr = createTranslator("ar");

describe("parentNotificationsLocalization system text", () => {
  it("localizes new message titles with specialist names", () => {
    assert.equal(
      localizeNotificationTitle("New message from Specialist A", "new_message", translateEn),
      "New message from Specialist A",
    );
    assert.equal(
      localizeNotificationTitle("New message from Specialist A", "new_message", translateAr),
      "رسالة جديدة من Specialist A",
    );
    assert.equal(
      localizeNotificationTitle("New message from a participant", "new_message", translateAr),
      "رسالة جديدة من مشارك",
    );
  });

  it("preserves arbitrary notification titles", () => {
    assert.equal(
      localizeNotificationTitle("Custom admin notice", "general", translateAr),
      "Custom admin notice",
    );
  });

  it("localizes known attachment preview bodies only", () => {
    assert.equal(
      localizeNotificationBody("Sent an image", "new_message", translateAr),
      "أُرسلت صورة",
    );
    assert.equal(
      localizeNotificationBody("Sent an audio recording", "new_message", translateAr),
      "أُرسل تسجيل صوتي",
    );
    assert.equal(
      localizeNotificationBody("Hello from the parent", "new_message", translateAr),
      "Hello from the parent",
    );
  });

  it("translates notification type labels and formats dates with locale", () => {
    assert.equal(getNotificationTypeLabel("new_message", translateAr), "رسالة جديدة");
    assert.match(
      formatNotificationDisplayDate("2026-08-10T12:00:00.000Z", "ar", translateAr),
      /2026/,
    );
  });
});
