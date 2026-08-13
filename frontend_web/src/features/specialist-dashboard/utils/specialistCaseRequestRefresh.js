/**
 * Lightweight pub-sub so Case Requests list/detail stay in sync after workflow updates.
 */
const listeners = new Set();

export function subscribeSpecialistCaseRequestRefresh(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifySpecialistCaseRequestRefresh(detail = {}) {
  listeners.forEach((listener) => {
    try {
      listener(detail);
    } catch {
      // Ignore subscriber errors.
    }
  });
}
