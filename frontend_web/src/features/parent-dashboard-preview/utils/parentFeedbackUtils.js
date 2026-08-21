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
