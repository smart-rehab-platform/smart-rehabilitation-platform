import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import { formatAppDate } from "../../../i18n/formatters.js";
import {
  applySpecialistConversationLocalization,
  buildLocalizedMessageThreadItems,
  formatSpecialistMessageTime,
  formatSpecialistPresenceLabel,
  getSpecialistMessageAttachmentLabels,
  getSpecialistMessagesPageLabels,
  localizeSpecialistMessageContent,
} from "./specialistMessagesLocalization.js";

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

describe("specialistMessagesLocalization", () => {
  it("maps messages page labels in EN/AR", () => {
    assert.equal(getSpecialistMessagesPageLabels(tFactory("en")).title, "Messages");
    assert.equal(getSpecialistMessagesPageLabels(tFactory("ar")).title, "الرسائل");
    assert.equal(getSpecialistMessagesPageLabels(tFactory("ar")).send, undefined);
    assert.equal(tFactory("ar")("specialist.messages.composer.send"), "إرسال");
  });

  it("maps attachment labels in EN/AR", () => {
    const enLabels = getSpecialistMessageAttachmentLabels(tFactory("en"));
    const arLabels = getSpecialistMessageAttachmentLabels(tFactory("ar"));
    assert.equal(enLabels.pdfDocument, "PDF document");
    assert.equal(arLabels.pdfDocument, "مستند PDF");
  });

  it("preserves message content and participant names", () => {
    const raw = "Hello from the parent side";
    assert.equal(localizeSpecialistMessageContent(raw, tFactory("ar")), raw);
    const conversation = applySpecialistConversationLocalization({
      id: "c1",
      parentName: "Sara Hassan",
      patientName: "Omar Ali",
      subtitleContext: { kind: "patient", name: "Omar Ali" },
      createdAt: "2026-03-01T10:00:00.000Z",
    }, { t: tFactory("ar"), locale: "ar" });
    assert.equal(conversation.parentName, "Sara Hassan");
    assert.equal(conversation.title, "Sara Hassan");
    assert.match(conversation.subtitle, /Omar Ali/);
  });

  it("maps presence labels in EN/AR", () => {
    assert.equal(
      formatSpecialistPresenceLabel({ is_online: true }, "en", tFactory("en")),
      "Online",
    );
    assert.equal(
      formatSpecialistPresenceLabel({ is_online: true }, "ar", tFactory("ar")),
      "متصل",
    );
  });

  it("localizes known system attachment preview strings", () => {
    assert.equal(
      localizeSpecialistMessageContent("Sent an image", tFactory("ar")),
      "أرسل صورة",
    );
    assert.equal(
      localizeSpecialistMessageContent("Sent a PDF file", tFactory("ar")),
      "أرسل ملف PDF",
    );
  });

  it("leaves unknown user message content unchanged", () => {
    const custom = "Can we reschedule tomorrow?";
    assert.equal(localizeSpecialistMessageContent(custom, tFactory("ar")), custom);
  });

  it("formats timestamps using active locale", () => {
    const sentAt = "2026-03-15T14:30:00.000Z";
    const enTime = formatSpecialistMessageTime(sentAt, "en", tFactory("en"));
    const arTime = formatSpecialistMessageTime(sentAt, "ar", tFactory("ar"));
    assert.match(enTime, /\d/);
    assert.match(arTime, /\d/);
    assert.notEqual(enTime, arTime);
  });

  it("builds localized thread items with day separators", () => {
    const items = buildLocalizedMessageThreadItems([
      { id: "m1", content: "Hi", sentAt: "2026-03-15T10:00:00.000Z", senderId: "u1" },
    ], { t: tFactory("ar"), locale: "ar" });
    assert.equal(items.length, 2);
    assert.equal(items[0].type, "separator");
    assert.equal(items[1].message.timeLabel.length > 0, true);
  });

  it("falls back to English labels when translation key is missing", () => {
    const brokenT = () => "specialist.messages.title";
    assert.equal(getSpecialistMessagesPageLabels(brokenT).title, "Messages");
  });
});

describe("specialistMessagesLocalization dates", () => {
  it("uses formatAppDate for started labels", () => {
    const conversation = applySpecialistConversationLocalization({
      id: "c1",
      parentName: "Parent One",
      createdAt: "2026-03-15T10:00:00.000Z",
    }, { t: tFactory("en"), locale: "en" });
    const formatted = formatAppDate(new Date("2026-03-15T10:00:00.000Z"), "en");
    assert.match(conversation.startedLabel, new RegExp(formatted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});
