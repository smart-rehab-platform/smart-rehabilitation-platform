import { formatAppDate, formatAppDateTime } from "../../../i18n/formatters.js";
import {
  getPatientExerciseStatusLabel,
  getPatientGoalTermLabel,
  getPatientMediaTypeLabel,
  getPatientPlanStatusMeta,
  getPatientReviewStatusLabel,
} from "../../specialist-dashboard/utils/specialistPatientsLocalization.js";
import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";

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

export function getAdminPatientsLabels(t = null) {
  return {
    title: translateKey(t, "admin.patients.title", "Patients"),
    subtitle: translateKey(t, "admin.patients.subtitle", "View and manage all registered patients."),
    toolbarAriaLabel: translateKey(t, "admin.patients.toolbarAriaLabel", "Patients toolbar"),
    searchAriaLabel: translateKey(t, "admin.patients.searchAriaLabel", "Search patients"),
    searchPlaceholder: translateKey(t, "admin.patients.searchPlaceholder", "Search patients or condition"),
    filterAriaLabel: translateKey(t, "admin.patients.filterAriaLabel", "Filter by condition"),
    allConditions: translateKey(t, "admin.patients.allConditions", "All conditions"),
    tableAriaLabel: translateKey(t, "admin.patients.tableAriaLabel", "Patients list"),
    columns: {
      patient: translateKey(t, "admin.patients.columns.patient", "Patient"),
      gender: translateKey(t, "admin.patients.columns.gender", "Gender"),
      condition: translateKey(t, "admin.patients.columns.condition", "Condition"),
      previousSession: translateKey(t, "admin.patients.columns.previousSession", "Previous Session"),
      view: translateKey(t, "admin.patients.columns.view", "View"),
    },
    noCondition: translateKey(t, "admin.patients.noCondition", "No condition"),
    noPreviousSession: translateKey(t, "admin.patients.noPreviousSession", "No previous session"),
    unknownDate: translateKey(t, "admin.patients.unknownDate", "Unknown date"),
    view: translateKey(t, "admin.patients.view", "View"),
    viewDetailsAria: (name) => translateKey(
      t,
      "admin.patients.viewDetailsAria",
      "View details for {name}",
      { name },
    ),
    loading: translateKey(t, "admin.patients.loading", "Loading patients..."),
    empty: translateKey(t, "admin.patients.empty", "No patients have been registered yet."),
    emptyFiltered: translateKey(t, "admin.patients.emptyFiltered", "No patients match your search or filter."),
    retry: translateKey(t, "common.retry", "Retry"),
    loadFailed: translateKey(t, "admin.patients.loadFailed", "Failed to load patients."),
    notFound: translateKey(t, "admin.patients.notFound", "Patient not found."),
    emptyDisplay: translateKey(t, "parent.common.emptyDisplay", "—"),
  };
}

