import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../../../i18n/index.js";
import { formatAppDate } from "../../../i18n/formatters.js";
import {
  applyAdminNotificationsLocalization,
  formatAdminNotificationMetaLabel,
  getAdminNotificationTypeLabel,
  getAdminNotificationsLabels,
  localizeAdminNotificationBody,
  localizeAdminNotificationTitle,
} from "./adminNotificationsLocalization.js";
import { mapAdminNotifications, resolveAdminNotificationRoute } from "./adminNotificationsMappers.js";
import {
  getNotificationTypeLabel,
} from "../../specialist-dashboard/utils/specialistNotificationsLocalization.js";
import {
  applyAdminProfileLocalization,
  formatAdminProfileCreatedDate,
  getAdminProfilePageLabels,
  getAdminProfileRoleLabel,
  getAdminProfileValidationMessages,
  localizeProfileValidationErrors,
} from "./adminProfileLocalization.js";

describe("adminPhaseA6Localization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("resolves notifications page labels in EN and AR", () => {
    const en = getAdminNotificationsLabels(translateEn);
    const ar = getAdminNotificationsLabels(translateAr);

    assert.equal(en.title, "Notifications");
    assert.equal(ar.title, "الإشعارات");
    assert.equal(en.markAllRead, "Mark all as read");
    assert.equal(ar.markAllRead, "تعليم الكل كمقروء");
  });

  it("localizes known notification type labels while preserving raw type", () => {
    assert.equal(getAdminNotificationTypeLabel("complaint_submitted", translateEn), "Complaint submitted");
    assert.equal(getAdminNotificationTypeLabel("complaint_submitted", translateAr), "تم تقديم شكوى");
    assert.equal(
      getAdminNotificationTypeLabel("support_request_reply", translateEn),
      getNotificationTypeLabel("support_request_reply", translateEn),
    );
    assert.equal(getAdminNotificationTypeLabel("complaint_submitted"), "Complaint submitted");
  });

  it("localizes known admin system notification titles and bodies in EN and AR", () => {
    const titleEn = localizeAdminNotificationTitle("New specialist complaint submitted", "complaint_submitted", translateEn);
    const titleAr = localizeAdminNotificationTitle("New specialist complaint submitted", "complaint_submitted", translateAr);
    const bodyEn = localizeAdminNotificationBody(
      "A parent submitted a specialist complaint for administration review.",
      "complaint_submitted",
      translateEn,
    );
    const bodyAr = localizeAdminNotificationBody(
      "A parent submitted a specialist complaint for administration review.",
      "complaint_submitted",
      translateAr,
    );

    assert.notEqual(titleEn, titleAr);
    assert.notEqual(bodyEn, bodyAr);
    assert.match(titleEn, /complaint/i);
    assert.match(bodyEn, /administration review/i);
  });

  it("preserves interpolated names in localized system notification text", () => {
    const title = localizeAdminNotificationTitle(
      "New message from Dr. Samira Noor",
      "new_message",
      translateAr,
    );

    assert.match(title, /Dr\. Samira Noor/);
    assert.notEqual(title, "New message from Dr. Samira Noor");
  });

  it("leaves unknown backend notification text unchanged", () => {
    const unknownTitle = "Custom backend alert for ops team";
    const unknownBody = "Manual escalation required for ticket #9912.";

    assert.equal(localizeAdminNotificationTitle(unknownTitle, "general", translateAr), unknownTitle);
    assert.equal(localizeAdminNotificationBody(unknownBody, "general", translateAr), unknownBody);
  });

  it("formats notification meta labels using active locale", () => {
    const notification = {
      type: "support_request_submitted",
      createdAt: new Date("2026-02-10T09:00:00.000Z"),
    };

    const enMeta = formatAdminNotificationMetaLabel(notification, { t: translateEn, locale: "en" });
    const arMeta = formatAdminNotificationMetaLabel(notification, { t: translateAr, locale: "ar" });
    const expectedDate = formatAppDate(notification.createdAt, "en");

    assert.ok(enMeta.includes(expectedDate));
    assert.notEqual(enMeta, arMeta);
  });

  it("preserves notification ordering and deep-link route values", () => {
    const rows = [
      {
        id: "n-2",
        type: "complaint_submitted",
        title: "New specialist complaint submitted",
        created_at: "2026-02-11T09:00:00.000Z",
        related_entity_type: "complaint",
        related_entity_id: "complaint-1",
      },
      {
        id: "n-1",
        type: "support_request_submitted",
        title: "New specialist support request",
        created_at: "2026-02-10T09:00:00.000Z",
        related_entity_type: "support_request",
        related_entity_id: "support-1",
      },
    ];

    const mapped = mapAdminNotifications(rows);
    const localized = applyAdminNotificationsLocalization(mapped, { t: translateAr, locale: "ar" });

    assert.deepEqual(localized.map((item) => item.id), ["n-2", "n-1"]);
    assert.equal(localized[0].type, "complaint_submitted");
    assert.equal(
      resolveAdminNotificationRoute(localized[0], {
        buildComplaintDetailPath: (id) => `/complaints/${id}`,
      }),
      "/complaints/complaint-1",
    );
    assert.equal(localized[0].relatedEntityId, "complaint-1");
  });

  it("resolves profile page labels and role label in EN and AR", () => {
    const en = getAdminProfilePageLabels(translateEn);
    const ar = getAdminProfilePageLabels(translateAr);

    assert.equal(en.title, "Profile");
    assert.equal(ar.editTitle, "تعديل الملف الشخصي");
    assert.equal(getAdminProfileRoleLabel("admin", translateEn), translateEn("roles.admin"));
    assert.equal(getAdminProfileRoleLabel("admin", translateAr), translateAr("roles.admin"));
  });

  it("preserves profile values and form prefill while localizing chrome", () => {
    const profile = applyAdminProfileLocalization({
      userId: "admin-1",
      fullName: "Admin One",
      email: "admin.one@example.com",
      phone: "+966501234567",
      role: "admin",
      isEmailVerified: true,
      createdAt: "2026-01-15T10:00:00.000Z",
      initials: "AO",
    }, { t: translateAr, locale: "ar" });

    const formValues = {
      fullName: profile.fullName,
      phone: profile.phone ?? "",
    };

    assert.equal(profile.fullName, "Admin One");
    assert.equal(profile.email, "admin.one@example.com");
    assert.equal(profile.phone, "+966501234567");
    assert.equal(profile.role, "admin");
    assert.equal(formValues.fullName, "Admin One");
    assert.equal(formValues.phone, "+966501234567");
    assert.notEqual(profile.roleLabel, "admin");
  });

  it("localizes profile validation messages in EN and AR", () => {
    const en = getAdminProfileValidationMessages(translateEn);
    const ar = getAdminProfileValidationMessages(translateAr);
    const localized = localizeProfileValidationErrors({ fullName: "Full name is required." }, translateAr);

    assert.equal(en.fullNameRequired, "Full name is required.");
    assert.equal(ar.fullNameRequired, "الاسم الكامل مطلوب.");
    assert.equal(localized.fullName, ar.fullNameRequired);
  });

  it("formats profile created date using active locale when present", () => {
    const value = "2026-01-15T10:00:00.000Z";
    const enLabel = formatAdminProfileCreatedDate(value, { t: translateEn, locale: "en" });
    const arLabel = formatAdminProfileCreatedDate(value, { t: translateAr, locale: "ar" });

    assert.equal(enLabel, formatAppDate(new Date(value), "en"));
    assert.equal(arLabel, formatAppDate(new Date(value), "ar"));
  });

  it("falls back to English labels when translator is unavailable", () => {
    assert.equal(getAdminNotificationsLabels(null).title, "Notifications");
    assert.equal(getAdminProfilePageLabels(null).saveChanges, "Save Changes");
  });
});
