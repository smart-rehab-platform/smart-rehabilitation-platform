import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";

export const PARENT_RELATIONSHIP_OPTIONS = ["mother", "father", "guardian", "other"];

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

export function getAdminAssignmentsLabels(t = null) {
  return {
    title: translateKey(t, "admin.assignments.title", "Patient Assignments"),
    subtitle: translateKey(
      t,
      "admin.assignments.subtitle",
      "Manage specialists and parent relationships for patients.",
    ),
    headerAriaLabel: translateKey(t, "admin.assignments.headerAriaLabel", "Patient assignments header"),
    loading: translateKey(t, "admin.assignments.loading", "Loading assignment data..."),
    loadFailed: translateKey(t, "admin.assignments.loadFailed", "Failed to load assignment data."),
    loadRelationshipsFailed: translateKey(
      t,
      "admin.assignments.loadRelationshipsFailed",
      "Failed to load patient assignments.",
    ),
    changeHint: translateKey(
      t,
      "admin.assignments.changeHint",
      "To change an assignment, unlink the current specialist or parent, then assign or link the new one.",
    ),
    patientLabel: translateKey(t, "admin.assignments.patientLabel", "Patient"),
    selectPatient: translateKey(t, "admin.assignments.selectPatient", "Select a patient"),
    selectPatientHint: translateKey(
      t,
      "admin.assignments.selectPatientHint",
      "Select a patient to view assignments.",
    ),
    searchPatients: translateKey(t, "admin.assignments.searchPatients", "Search patients"),
    searchPatientsPlaceholder: translateKey(
      t,
      "admin.assignments.searchPatientsPlaceholder",
      "Search patients by name or condition",
    ),
    noPatients: translateKey(t, "admin.assignments.noPatients", "No patients available."),
    noPatientsMatch: translateKey(t, "admin.assignments.noPatientsMatch", "No patients match your search."),
    assignSpecialist: translateKey(t, "admin.assignments.assignSpecialist", "Assign Specialist"),
    linkParent: translateKey(t, "admin.assignments.linkParent", "Link Parent"),
    specialistLabel: translateKey(t, "admin.assignments.specialistLabel", "Specialist"),
    parentLabel: translateKey(t, "admin.assignments.parentLabel", "Parent"),
    noSpecialists: translateKey(t, "admin.assignments.noSpecialists", "No specialists available"),
    noParents: translateKey(t, "admin.assignments.noParents", "No parent accounts available"),
    selectSpecialist: translateKey(t, "admin.assignments.selectSpecialist", "Select a specialist"),
    selectParent: translateKey(t, "admin.assignments.selectParent", "Select a parent"),
    primarySpecialist: translateKey(t, "admin.assignments.primarySpecialist", "Primary specialist"),
    primaryContact: translateKey(t, "admin.assignments.primaryContact", "Primary contact"),
    relationship: translateKey(t, "admin.assignments.relationship", "Relationship"),
    assigning: translateKey(t, "admin.assignments.assigning", "Assigning..."),
    linking: translateKey(t, "admin.assignments.linking", "Linking..."),
    assignSpecialistAction: translateKey(
      t,
      "admin.assignments.assignSpecialistAction",
      "Assign Specialist to Patient",
    ),
    linkParentAction: translateKey(t, "admin.assignments.linkParentAction", "Link Parent to Patient"),
    assignedSpecialists: translateKey(t, "admin.assignments.assignedSpecialists", "Assigned Specialists"),
    linkedParents: translateKey(t, "admin.assignments.linkedParents", "Linked Parents"),
    loadingRelationships: translateKey(
      t,
      "admin.assignments.loadingRelationships",
      "Loading assigned specialists...",
    ),
    loadingParents: translateKey(t, "admin.assignments.loadingParents", "Loading linked parents..."),
    selectPatientForAssignments: translateKey(
      t,
      "admin.assignments.selectPatientForAssignments",
      "Select a patient to manage assignments.",
    ),
    noSpecialistsAssigned: translateKey(
      t,
      "admin.assignments.noSpecialistsAssigned",
      "No specialists are currently assigned to this patient.",
    ),
    noParentsLinked: translateKey(
      t,
      "admin.assignments.noParentsLinked",
      "No parents are currently linked to this patient.",
    ),
    specialistRole: translateKey(t, "admin.assignments.specialistRole", "Specialist"),
    primarySpecialistBadge: translateKey(
      t,
      "admin.assignments.primarySpecialistBadge",
      "Primary specialist",
    ),
    primaryContactBadge: translateKey(t, "admin.assignments.primaryContactBadge", "Primary contact"),
    unlinkSpecialistAria: (name) => translateKey(
      t,
      "admin.assignments.unlinkSpecialistAria",
      "Unlink {name}",
      { name },
    ),
    unlinkParentAria: (name) => translateKey(
      t,
      "admin.assignments.unlinkParentAria",
      "Unlink {name}",
      { name },
    ),
    unlinkSpecialistTitle: translateKey(t, "admin.assignments.unlinkSpecialistTitle", "Unlink Specialist"),
    unlinkParentTitle: translateKey(t, "admin.assignments.unlinkParentTitle", "Unlink Parent"),
    unlinkSpecialistConfirm: (name) => translateKey(
      t,
      "admin.assignments.unlinkSpecialistConfirm",
      "Are you sure you want to unlink {name} from this patient?",
      { name },
    ),
    unlinkParentConfirm: (name) => translateKey(
      t,
      "admin.assignments.unlinkParentConfirm",
      "Are you sure you want to unlink {name} from this patient?",
      { name },
    ),
    unlinking: translateKey(t, "admin.assignments.unlinking", "Unlinking..."),
    unlink: translateKey(t, "admin.assignments.unlink", "Unlink"),
    cancel: translateKey(t, "common.cancel", "Cancel"),
    retry: translateKey(t, "common.retry", "Retry"),
    unlinkFailed: translateKey(t, "admin.assignments.unlinkFailed", "Unable to unlink."),
    unlinkInProgress: translateKey(
      t,
      "admin.assignments.unlinkInProgress",
      "An unlink is already in progress.",
    ),
    selectPatientRequired: translateKey(t, "admin.assignments.selectPatientRequired", "Please select a patient."),
    selectSpecialistRequired: translateKey(
      t,
      "admin.assignments.selectSpecialistRequired",
      "Please select a specialist.",
    ),
    selectParentRequired: translateKey(t, "admin.assignments.selectParentRequired", "Please select a parent."),
    specialistIdMissing: translateKey(t, "admin.assignments.specialistIdMissing", "Specialist id is missing."),
    parentIdMissing: translateKey(t, "admin.assignments.parentIdMissing", "Parent id is missing."),
    assignSpecialistSuccess: translateKey(
      t,
      "admin.assignments.assignSpecialistSuccess",
      "Specialist assigned to patient successfully.",
    ),
    assignSpecialistFailed: translateKey(
      t,
      "admin.assignments.assignSpecialistFailed",
      "Failed to assign specialist.",
    ),
    linkParentSuccess: translateKey(
      t,
      "admin.assignments.linkParentSuccess",
      "Parent linked to patient successfully.",
    ),
    linkParentFailed: translateKey(t, "admin.assignments.linkParentFailed", "Failed to link parent."),
    unlinkSpecialistSuccess: translateKey(
      t,
      "admin.assignments.unlinkSpecialistSuccess",
      "Specialist unlinked successfully.",
    ),
    unlinkParentSuccess: translateKey(
      t,
      "admin.assignments.unlinkParentSuccess",
      "Parent unlinked successfully.",
    ),
    unlinkSpecialistFailed: translateKey(
      t,
      "admin.assignments.unlinkSpecialistFailed",
      "Failed to unlink specialist.",
    ),
    unlinkParentFailed: translateKey(
      t,
      "admin.assignments.unlinkParentFailed",
      "Failed to unlink parent.",
    ),
    requestFailed: translateKey(t, "admin.assignments.requestFailed", "Request failed. Please try again."),
    alreadyLinked: translateKey(
      t,
      "admin.assignments.alreadyLinked",
      "This patient is already linked to this user.",
    ),
  };
}