export function getAdminPatientDetailsLabels(t = null) {
  return {
    back: translateKey(t, "admin.patientDetails.back", "Back to Patients"),
    idRequired: translateKey(t, "admin.patientDetails.idRequired", "Patient id is required."),
    loadFailed: translateKey(t, "admin.patientDetails.loadFailed", "Failed to load patient details."),
    notFound: translateKey(t, "admin.patientDetails.notFound", "Patient not found."),
    overviewAriaLabel: translateKey(t, "admin.patientDetails.overviewAriaLabel", "Patient overview"),
    overallProgressAriaLabel: translateKey(
      t,
      "admin.patientDetails.overallProgressAriaLabel",
      "Overall progress",
    ),
    overallProgress: translateKey(t, "specialist.patientDetails.overallProgress", "Overall Progress"),
    ageYears: (count) => translateKey(
      t,
      "admin.patientDetails.ageYears",
      "Age {count} yrs",
      { count },
    ),
    ageUnknown: translateKey(t, "admin.patientDetails.ageUnknown", "Age —"),
    quickStatistics: translateKey(t, "specialist.patientDetails.quickStatistics", "Quick Statistics"),
    stats: {
      activeGoals: translateKey(t, "specialist.patientDetails.stats.activeGoals", "Active Goals"),
      assignedExercises: translateKey(
        t,
        "specialist.patientDetails.stats.assignedExercises",
        "Assigned Exercises",
      ),
      pendingReviews: translateKey(t, "specialist.patientDetails.stats.pendingReviews", "Pending Reviews"),
      reports: translateKey(t, "specialist.patientDetails.stats.reports", "Reports"),
    },
    treatmentPlan: translateKey(t, "specialist.patientDetails.treatmentPlan", "Treatment Plan"),
    noTreatmentPlan: translateKey(t, "specialist.patientDetails.noTreatmentPlanYet", "No treatment plan yet."),
    startDate: translateKey(t, "specialist.patientDetails.startDate", "Start date"),
    endDate: translateKey(t, "specialist.patientDetails.endDate", "End date"),
    goals: translateKey(t, "specialist.patientDetails.goals", "Goals"),
    noGoals: translateKey(t, "specialist.patientDetails.noGoals", "No goals defined for this patient yet."),
    achieved: translateKey(t, "admin.patientDetails.achieved", "Achieved"),
    completion: translateKey(t, "specialist.patientDetails.completion", "Completion"),
    assignedExercises: translateKey(t, "specialist.patientDetails.assignedExercises", "Assigned Exercises"),
    noExercises: translateKey(t, "specialist.patientDetails.noExercises", "No assigned exercises yet."),
    noDueDate: translateKey(t, "admin.patientDetails.noDueDate", "No due date"),
    recentSubmissions: translateKey(
      t,
      "specialist.patientDetails.recentSubmissions",
      "Recent Exercise Submissions",
    ),
    noSubmissions: translateKey(t, "specialist.patientDetails.noSubmissions", "No recent submissions yet."),
    latestNotes: translateKey(t, "specialist.patientDetails.latestNotes", "Latest Specialist Notes"),
    noNotes: translateKey(t, "specialist.patientDetails.noNotes", "No specialist notes yet."),
    assignmentsTitle: translateKey(t, "admin.patientDetails.assignmentsTitle", "Patient Assignments"),
    assignmentsHint: translateKey(
      t,
      "admin.patientDetails.assignmentsHint",
      "Manage linked specialists and parents",
    ),
    assignmentsAriaLabel: translateKey(t, "admin.patientDetails.assignmentsAriaLabel", "Patient actions"),
    retry: translateKey(t, "common.retry", "Retry"),
    emptyDisplay: translateKey(t, "parent.common.emptyDisplay", "—"),
  };
}

export function formatAdminPatientGender(gender, context = {}) {
  const { t } = resolveAdminMapperContext(context);
  const normalized = (gender || "").trim().toLowerCase();

  if (normalized === "male" || normalized === "m") {
    return translateKey(t, "admin.patients.gender.male", "Male");
  }

  if (normalized === "female" || normalized === "f") {
    return translateKey(t, "admin.patients.gender.female", "Female");
  }

  return translateKey(t, "admin.patients.gender.unknown", "—");
}

export function formatAdminPreviousSessionDateTime(dateValue, context = {}) {
  const { locale } = resolveAdminMapperContext(context);

  if (!dateValue) {
    return null;
  }

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const datePart = formatAppDate(date, locale);
  const formattedDateTime = formatAppDateTime(date, locale);
  const timePart = formattedDateTime?.includes(", ")
    ? formattedDateTime.split(", ").slice(-1)[0]
    : formattedDateTime;

  if (!datePart) {
    return timePart;
  }

  return `${datePart} • ${timePart ?? ""}`;
}

export function formatAdminSessionStatusLabel(status, isPastScheduled = false, context = {}) {
  const { t } = resolveAdminMapperContext(context);
  const normalized = (status || "unknown").trim().toLowerCase();

  if (normalized === "completed") {
    return translateKey(t, "parent.sessions.status.completed", "Completed");
  }

  if (normalized === "cancelled") {
    return translateKey(t, "parent.sessions.status.cancelled", "Cancelled");
  }

  if (normalized === "no_show") {
    return translateKey(t, "parent.sessions.status.no_show", "No Show");
  }

  if (normalized === "scheduled") {
    return isPastScheduled
      ? translateKey(t, "admin.patients.sessionStatus.notCompleted", "Not completed")
      : translateKey(t, "parent.sessions.status.scheduled", "Scheduled");
  }

  if (normalized === "pending") {
    return translateKey(t, "parent.sessions.requestStatus.pending", "Pending");
  }

  if (normalized === "inactive" || normalized === "disabled") {
    return translateKey(t, "admin.users.status.inactive", "Inactive");
  }

  return normalized.replaceAll("_", " ");
}

