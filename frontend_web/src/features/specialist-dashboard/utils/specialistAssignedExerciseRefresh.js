const listeners = new Set();

export function subscribeSpecialistAssignedExerciseRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySpecialistAssignedExerciseRefresh() {
  listeners.forEach((listener) => {
    listener();
  });
}
