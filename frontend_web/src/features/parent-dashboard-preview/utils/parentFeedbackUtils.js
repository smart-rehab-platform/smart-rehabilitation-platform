import {
  getFeedbackEmptyMessages,
  getFeedbackStatusMeta,
} from "./parentFeedbackLocalization";

export {
  getFeedbackEmptyMessages,
  getFeedbackStatusMeta,
};

/**
 * @param {Array<Record<string, unknown>>} reviews
 * @param {{ search?: string, childId?: string }} filters
 */
export function filterFeedbackReviews(reviews, filters) {
  const search = filters.search?.trim().toLowerCase() || "";
  const childId = filters.childId || "all";

  return reviews.filter((review) => {
    if (childId !== "all" && review.patientId !== childId) {
      return false;
    }

    if (search && !String(review.exerciseTitle || "").toLowerCase().includes(search)) {
      return false;
    }

    return true;
  });
}

/**
 * Newest review first (default Feedback hub order).
 * @param {Array<Record<string, unknown>>} reviews
 */
export function sortFeedbackReviewsNewestFirst(reviews) {
  return [...reviews].sort((left, right) => {
    const leftMs = left.reviewedAtMs ?? 0;
    const rightMs = right.reviewedAtMs ?? 0;

    if (leftMs !== rightMs) {
      return rightMs - leftMs;
    }

    return String(left.exerciseTitle || "").localeCompare(String(right.exerciseTitle || ""));
  });
}

/**
 * Converts stored performance_rating (0–10, star * 2) to parent-facing stars (1–5).
 * Matches specialist review entry and Flutter parent feedback display intent.
 * @param {number|null|undefined} performanceRating
 * @returns {number|null}
 */
export function formatParentPerformanceRating(performanceRating) {
  if (performanceRating == null || !Number.isFinite(Number(performanceRating))) {
    return null;
  }

  const stars = Number(performanceRating) / 2;
  if (!Number.isFinite(stars) || stars <= 0) {
    return null;
  }

  return Math.max(1, Math.min(5, Math.round(stars)));
}
