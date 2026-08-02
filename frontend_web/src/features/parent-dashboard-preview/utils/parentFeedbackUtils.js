export const FEEDBACK_SORT_OPTIONS = [
  { id: "newest", label: "Newest review" },
  { id: "oldest", label: "Oldest review" },
  { id: "alphabetical", label: "Alphabetical" },
  { id: "retryFirst", label: "Requires retry first" },
];

export const FEEDBACK_STATUS_FILTER_OPTIONS = [
  { id: "all", label: "All statuses" },
  { id: "needs_retry", label: "Needs Retry" },
  { id: "reviewed", label: "Reviewed" },
];

export const FEEDBACK_EMPTY_MESSAGES = {
  none: "No exercise feedback yet.",
  filtered: "No reviews match your filters.",
};

/**
 * @param {Array<Record<string, unknown>>} reviews
 * @param {{ search?: string, childId?: string, status?: string }} filters
 */
export function filterFeedbackReviews(reviews, filters) {
  const search = filters.search?.trim().toLowerCase() || "";
  const childId = filters.childId || "all";
  const status = filters.status || "all";

  return reviews.filter((review) => {
    if (childId !== "all" && review.patientId !== childId) {
      return false;
    }

    if (status !== "all" && review.status !== status) {
      return false;
    }

    if (search && !String(review.exerciseTitle || "").toLowerCase().includes(search)) {
      return false;
    }

    return true;
  });
}

/**
 * @param {Array<Record<string, unknown>>} reviews
 * @param {string} sortKey
 */
export function sortFeedbackReviews(reviews, sortKey) {
  const copy = [...reviews];

  if (sortKey === "oldest") {
    return copy.sort((left, right) => {
      const leftMs = left.reviewedAtMs ?? 0;
      const rightMs = right.reviewedAtMs ?? 0;

      if (leftMs !== rightMs) {
        return leftMs - rightMs;
      }

      return String(left.exerciseTitle || "").localeCompare(String(right.exerciseTitle || ""));
    });
  }

  if (sortKey === "alphabetical") {
    return copy.sort((left, right) => (
      String(left.exerciseTitle || "").localeCompare(String(right.exerciseTitle || ""))
    ));
  }

  if (sortKey === "retryFirst") {
    return copy.sort((left, right) => {
      const leftRank = left.requiresRetry ? 0 : 1;
      const rightRank = right.requiresRetry ? 0 : 1;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      const leftMs = left.reviewedAtMs ?? 0;
      const rightMs = right.reviewedAtMs ?? 0;

      if (leftMs !== rightMs) {
        return rightMs - leftMs;
      }

      return String(left.exerciseTitle || "").localeCompare(String(right.exerciseTitle || ""));
    });
  }

  return copy.sort((left, right) => {
    const leftMs = left.reviewedAtMs ?? 0;
    const rightMs = right.reviewedAtMs ?? 0;

    if (leftMs !== rightMs) {
      return rightMs - leftMs;
    }

    return String(left.exerciseTitle || "").localeCompare(String(right.exerciseTitle || ""));
  });
}
