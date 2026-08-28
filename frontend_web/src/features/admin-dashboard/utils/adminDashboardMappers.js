import { getRoleLabel } from "../../../routes/roleRouting.js";
import { resolveProfileImageUrl } from "./adminPatientsMappers.js";

export const SYSTEM_ACTIVITY_PRESET_OFFSETS = {
  thisWeek: 0,
  lastWeek: 1,
  last2Weeks: 2,
  lastMonth: 4,
};

export const MIN_WEEK_OFFSET = 0;
export const MAX_WEEK_OFFSET = 52;

const DEFAULT_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEFAULT_FULL_DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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

function readInt(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.trunc(value);
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function readDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatChartDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`;
}

export function clampWeekOffset(weekOffset) {
  const raw = Number(weekOffset);
  if (!Number.isFinite(raw)) {
    return 0;
  }

  return Math.max(MIN_WEEK_OFFSET, Math.min(MAX_WEEK_OFFSET, Math.trunc(raw)));
}

export function countNewSignupsLast7Days(allUsers, now = new Date()) {
  if (!Array.isArray(allUsers) || allUsers.length === 0) {
    return 0;
  }

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return allUsers.filter((user) => {
    const createdAt = readDate(user.created_at ?? user.createdAt);
    return createdAt != null && createdAt > weekAgo;
  }).length;
}

function countSpecialistsFromRoleRows(usersByRole) {
  if (!Array.isArray(usersByRole)) {
    return 0;
  }

  for (const row of usersByRole) {
    const role = readString(row, ["role"]).toLowerCase();
    if (role === "specialist") {
      return readInt(row, ["count"]) ?? 0;
    }
  }

  return 0;
}

function countSpecialistsFromUsers(allUsers) {
  if (!Array.isArray(allUsers)) {
    return 0;
  }

  return allUsers.filter(
    (user) => readString(user, ["role"]).toLowerCase() === "specialist",
  ).length;
}

/**
 * Mirrors Flutter AdminDashboardRepository.fetchOverview aggregation.
 */
export function buildAdminOverviewKpis({
  overviewMap,
  usersByRole,
  allUsers,
  patientsList = null,
}) {
  let totalUsers = readInt(overviewMap ?? {}, ["total_users", "totalUsers"]) ?? 0;
  let totalPatients =
    readInt(overviewMap ?? {}, ["total_patients", "totalPatients"]) ?? 0;

  let totalSpecialists = countSpecialistsFromRoleRows(usersByRole);
  const newSignupsThisWeek = countNewSignupsLast7Days(allUsers);

  if (totalUsers === 0 && Array.isArray(allUsers)) {
    totalUsers = allUsers.length;
  }

  if (totalPatients === 0 && Array.isArray(patientsList)) {
    totalPatients = patientsList.length;
  }

  if (totalSpecialists === 0) {
    totalSpecialists = countSpecialistsFromUsers(allUsers);
  }

  return {
    totalUsers,
    totalPatients,
    totalSpecialists,
    newSignupsThisWeek,
  };
}

export function formatAdminRole(role) {
  const normalized = readString({ role }, ["role"]).toLowerCase();
  if (!normalized) {
    return "User";
  }

  return getRoleLabel(normalized);
}

export function formatRegisteredLabel(createdAt, now = new Date()) {
  const date = readDate(createdAt);
  if (!date) {
    return "Recently";
  }

  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function mapRecentUser(row) {
  const name =
    readString(row, ["full_name", "fullName", "name"]) || "User";
  const rawRole = readString(row, ["role", "userRole"]).toLowerCase();
  const createdAt = readDate(row.created_at ?? row.createdAt);

  return {
    id: readString(row, ["id", "_id", "userId"]),
    name,
    rawRole,
    createdAt,
    profileImageUrl: resolveProfileImageUrl(
      readString(row, ["profile_image_url", "profileImageUrl"]),
    ),
  };
}

function emptyWeeklyDays() {
  return DEFAULT_DAY_LABELS.map((label, index) => ({
    label,
    fullLabel: DEFAULT_FULL_DAY_LABELS[index],
    activityCount: 0,
  }));
}

export function mapWeeklySystemActivity(response, requestedWeekOffset = 0) {
  const normalizedOffset = clampWeekOffset(requestedWeekOffset);
  const map = response && typeof response === "object" ? response : null;

  if (!map) {
    return {
      days: emptyWeeklyDays(),
      weekOffset: normalizedOffset,
      weekStart: null,
      weekEnd: null,
    };
  }

  const rawDays = map.days;
  const weekStart = readDate(map.week_start ?? map.weekStart);
  const weekEnd = readDate(map.week_end ?? map.weekEnd);
  const weekOffset =
    readInt(map, ["week_offset", "weekOffset"]) ?? normalizedOffset;

  if (!Array.isArray(rawDays) || rawDays.length !== 7) {
    return {
      days: emptyWeeklyDays(),
      weekOffset,
      weekStart,
      weekEnd,
    };
  }

  const days = rawDays.map((day) => ({
    label: readString(day, ["label"]) || "—",
    fullLabel:
      readString(day, ["full_label", "fullLabel", "label"]) || "—",
    activityCount: readInt(day, ["activity_count", "activityCount"]) ?? 0,
  }));

  return {
    days,
    weekOffset,
    weekStart,
    weekEnd,
  };
}

export function formatSystemActivityPeriodLabel({
  weekOffset,
  weekStart = null,
  weekEnd = null,
}) {
  const offset = clampWeekOffset(weekOffset);

  if (offset === SYSTEM_ACTIVITY_PRESET_OFFSETS.thisWeek) {
    return "This Week";
  }

  if (offset === SYSTEM_ACTIVITY_PRESET_OFFSETS.lastWeek) {
    return "Last Week";
  }

  if (offset === SYSTEM_ACTIVITY_PRESET_OFFSETS.last2Weeks) {
    return "Last 2 Weeks";
  }

  if (offset === SYSTEM_ACTIVITY_PRESET_OFFSETS.lastMonth) {
    return "Last Month";
  }

  if (weekStart && weekEnd) {
    return `${formatChartDate(weekStart)} – ${formatChartDate(weekEnd)}`;
  }

  if (offset === 1) {
    return "Last Week";
  }

  return `${offset} weeks ago`;
}

export function normalizeBarHeight(value, maxValue) {
  if (value <= 0 || maxValue <= 0) {
    return 0;
  }

  const ratio = value / maxValue;
  return Math.max(0.12, Math.min(1, ratio));
}

export function getAdminRoleTone(rawRole) {
  switch ((rawRole || "").toLowerCase()) {
    case "parent":
      return "cyan";
    case "specialist":
      return "green";
    case "admin":
      return "amber";
    default:
      return "blue";
  }
}

export function getAvatarInitial(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) {
    return "U";
  }

  return trimmed.charAt(0).toUpperCase();
}
