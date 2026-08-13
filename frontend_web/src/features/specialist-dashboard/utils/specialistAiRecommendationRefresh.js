const listeners = new Set();

export function subscribeSpecialistAiRecommendationRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySpecialistAiRecommendationRefresh() {
  listeners.forEach((listener) => {
    listener();
  });
}
