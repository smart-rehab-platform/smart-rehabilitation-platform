const listeners = new Set();

export function subscribeSpecialistGoalsRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySpecialistGoalsRefresh() {
  listeners.forEach((listener) => {
    listener();
  });
}
