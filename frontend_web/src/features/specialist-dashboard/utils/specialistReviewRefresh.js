const listeners = new Set();

export function subscribeSpecialistReviewRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySpecialistReviewRefresh() {
  listeners.forEach((listener) => {
    listener();
  });
}
