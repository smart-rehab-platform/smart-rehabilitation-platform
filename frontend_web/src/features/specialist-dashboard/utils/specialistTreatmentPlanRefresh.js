const listeners = new Set();

export function subscribeSpecialistTreatmentPlanRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySpecialistTreatmentPlanRefresh() {
  listeners.forEach((listener) => {
    listener();
  });
}
