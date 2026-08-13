import { getPatientInitials } from "./adminPatientsMappers";

export const PARENT_RELATIONSHIP_OPTIONS = ["mother", "father", "guardian", "other"];

function readString(record, keys) {
  if (!record || typeof record !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function readBoolean(record, keys) {
  if (!record || typeof record !== "object") {
    return false;
  }

  for (const key of keys) {
    if (record[key] === true) {
      return true;
    }
  }

  return false;
}

export function friendlyAssignmentError(raw) {
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return "Request failed. Please try again.";
  }

  const lower = raw.toLowerCase();
  if (
    lower.includes("duplicate")
    || lower.includes("unique")
    || lower.includes("already")
    || lower.includes("violates unique")
  ) {
    return "This patient is already linked to this user.";
  }

  return raw.trim();
}

export function formatRelationshipLabel(value) {
  const normalized = (value || "").trim().toLowerCase();
  if (!normalized) {
    return "Guardian";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function mapSpecialistUserOption(row) {
  const role = readString(row, ["role", "userRole"]).toLowerCase();
  if (role && role !== "specialist") {
    return null;
  }

  const userId = readString(row, ["id", "_id", "userId"]);
  if (!userId) {
    return null;
  }

  const name = readString(row, ["full_name", "fullName", "name"]) || "Specialist";
  const email = readString(row, ["email"]) || null;

  return {
    userId,
    name,
    email,
    initials: getPatientInitials(name),
  };
}

export function mapParentUserOption(row) {
  const role = readString(row, ["role", "userRole"]).toLowerCase();
  if (role && role !== "parent") {
    return null;
  }

  const userId = readString(row, ["id", "_id", "userId"]);
  if (!userId) {
    return null;
  }

  const name = readString(row, ["full_name", "fullName", "name"]) || "Parent";
  const email = readString(row, ["email"]) || null;

  return {
    userId,
    name,
    email,
    initials: getPatientInitials(name),
  };
}

export function mapPatientSpecialistLink(row) {
  const specialistId = readString(row, ["specialist_id", "specialistId"]);
  if (!specialistId) {
    return null;
  }

  const specialistName = readString(row, ["full_name", "fullName", "name"]) || "Specialist";
  const email = readString(row, ["email"]) || null;

  return {
    specialistId,
    specialistName,
    email,
    isPrimary: readBoolean(row, ["is_primary", "isPrimary"]),
    initials: getPatientInitials(specialistName),
  };
}

export function mapPatientGuardianLink(row) {
  const parentId = readString(row, ["parent_id", "parentId"]);
  if (!parentId) {
    return null;
  }

  const parentName = readString(row, ["full_name", "fullName", "name"]) || "Parent";
  const relationship = readString(row, ["relationship"]) || "guardian";
  const email = readString(row, ["email"]) || null;

  return {
    parentId,
    parentName,
    relationship,
    relationshipLabel: formatRelationshipLabel(relationship),
    email,
    isPrimaryContact: readBoolean(row, ["is_primary_contact", "isPrimaryContact"]),
    initials: getPatientInitials(parentName),
  };
}

export function sortByName(items, nameKey = "name") {
  return [...items].sort((left, right) => (
    left[nameKey].toLowerCase().localeCompare(right[nameKey].toLowerCase())
  ));
}
