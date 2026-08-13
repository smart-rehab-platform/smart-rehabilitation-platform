import { formatAdminRole, getAdminRoleTone, getAvatarInitial } from "./adminDashboardMappers";

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

export function mapAdminUserRecord(row) {
  const role = readString(row, ["role"]) || "user";
  const fullName =
    readString(row, ["full_name", "fullName", "name"]) || "User";

  return {
    id: readString(row, ["id", "_id"]),
    fullName,
    email: readString(row, ["email"]),
    phone: readString(row, ["phone"]) || "",
    role,
    roleLabel: formatAdminRole(role),
    roleTone: getAdminRoleTone(role),
    avatarInitial: getAvatarInitial(fullName),
    isActive: row.is_active === true || row.isActive === true,
    createdAt: readDate(row.created_at ?? row.createdAt),
  };
}

export function mapPresenceRecord(row) {
  const userId = readString(row, ["id", "user_id", "userId"]);
  const isOnline = Object.prototype.hasOwnProperty.call(row, "isOnline")
    ? row.isOnline === true
    : row.is_online === true;

  return {
    userId,
    isOnline,
    lastSeen: readDate(row.lastSeen ?? row.last_seen),
  };
}

export function buildPresenceMap(rows) {
  const map = {};

  if (!Array.isArray(rows)) {
    return map;
  }

  for (const row of rows) {
    const presence = mapPresenceRecord(row);
    if (presence.userId) {
      map[presence.userId] = presence;
    }
  }

  return map;
}

export function formatPresenceLabel(status, now = new Date()) {
  if (!status) {
    return "Offline";
  }

  if (status.isOnline) {
    return "Online";
  }

  const lastSeen = status.lastSeen;
  if (!lastSeen) {
    return "Offline";
  }

  const localLastSeen = new Date(lastSeen);
  const diffMs = now.getTime() - localLastSeen.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "Last seen just now";
  }

  if (diffMinutes < 60) {
    return `Last seen ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    return `Last seen ${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const seenDay = new Date(
    localLastSeen.getFullYear(),
    localLastSeen.getMonth(),
    localLastSeen.getDate(),
  );
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (seenDay.getTime() === yesterday.getTime()) {
    return "Last seen yesterday";
  }

  return `Last seen ${MONTH_LABELS[localLastSeen.getMonth()]} ${localLastSeen.getDate()}`;
}

export function filterAdminUsers(users, { search = "", roleFilter = null } = {}) {
  const query = search.trim().toLowerCase();
  const normalizedRoleFilter =
    typeof roleFilter === "string" && roleFilter.trim()
      ? roleFilter.trim().toLowerCase()
      : null;

  return users.filter((user) => {
    const matchesRole =
      !normalizedRoleFilter
      || user.role.toLowerCase() === normalizedRoleFilter;

    const matchesSearch =
      !query
      || user.fullName.toLowerCase().includes(query)
      || user.email.toLowerCase().includes(query)
      || user.role.toLowerCase().includes(query);

    return matchesRole && matchesSearch;
  });
}

export function buildCreateUserPayload(form) {
  const payload = {
    full_name: form.fullName.trim(),
    email: form.email.trim(),
    password: form.password,
    role: form.role,
  };

  if (form.phone?.trim()) {
    payload.phone = form.phone.trim();
  }

  return payload;
}

export function buildUpdateUserPayload(form) {
  return {
    full_name: form.fullName.trim(),
    phone: form.phone?.trim() ?? "",
    role: form.role,
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAddUserForm(form, { isPasswordValid }) {
  const fullName = form.fullName?.trim() ?? "";
  const email = form.email?.trim() ?? "";
  const password = form.password ?? "";
  const role = form.role?.trim() ?? "";

  if (fullName.length < 3) {
    return fullName.length === 0
      ? "Full name is required."
      : "Full name must be at least 3 characters long.";
  }

  if (fullName.length > 150) {
    return "Full name must not exceed 150 characters.";
  }

  if (!email) {
    return "Email is required.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "Please enter a valid email address.";
  }

  if (!password) {
    return "Password is required.";
  }

  if (!isPasswordValid(password)) {
    return "Please create a valid password.";
  }

  if (!role) {
    return "Role is required.";
  }

  return null;
}

export function validateEditUserForm(form) {
  const fullName = form.fullName?.trim() ?? "";
  const role = form.role?.trim() ?? "";

  if (fullName.length < 3) {
    return fullName.length === 0
      ? "Full name is required."
      : "Full name must be at least 3 characters long.";
  }

  if (fullName.length > 150) {
    return "Full name must not exceed 150 characters.";
  }

  if (!role) {
    return "Role is required.";
  }

  return null;
}
