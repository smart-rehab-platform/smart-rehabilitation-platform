const listeners = new Set();

export function subscribeSpecialistSessionRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySpecialistSessionRefresh() {
  listeners.forEach((listener) => {
    listener();
  });
}
