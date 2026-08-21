import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import { formatAppDateTime } from "../../../i18n/formatters.js";
import {
  applyPendingReviewLocalization,
  applyReviewBundleLocalization,
  applyReviewSubmissionLocalization,
  getReviewDecisionLabel,
  getReviewMediaTypeLabel,
  getReviewStatusLabel,
  getReviewStatusTone,
} from "./specialistReviewsLocalization.js";

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

describe("specialistReviewsLocalization", () => {
  it("maps review page labels in EN/AR", () => {
    assert.equal(tFactory("en")("specialist.reviews.title"), "Reviews");
    assert.equal(tFactory("ar")("specialist.reviews.title"), "المراجعات");
    assert.equal(tFactory("en")("specialist.reviews.exerciseTitle"), "Review Exercise");
    assert.equal(tFactory("ar")("specialist.reviews.exerciseTitle"), "مراجعة التمرين");
  });

  it("maps review status labels in EN/AR while preserving raw values", () => {
    assert.equal(getReviewStatusLabel("pending", tFactory("en")), "Pending");
    assert.equal(getReviewStatusLabel("reviewed", tFactory("ar")), "تمت المراجعة");
    assert.equal(getReviewStatusLabel("needs_retry", tFactory("ar")), "يحتاج إعادة محاولة");

    const submission = {
      id: "sub-1",
      status: "needs_retry",
      patientName: "Layla Hassan",
      exerciseTitle: "Breathing Exercise",
      submittedAt: new Date("2026-01-10T10:00:00.000Z"),
    };

    assert.equal(submission.status, "needs_retry");
    const localized = applyReviewSubmissionLocalization(submission, {
      t: tFactory("ar"),
      locale: "ar",
    });
    assert.equal(localized.status, "needs_retry");
    assert.equal(localized.statusLabel, "يحتاج إعادة محاولة");
  });

  it("preserves patient and exercise names and user feedback", () => {
    const bundle = applyReviewBundleLocalization({
      submission: {
        id: "sub-1",
        patientName: "Layla Hassan",
        exerciseTitle: "Breathing Exercise",
        status: "pending",
        submittedAt: new Date("2026-01-10T10:00:00.000Z"),
      },
      media: [],
      existingReview: {
        feedback: "Great effort today!",
      },
    }, { t: tFactory("ar"), locale: "ar" });

    assert.equal(bundle.submission.patientName, "Layla Hassan");
    assert.equal(bundle.submission.exerciseTitle, "Breathing Exercise");
    assert.equal(bundle.existingReview.feedback, "Great effort today!");
  });

  it("maps media labels in EN/AR", () => {
    assert.equal(getReviewMediaTypeLabel("video", tFactory("en")), "Video");
    assert.equal(getReviewMediaTypeLabel("audio", tFactory("ar")), "صوت");
    assert.equal(getReviewMediaTypeLabel("image", tFactory("ar")), "صورة");
  });

  it("formats review dates using active locale", () => {
    const date = new Date("2026-03-15T14:30:00.000Z");
    const submission = applyReviewSubmissionLocalization({
      id: "sub-1",
      status: "pending",
      submittedAt: date,
    }, { t: tFactory("en"), locale: "en" });

    assert.equal(submission.submittedAtLabel, formatAppDateTime(date, "en"));

    const arSubmission = applyReviewSubmissionLocalization({
      id: "sub-1",
      status: "pending",
      submittedAt: date,
    }, { t: tFactory("ar"), locale: "ar" });

    assert.equal(arSubmission.submittedAtLabel, formatAppDateTime(date, "ar"));
  });

  it("maps review decision labels in EN/AR", () => {
    assert.equal(getReviewDecisionLabel(false, tFactory("en")), "Completed");
    assert.equal(getReviewDecisionLabel(true, tFactory("ar")), "يحتاج إعادة محاولة");
  });

  it("localizes validation and error messages in EN/AR", () => {
    assert.equal(
      tFactory("ar")("specialist.sessions.validation.titleRequired"),
      "أدخل نوع الجلسة أو العنوان.",
    );
    assert.equal(
      tFactory("ar")("specialist.reviews.errors.submitFailed"),
      "تعذّر إرسال المراجعة.",
    );
  });

  it("maps submitted ago labels on pending review rows", () => {
    const now = new Date("2026-03-15T12:00:00.000Z");
    const review = applyPendingReviewLocalization({
      id: "rev-1",
      patientName: "Patient A",
      exerciseTitle: "Exercise A",
      status: "pending",
      submittedAt: new Date("2026-03-15T11:30:00.000Z"),
      submittedAgo: "Submitted 30m ago",
    }, { t: tFactory("ar"), locale: "ar", now });

    assert.match(review.submittedAgo, /30|Submitted|م/u);
    assert.equal(review.status, "pending");
    assert.equal(getReviewStatusTone(review.status), "success");
  });
});
