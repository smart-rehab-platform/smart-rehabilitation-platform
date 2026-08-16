import { formatAppDateTime } from "../../../i18n/formatters.js";
import {
  formatSpecialistSubmittedAgo,
  resolveSpecialistMapperContext,
} from "./specialistDashboardLocalization.js";
import { getPatientReviewStatusLabel } from "./specialistPatientsLocalization.js";

const MEDIA_TYPE_LABEL_KEYS = {
  image: "specialist.reviews.media.type.image",
  video: "specialist.reviews.media.type.video",
  audio: "specialist.reviews.media.type.audio",
  pdf: "specialist.reviews.media.type.pdf",
  file: "specialist.reviews.media.type.file",
};

const EN_MEDIA_TYPE_LABEL = {
  image: "Image",
  audio: "Audio",
  video: "Video",
  pdf: "PDF",
  file: "File",
};

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
      return translated;
    }
  }
  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }
  return fallback;
}

export function getReviewStatusLabel(status, t = null) {
  return getPatientReviewStatusLabel(status, t);
}

export function getReviewStatusTone(status) {
  const normalized = (status || "").trim().toLowerCase();
  if (normalized === "reviewed") {
    return "success";
  }
  if (normalized === "needs_retry") {
    return "warning";
  }
  return "success";
}

export function getReviewDecisionLabel(requiresRetry, t = null) {
  if (requiresRetry) {
    return translateKey(t, "specialist.reviews.decision.needsRetry", "Needs retry");
  }
  return translateKey(t, "specialist.reviews.decision.approved", "Approved");
}

export function getReviewMediaTypeLabel(mediaType, t = null) {
  const normalized = (mediaType || "").trim().toLowerCase();
  const key = MEDIA_TYPE_LABEL_KEYS[normalized];
  if (key) {
    return translateKey(t, key, EN_MEDIA_TYPE_LABEL[normalized]);
  }
  return mediaType || translateKey(t, "specialist.reviews.media.type.file", "File");
}

export function formatReviewSubmittedAtLabel(dateValue, locale = "en", t = null) {
  if (!dateValue) {
    return translateKey(
      t,
      "specialist.dashboard.reviews.submittedRecently",
      "Recently submitted",
    );
  }

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return translateKey(
      t,
      "specialist.dashboard.reviews.submittedRecently",
      "Recently submitted",
    );
  }

  return formatAppDateTime(date, locale)
    ?? translateKey(t, "common.dateUnavailable", "Date unavailable");
}

export function applyPendingReviewLocalization(review, context = {}) {
  if (!review) {
    return review;
  }

  const { t, locale, now } = resolveSpecialistMapperContext(context);

  return {
    ...review,
    submittedAgo: formatSpecialistSubmittedAgo(review.submittedAt, now, { t, locale }),
  };
}

export function applyReviewSubmissionLocalization(submission, context = {}) {
  if (!submission) {
    return submission;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);

  return {
    ...submission,
    statusLabel: getReviewStatusLabel(submission.status, t),
    statusTone: getReviewStatusTone(submission.status),
    submittedAtLabel: formatReviewSubmittedAtLabel(submission.submittedAt, locale, t),
  };
}

export function applyReviewMediaLocalization(mediaItem, context = {}) {
  if (!mediaItem) {
    return mediaItem;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);

  return {
    ...mediaItem,
    mediaTypeLabel: getReviewMediaTypeLabel(mediaItem.mediaType, t),
    createdAtLabel: formatReviewSubmittedAtLabel(mediaItem.createdAt, locale, t),
  };
}

export function applyReviewBundleLocalization(bundle, context = {}) {
  if (!bundle) {
    return bundle;
  }

  return {
    ...bundle,
    submission: applyReviewSubmissionLocalization(bundle.submission, context),
    media: Array.isArray(bundle.media)
      ? bundle.media.map((item) => applyReviewMediaLocalization(item, context))
      : [],
  };
}