export function formatAdminRelationshipLabel(value, context = {}) {
  const { t } = resolveAdminMapperContext(context);
  const normalized = (value || "").trim().toLowerCase();

  if (!normalized) {
    return translateKey(t, "admin.assignments.relationshipOptions.guardian", "Guardian");
  }

  const key = `admin.assignments.relationshipOptions.${normalized}`;
  const fallback = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return translateKey(t, key, fallback);
}

export function getAdminRelationshipOptions(context = {}) {
  return PARENT_RELATIONSHIP_OPTIONS.map((value) => ({
    value,
    label: formatAdminRelationshipLabel(value, context),
  }));
}

export function friendlyAssignmentErrorLocalized(raw, context = {}) {
  const { t } = resolveAdminMapperContext(context);

  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return translateKey(t, "admin.assignments.requestFailed", "Request failed. Please try again.");
  }

  const lower = raw.toLowerCase();
  if (
    lower.includes("duplicate")
    || lower.includes("unique")
    || lower.includes("already")
    || lower.includes("violates unique")
  ) {
    return translateKey(
      t,
      "admin.assignments.alreadyLinked",
      "This patient is already linked to this user.",
    );
  }

  return raw.trim();
}

export function applyAdminGuardianLinkLocalization(link, context = {}) {
  if (!link) {
    return link;
  }

  return {
    ...link,
    relationshipLabel: formatAdminRelationshipLabel(link.relationship, context),
  };
}

export function applyAdminGuardianLinksLocalization(links, context = {}) {
  if (!Array.isArray(links)) {
    return [];
  }

  return links.map((link) => applyAdminGuardianLinkLocalization(link, context));
}
