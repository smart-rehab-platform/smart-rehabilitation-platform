import { formatAppDate } from "../../../i18n/formatters.js";
import { buildSpecialistPatientDetailPath } from "../../../routes/specialistDashboardRoutes.js";
import { resolveSpecialistMapperContext } from "./specialistDashboardLocalization.js";

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
      return translated;
    }
  }

  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }

  return fallback;
}

export function getSpecialistProgressPageLabels(t = null) {
  return {
    title: translateKey(t, "specialist.progress.title", "Patient Progress"),
    subtitle: translateKey(
      t,
      "specialist.progress.subtitle",
      "Review progress across your assigned patients",
    ),
    loading: translateKey(t, "specialist.progress.loading", "Loading patient progress..."),
    empty: translateKey(
      t,
      "specialist.progress.empty",
      "No progress data available yet.",
    ),
    backToDashboard: translateKey(t, "specialist.messages.backToDashboard", "Back to Dashboard"),
    overallProgress: translateKey(
      t,
      "specialist.patientDetails.overallProgress",
      "Overall Progress",
    ),
    viewPatient: translateKey(t, "specialist.progress.viewPatient", "View Patient"),
    viewPatientAria: (name) => translateKey(
      t,
      "specialist.progress.viewPatientAria",
      "View patient {name}",
      { name },
    ),
  };
}

export function getSpecialistProgressErrorMessages(t = null) {
  return {
    signInRequired: translateKey(
      t,
      "specialist.dashboard.errors.progressSignInRequired",
      "Please sign in to view patient progress.",
    ),
    loadFailed: translateKey(
      t,
      "specialist.dashboard.errors.progressLoadFailed",
      "Failed to load patient progress.",
    ),
  };
}

export function formatProgressUpdatedLabel(updatedAt, context = {}) {
  const { t, locale } = resolveSpecialistMapperContext(context);
  if (!(updatedAt instanceof Date) || Number.isNaN(updatedAt.getTime())) {
    return null;
  }

  const formattedDate = formatAppDate(updatedAt, locale);
  if (!formattedDate) {
    return null;
  }

  return translateKey(
    t,
    "specialist.progress.latestUpdate",
    "Latest update: {date}",
    { date: formattedDate },
  );
}

export function applySpecialistPatientProgressLocalization(item, context = {}) {
  if (!item) {
    return item;
  }

  const labels = getSpecialistProgressPageLabels(context.t);
  const updatedLabel = formatProgressUpdatedLabel(item.updatedAt, context);

  return {
    ...item,
    patientName: item.patientName,
    percent: item.percent,
    patientId: item.patientId,
    profileImageUrl: item.profileImageUrl ?? null,
    updatedAt: item.updatedAt ?? null,
    updatedLabel,
    overallProgressLabel: labels.overallProgress,
    patientDetailPath: item.patientId
      ? buildSpecialistPatientDetailPath(item.patientId)
      : null,
  };
}

export function applySpecialistPatientProgressListLocalization(items, context = {}) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => applySpecialistPatientProgressLocalization(item, context))
    .filter(Boolean);
}