export function formatAdminDateOnlyLabel(value, context = {}) {
  const { locale } = resolveAdminMapperContext(context);
  return formatAppDate(value, locale);
}

export function formatAdminDateTimeLabel(value, context = {}) {
  const { locale } = resolveAdminMapperContext(context);
  return formatAppDateTime(value, locale);
}

export function applyAdminPatientLocalization(patient, context = {}) {
  if (!patient) {
    return patient;
  }

  const labels = getAdminPatientsLabels(context.t);

  const localized = {
    ...patient,
    genderLabel: formatAdminPatientGender(patient.gender, context),
    conditionLabel: patient.condition || labels.noCondition,
    hasCondition: Boolean(patient.condition),
  };

  if (localized.previousSession) {
    localized.previousSession = {
      ...localized.previousSession,
      scheduledAtLabel: formatAdminPreviousSessionDateTime(
        localized.previousSession.scheduledAt,
        context,
      ),
      statusLabel: formatAdminSessionStatusLabel(
        localized.previousSession.status,
        localized.previousSession.isPastScheduledNotCompleted,
        context,
      ),
    };
  }

  return localized;
}

export function applyAdminPatientsLocalization(patients, context = {}) {
  if (!Array.isArray(patients)) {
    return [];
  }

  return patients.map((patient) => applyAdminPatientLocalization(patient, context));
}

export function applyAdminPatientDetailsLocalization(details, context = {}) {
  if (!details) {
    return details;
  }

  const { t } = resolveAdminMapperContext(context);
  const labels = getAdminPatientDetailsLabels(t);
  const patientLabels = getAdminPatientsLabels(t);

  const localizedGoals = (details.goals ?? []).map((goal) => ({
    ...goal,
    termLabel: getPatientGoalTermLabel(goal.term, t),
  }));

  const localizedExercises = (details.assignedExercises ?? []).map((exercise) => {
    const dueDateFormatted = exercise.dueDateRaw
      ? formatAdminDateOnlyLabel(exercise.dueDateRaw, context)
      : exercise.dueDateLabel;

    return {
      ...exercise,
      statusLabel: getPatientExerciseStatusLabel(exercise.isActive, t),
      dueDateDisplay: dueDateFormatted
        ? translateKey(t, "specialist.patientDetails.dueDate", "Due {date}", { date: dueDateFormatted })
        : labels.noDueDate,
    };
  });

  const localizedSubmissions = (details.recentSubmissions ?? []).map((submission) => ({
    ...submission,
    reviewStatusRaw: submission.reviewStatusRaw
      ?? (submission.reviewStatus || "").trim().toLowerCase(),
    reviewStatus: getPatientReviewStatusLabel(
      submission.reviewStatusRaw ?? submission.reviewStatus,
      t,
    ),
    mediaTypeLabel: getPatientMediaTypeLabel(submission.mediaTypeLabel, t),
    submittedAtLabel: formatAdminDateTimeLabel(
      submission.submittedAtRaw ?? submission.submittedAt,
      context,
    ) ?? submission.submittedAtLabel,
  }));

  const localizedNotes = (details.notes ?? []).map((note) => ({
    ...note,
    createdAtLabel: formatAdminDateTimeLabel(
      note.createdAtRaw ?? note.createdAt,
      context,
    ) ?? note.createdAtLabel,
  }));

  let treatmentPlan = details.treatmentPlan;
  if (treatmentPlan) {
    const statusMeta = getPatientPlanStatusMeta(treatmentPlan.status, t);
    treatmentPlan = {
      ...treatmentPlan,
      statusLabel: statusMeta.label,
      statusTone: statusMeta.tone,
      startDateLabel: formatAdminDateOnlyLabel(treatmentPlan.startDateRaw, context)
        ?? treatmentPlan.startDateLabel,
      endDateLabel: formatAdminDateOnlyLabel(treatmentPlan.endDateRaw, context)
        ?? treatmentPlan.endDateLabel,
    };
  }

  return {
    ...details,
    conditionLabel: details.diagnosis?.trim() || patientLabels.noCondition,
    treatmentPlan,
    goals: localizedGoals,
    assignedExercises: localizedExercises,
    recentSubmissions: localizedSubmissions,
    notes: localizedNotes,
    statsLabels: labels.stats,
  };
}
