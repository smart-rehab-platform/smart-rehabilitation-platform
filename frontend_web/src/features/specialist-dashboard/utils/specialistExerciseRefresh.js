const listeners = new Set();

export function subscribeSpecialistExerciseRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySpecialistExerciseRefresh() {
  listeners.forEach((listener) => {
    listener();
  });
}
