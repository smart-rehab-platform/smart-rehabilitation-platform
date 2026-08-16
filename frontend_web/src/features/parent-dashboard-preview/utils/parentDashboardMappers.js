/**
 * Shared mappers for parent dashboard API payloads.
 */

import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import {
  PARENT_WEB_ROUTES,
  buildParentReportDetailPath,
  buildParentSessionsPath,
} from "../../../routes/parentDashboardRoutes";

export function readString(source, keys) {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function readNumber(source, keys) {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return null;
}

export function getInitials(name) {
  if (!name || typeof name !== "string") {
    return "?";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

const PROGRESS_PERIOD_PRIORITY = {
  weekly: 3,
  daily: 2,
  monthly: 1,
};

function readProgressPeriod(row) {
  return readString(row, ["period"])?.toLowerCase() ?? null;
}

function readProgressPercent(row) {
  return readNumber(row, [
    "improvement_percentage",
    "improvementPercentage",
    "progress",
  ]);
}

function shouldPreferProgressRow(current, candidate) {
  if (candidate.percent == null) {
    return false;
  }

  if (current.percent == null) {
    return true;
  }

  const currentRank = PROGRESS_PERIOD_PRIORITY[current.period] ?? 0;
  const candidateRank = PROGRESS_PERIOD_PRIORITY[candidate.period] ?? 0;

  return candidateRank > currentRank;
}

function mapChildRow(row) {
  const fullName = readString(row, ["full_name", "fullName", "name"]) || "Child";
  const id = readString(row, ["id", "_id"]);

  return {
    id,
    fullName,
    initials: getInitials(fullName),
    profileImageUrl: resolveReportFileUrl(
      readString(row, ["profile_image_url", "profileImageUrl", "image_url", "avatar"]),
    ),
    status: "Active treatment plan",
    progressPercent: readProgressPercent(row),
  };
}

/**
 * Merges linked patients with progress rows (Flutter parity).
 * @param {Array<Record<string, unknown>>} childrenRows
 * @param {Array<Record<string, unknown>>} progressRows
 * @returns {Array<{ id: string, fullName: string, initials: string, profileImageUrl: string|null, status: string, progressPercent: number|null }>}
 */
export function mergeChildren(childrenRows, progressRows) {
  const map = new Map();

  for (const row of childrenRows) {
    const child = mapChildRow(row);
    if (child.id) {
      map.set(child.id, child);
    }
  }

  if (map.size === 0 && progressRows.length > 0) {
    for (const row of progressRows) {
      const child = mapChildRow(row);
      if (child.id) {
        map.set(child.id, child);
      }
    }
  }

  const bestProgressByChild = new Map();

  for (const row of progressRows) {
    const id = readString(row, ["id", "_id"]);
    if (!id) {
      continue;
    }

    const candidate = {
      period: readProgressPeriod(row),
      percent: readProgressPercent(row),
    };
    const current = bestProgressByChild.get(id);

    if (!current || shouldPreferProgressRow(current, candidate)) {
      bestProgressByChild.set(id, candidate);
    }
  }

  for (const row of progressRows) {
    const id = readString(row, ["id", "_id"]);
    if (!id) {
      continue;
    }

    const existing = map.get(id) || mapChildRow(row);
    const progressPercent = bestProgressByChild.get(id)?.percent ?? null;

    map.set(id, {
      ...existing,
      id,
      fullName:
        existing.fullName
        || readString(row, ["full_name", "fullName", "name"])
        || "Child",
      initials: getInitials(
        existing.fullName
        || readString(row, ["full_name", "fullName", "name"])
        || "Child",
      ),
      progressPercent: progressPercent ?? existing.progressPercent ?? null,
      profileImageUrl: existing.profileImageUrl ?? resolveReportFileUrl(
        readString(row, ["profile_image_url", "profileImageUrl", "image_url", "avatar"]),
      ),
    });
  }

  return Array.from(map.values()).filter((child) => child.id);
}

/**
 * @param {Record<string, unknown>|null|undefined} user
 */
export function mapParentFromAuth(user) {
  const fullName =
    readString(user, ["full_name", "fullName"])
    || (typeof user?.email === "string" ? user.email : "Parent");

  return {
    fullName,
    role: "Parent",
    initials: getInitials(fullName),
    profileImageUrl: resolveReportFileUrl(
      readString(user, ["profile_image_url", "profileImageUrl"]),
    ),
  };
}

function normalizePercent(value) {
  if (value == null || !Number.isFinite(value)) {
    return 0;
  }

  if (value <= 1) {
    return Math.round(value * 100);
  }

  return Math.round(Math.max(0, Math.min(100, value)));
}

function formatSessionDate(dateValue) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return { dateLabel: "Upcoming", timeLabel: null };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  let dateLabel;
  if (diffDays === 0) {
    dateLabel = "Today";
  } else if (diffDays === 1) {
    dateLabel = "Tomorrow";
  } else {
    dateLabel = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  const timeLabel = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return { dateLabel, timeLabel };
}

const TERMINAL_SESSION_STATUSES = new Set([
  "cancelled",
  "completed",
  "missed",
  "no_show",
]);

/**
 * Normalizes backend session status strings for consistent comparisons.
 * @param {string|null|undefined} status
 */
export function normalizeSessionStatus(status) {
  if (!status || typeof status !== "string") {
    return null;
  }

  return status.trim().toLowerCase().replace(/-/g, "_");
}

/**
 * @param {string|null|undefined} status
 */
export function isTerminalSessionStatus(status) {
  const normalized = normalizeSessionStatus(status);
  return normalized != null && TERMINAL_SESSION_STATUSES.has(normalized);
}

/**
 * Extracts a valid http/https URL from a location or meeting link field.
 * @param {string|null|undefined} value
 */
export function extractMeetingUrl(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  try {
    const direct = new URL(trimmed);
    if (direct.protocol === "http:" || direct.protocol === "https:") {
      return direct.href;
    }
  } catch {
    // Fall through to regex extraction.
  }

  const match = trimmed.match(/https?:\/\/[^\s]+/i);
  if (!match) {
    return null;
  }

  try {
    const extracted = new URL(match[0]);
    if (extracted.protocol === "http:" || extracted.protocol === "https:") {
      return extracted.href;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * @param {string|null|undefined} locationOrLink
 */
export function isOnlineSessionLocation(locationOrLink) {
  if (!locationOrLink) {
    return false;
  }

  if (extractMeetingUrl(locationOrLink)) {
    return true;
  }

  const lower = locationOrLink.toLowerCase();
  return (
    lower.includes("meet")
    || lower.includes("zoom")
    || lower.includes("teams")
    || lower.includes("online")
  );
}

/**
 * @param {Record<string, unknown>} session
 */
export function getSessionCalendarDate(session) {
  const scheduledAt = session.scheduled_at ?? session.scheduledAt;
  if (!scheduledAt) {
    return null;
  }

  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    year: date.getFullYear(),
    monthIndex: date.getMonth(),
    day: date.getDate(),
  };
}

/**
 * @param {Array<Record<string, unknown>>} sessions
 * @param {string} patientId
 */
export function filterSessionsForPatient(sessions, patientId) {
  return sessions.filter(
    (session) => readString(session, ["patient_id", "patientId"]) === patientId,
  );
}

/**
 * @param {Record<string, unknown>} session
 * @param {number} [now]
 */
export function isUpcomingSession(session, now = Date.now()) {
  if (isTerminalSessionStatus(readString(session, ["status"]))) {
    return false;
  }

  const normalized = normalizeSessionStatus(readString(session, ["status"]));
  if (normalized !== "scheduled") {
    return false;
  }

  const scheduledAt = session.scheduled_at ?? session.scheduledAt;
  const timestamp = scheduledAt ? new Date(scheduledAt).getTime() : Number.NaN;

  if (!Number.isNaN(timestamp)) {
    return timestamp >= now;
  }

  return true;
}

/**
 * Maps a backend session row into UpcomingSessionCard props.
 * @param {Record<string, unknown>} sessionRow
 */
export function buildUpcomingSessionViewModel(sessionRow) {
  const scheduledAt = sessionRow.scheduled_at ?? sessionRow.scheduledAt;
  const { dateLabel, timeLabel } = formatSessionDate(scheduledAt);
  const locationOrLink = readString(sessionRow, ["location_or_link", "locationOrLink"]);
  const meetingUrl = extractMeetingUrl(locationOrLink);
  const isOnline = meetingUrl != null || isOnlineSessionLocation(locationOrLink);

  return {
    id: readString(sessionRow, ["id", "_id"]),
    title: readString(sessionRow, [
      "session_type",
      "sessionType",
      "title",
      "type",
    ]),
    specialistName:
      readString(sessionRow, ["specialist_name", "specialistName"]) || "Specialist",
    specialty: readString(sessionRow, [
      "specialist_specialty",
      "specialistSpecialty",
      "specialty",
    ]),
    dateLabel,
    timeLabel,
    whenLabel: [dateLabel, timeLabel].filter(Boolean).join(" · "),
    mode: isOnline ? "Online" : "In-person",
    durationMinutes: readNumber(sessionRow, ["duration_minutes", "durationMinutes"]),
    status: readString(sessionRow, ["status"]),
    meetingUrl,
    location: meetingUrl ? null : locationOrLink,
  };
}

/**
 * Derives calendar day markers for a month from loaded session and task data.
 */
export function buildCalendarMarkersForMonth({
  sessions,
  dailyTasks,
  patientId,
  year,
  monthIndex,
}) {
  const now = new Date();
  const patientSessions = filterSessionsForPatient(sessions, patientId);
  const sessionDays = new Set();

  for (const session of patientSessions) {
    if (normalizeSessionStatus(readString(session, ["status"])) === "cancelled") {
      continue;
    }

    const dateParts = getSessionCalendarDate(session);
    if (!dateParts) {
      continue;
    }

    if (dateParts.year === year && dateParts.monthIndex === monthIndex) {
      sessionDays.add(dateParts.day);
    }
  }

  const exerciseDays = new Set();
  const isCurrentMonth = year === now.getFullYear() && monthIndex === now.getMonth();

  if (isCurrentMonth && Array.isArray(dailyTasks) && dailyTasks.length > 0) {
    exerciseDays.add(now.getDate());
  }

  return {
    sessionDays: Array.from(sessionDays).sort((left, right) => left - right),
    exerciseDays: Array.from(exerciseDays).sort((left, right) => left - right),
    todayYear: now.getFullYear(),
    todayMonthIndex: now.getMonth(),
    todayDay: now.getDate(),
  };
}

/**
 * @param {Array<Record<string, unknown>>} sessions
 * @param {string} patientId
 */
export function pickUpcomingSessionsForPatient(sessions, patientId, limit = 2) {
  return filterSessionsForPatient(sessions, patientId)
    .filter((session) => isUpcomingSession(session))
    .sort((left, right) => {
      const leftTime = new Date(left.scheduled_at ?? left.scheduledAt ?? 0).getTime();
      const rightTime = new Date(right.scheduled_at ?? right.scheduledAt ?? 0).getTime();
      return leftTime - rightTime;
    })
    .slice(0, limit)
    .map(buildUpcomingSessionViewModel);
}

export function pickNextSessionForPatient(sessions, patientId) {
  const [next] = pickUpcomingSessionsForPatient(sessions, patientId, 1);
  return next ?? null;
}

export function buildAiDashboardGuidance(exercises = []) {
  const todayTasks = exercises.filter(
    (exercise) => !exercise.due || exercise.due.toLowerCase().includes("today"),
  );
  const source = todayTasks.length > 0 ? todayTasks : exercises;
  const total = source.length;
  const completed = source.filter((exercise) => isTaskCompletedStatus(exercise.status)).length;
  const pending = Math.max(total - completed, 0);

  if (total === 0) {
    return {
      message: "Ask about exercises, reports, sessions, or home-practice guidance.",
    };
  }

  if (pending > 0) {
    return {
      message: "You still have exercises to complete today. Ask the assistant for help understanding the instructions.",
    };
  }

  return {
    message: "Today's exercises are complete. Ask the assistant for home-practice guidance.",
  };
}

function isTaskCompletedStatus(status) {
  return status === "submitted" || status === "reviewed";
}

function indexLatestSubmissions(submissions) {
  const map = new Map();

  for (const submission of submissions) {
    const assignedExerciseId = readString(submission, [
      "assigned_exercise_id",
      "assignedExerciseId",
    ]);

    if (!assignedExerciseId) {
      continue;
    }

    const submittedAt = submission.submitted_at ?? submission.submittedAt;
    const timestamp = submittedAt ? new Date(submittedAt).getTime() : 0;
    const existing = map.get(assignedExerciseId);

    if (!existing || timestamp >= existing.timestamp) {
      map.set(assignedExerciseId, { submission, timestamp });
    }
  }

  return map;
}

/**
 * Maps backend submission status to UI exercise status keys.
 * @param {Record<string, unknown>|null|undefined} submission
 */
export function resolveTaskStatus(submission) {
  if (!submission) {
    return "todo";
  }

  const status = readString(submission, ["status"])?.toLowerCase();

  if (status === "needs_retry") {
    return "needs_retry";
  }

  if (status === "reviewed") {
    return "reviewed";
  }

  if (status === "submitted" || status === "pending") {
    return "submitted";
  }

  if (status === "completed") {
    return "reviewed";
  }

  // Unknown submission statuses are treated as submitted (awaiting review).
  return "submitted";
}

function formatTaskDuration(taskRow) {
  const repetitions = readNumber(taskRow, ["repetitions"]);
  if (repetitions != null) {
    return `${repetitions} reps`;
  }

  return null;
}

/**
 * Maps daily tasks + submissions into TodaysExercisesSection exercise props.
 * @param {Array<Record<string, unknown>>} dailyTasks
 * @param {Array<Record<string, unknown>>} submissions
 */
export function mapDailyTasksToExercises(dailyTasks, submissions) {
  const submissionIndex = indexLatestSubmissions(submissions);

  return dailyTasks
    .map((taskRow) => {
      const id = readString(taskRow, ["id", "_id"]);
      if (!id) {
        return null;
      }

      const latestSubmission = submissionIndex.get(id)?.submission ?? null;
      const status = resolveTaskStatus(latestSubmission);
      const dueRaw = readTimestampValue(taskRow, ["due_date", "dueDate"]);

      return {
        id,
        title:
          readString(taskRow, ["exercise_title", "title", "name"])
          || "Exercise",
        category: readString(taskRow, [
          "exercise_type",
          "exerciseType",
          "category",
          "therapy_type",
          "therapyType",
        ]),
        duration: formatTaskDuration(taskRow),
        due: "Due Today",
        dueDateMs: dueRaw ? new Date(dueRaw).getTime() : null,
        status,
        exerciseId: readString(taskRow, ["exercise_id", "exerciseId"]),
        instructions: readString(taskRow, ["instructions", "description"]),
        instructionMediaUrl: readString(taskRow, [
          "instruction_media_url",
          "instructionMediaUrl",
        ]),
      };
    })
    .filter(Boolean);
}

function truncateInstructionPreview(text, maxLength = 120) {
  if (!text || typeof text !== "string") {
    return null;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trim()}…`;
}

function formatFrequencyLabel(frequency) {
  if (!frequency) {
    return null;
  }

  if (frequency === "one_time") {
    return "One time";
  }

  return frequency.charAt(0).toUpperCase() + frequency.slice(1);
}

/**
 * Maps assigned exercise API rows into daily-tasks hub card props.
 * @param {Array<Record<string, unknown>>} taskRows
 * @param {Array<Record<string, unknown>>} submissions
 * @param {{ id: string, fullName: string }} child
 */
export function mapTaskRowsToHubTasks(taskRows, submissions, child) {
  if (!child?.id || !Array.isArray(taskRows)) {
    return [];
  }

  const submissionIndex = indexLatestSubmissions(submissions);

  return taskRows
    .map((taskRow) => {
      const id = readString(taskRow, ["id", "_id"]);
      if (!id) {
        return null;
      }

      const latestSubmission = submissionIndex.get(id)?.submission ?? null;
      const status = resolveTaskStatus(latestSubmission);
      const instructions = readString(taskRow, ["instructions", "description"]);
      const instructionRaw = readString(taskRow, [
        "instruction_media_url",
        "instructionMediaUrl",
      ]);
      const dueRaw = readTimestampValue(taskRow, ["due_date", "dueDate"]);
      const createdRaw = readTimestampValue(taskRow, ["created_at", "createdAt"]);
      const frequency = readString(taskRow, ["frequency"]);

      return {
        id,
        patientId: child.id,
        childName: child.fullName,
        title: readString(taskRow, ["exercise_title", "title", "name"]) || "Exercise",
        status,
        frequency: formatFrequencyLabel(frequency),
        dueDate: formatDisplayDate(dueRaw),
        dueDateMs: dueRaw ? new Date(dueRaw).getTime() : null,
        instructions,
        instructionPreview: truncateInstructionPreview(instructions),
        hasInstructionMedia: Boolean(instructionRaw?.trim()),
        exerciseId: readString(taskRow, ["exercise_id", "exerciseId"]),
        createdAtMs: createdRaw ? new Date(createdRaw).getTime() : null,
      };
    })
    .filter(Boolean);
}

/**
 * Builds SummaryStrip summary props from live child data.
 */
export function buildSummaryStrip({
  exercises,
  upcomingSession,
  overallPercent,
}) {
  const completed = exercises.filter((exercise) => isTaskCompletedStatus(exercise.status)).length;

  return {
    todaysExercises: exercises.length,
    completed,
    remaining: Math.max(exercises.length - completed, 0),
    nextSessionLabel: upcomingSession?.dateLabel || "—",
    nextSessionDetail: upcomingSession?.whenLabel || "No session scheduled",
    overallProgress: `${overallPercent ?? 0}%`,
    overallProgressPercent: overallPercent ?? 0,
  };
}

/**
 * Builds hero, task list, and summary data for the selected child.
 */
export function buildChildViewModel({
  child,
  improvement,
  dailyTasks,
  submissions,
  sessions,
  patientId,
}) {
  const exercises = mapDailyTasksToExercises(dailyTasks, submissions);
  const upcomingSession = pickNextSessionForPatient(sessions, patientId);

  const improvementPercent = readNumber(improvement, [
    "improvement_percentage",
    "improvementPercentage",
    "percentage",
  ]);

  const overallPercent = normalizePercent(
    improvementPercent ?? child?.progressPercent ?? 0,
  );

  const completed = exercises.filter((exercise) => isTaskCompletedStatus(exercise.status)).length;

  const hero = {
    child: {
      id: child.id,
      fullName: child.fullName,
      initials: child.initials,
      profileImageUrl: child.profileImageUrl,
      status: child.status,
    },
    progress: {
      overallPercent,
      trendDelta: improvementPercent != null && improvementPercent !== 0
        ? `${improvementPercent > 0 ? "+" : ""}${Math.round(improvementPercent)}% improvement`
        : null,
    },
    summary: {
      completed,
      todaysExercises: exercises.length,
    },
    weeklyProgress: {
      completedCount: completed,
    },
    upcomingSession,
  };

  const summary = buildSummaryStrip({
    exercises,
    upcomingSession,
    overallPercent,
  });

  return {
    hero,
    exercises,
    summary,
  };
}

/**
 * Builds the hero card view model from API payloads.
 * @deprecated Prefer buildChildViewModel for consolidated child-scoped mapping.
 */
export function buildHeroViewModel({ child, improvement, dailyTasks, upcomingSession }) {
  const exercises = mapDailyTasksToExercises(dailyTasks, []);
  const improvementPercent = readNumber(improvement, [
    "improvement_percentage",
    "improvementPercentage",
    "percentage",
  ]);

  const overallPercent = normalizePercent(
    improvementPercent ?? child?.progressPercent ?? 0,
  );

  const completed = exercises.filter((exercise) => isTaskCompletedStatus(exercise.status)).length;

  return {
    child: {
      id: child.id,
      fullName: child.fullName,
      initials: child.initials,
      profileImageUrl: child.profileImageUrl,
      status: child.status,
    },
    progress: {
      overallPercent,
      trendDelta: improvementPercent != null && improvementPercent !== 0
        ? `${improvementPercent > 0 ? "+" : ""}${Math.round(improvementPercent)}% improvement`
        : null,
    },
    summary: {
      completed,
      todaysExercises: exercises.length,
    },
    weeklyProgress: {
      completedCount: completed,
    },
    upcomingSession,
  };
}

const REPORT_TIMESTAMP_KEYS = [
  "generated_at",
  "generatedAt",
  "report_date",
  "reportDate",
  "created_at",
  "createdAt",
  "updated_at",
  "updatedAt",
];

const REVIEW_TIMESTAMP_KEYS = [
  "reviewed_at",
  "reviewedAt",
  "created_at",
  "createdAt",
  "updated_at",
  "updatedAt",
  "submitted_at",
  "submittedAt",
];

function formatDisplayDate(dateValue) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function readTimestampValue(entity, keys) {
  if (!entity || typeof entity !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = entity[key];
    if (value != null && value !== "") {
      return value;
    }
  }

  return null;
}

/**
 * Reads the first valid timestamp from an entity as epoch milliseconds.
 * @param {Record<string, unknown>|null|undefined} entity
 * @param {string[]} keys
 */
export function getEntityTimestamp(entity, keys) {
  const rawValue = readTimestampValue(entity, keys);
  if (rawValue == null) {
    return null;
  }

  const time = new Date(rawValue).getTime();
  return Number.isNaN(time) ? null : time;
}

/**
 * Picks the newest item from a list using timestamp keys (non-mutating).
 * @param {Array<Record<string, unknown>>} items
 * @param {string[]} timestampKeys
 */
export function pickLatestByTimestamp(items, timestampKeys) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  let latestItem = null;
  let latestTime = Number.NEGATIVE_INFINITY;

  for (const item of items) {
    const timestamp = getEntityTimestamp(item, timestampKeys);
    if (timestamp == null) {
      continue;
    }

    if (timestamp > latestTime) {
      latestTime = timestamp;
      latestItem = item;
    }
  }

  if (latestItem) {
    return latestItem;
  }

  return items[0] ?? null;
}

/**
 * @param {Array<Record<string, unknown>>} reports
 */
export function pickLatestReport(reports) {
  return pickLatestByTimestamp(reports, REPORT_TIMESTAMP_KEYS);
}

/**
 * @param {Array<Record<string, unknown>>} reviews
 */
export function pickLatestReview(reviews) {
  return pickLatestByTimestamp(reviews, REVIEW_TIMESTAMP_KEYS);
}

/**
 * Classifies instruction/submission media URLs for read-only display.
 * @param {string|null|undefined} url
 */
export function guessMediaKind(url) {
  if (!url || typeof url !== "string") {
    return "unknown";
  }

  const lower = url.toLowerCase();

  if (
    lower.includes(".mp4")
    || lower.includes(".mov")
    || lower.includes(".webm")
    || lower.includes("video")
  ) {
    return "video";
  }

  if (
    lower.includes(".mp3")
    || lower.includes(".m4a")
    || lower.includes(".wav")
    || lower.includes(".aac")
    || lower.includes(".ogg")
    || lower.includes("audio")
  ) {
    return "audio";
  }

  if (lower.includes(".pdf")) {
    return "pdf";
  }

  if (
    lower.includes(".jpg")
    || lower.includes(".jpeg")
    || lower.includes(".png")
    || lower.includes(".webp")
    || lower.includes(".gif")
    || lower.includes("image")
  ) {
    return "image";
  }

  return "unknown";
}

function getLatestSubmissionForAssignment(submissions, assignedExerciseId) {
  if (!assignedExerciseId || !Array.isArray(submissions)) {
    return null;
  }

  const index = indexLatestSubmissions(submissions);
  return index.get(assignedExerciseId)?.submission ?? null;
}

/**
 * Maps an assigned exercise API row + patient submissions into exercise detail props.
 * @param {Record<string, unknown>|null|undefined} assignmentRow
 * @param {Array<Record<string, unknown>>} submissions
 */
export function buildExerciseDetailViewModel(assignmentRow, submissions = []) {
  if (!assignmentRow || typeof assignmentRow !== "object") {
    return null;
  }

  const id = readString(assignmentRow, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const latestSubmission = getLatestSubmissionForAssignment(submissions, id);
  const dueRaw = readTimestampValue(assignmentRow, ["due_date", "dueDate"]);
  const instructionRaw = readString(assignmentRow, [
    "instruction_media_url",
    "instructionMediaUrl",
  ]);

  return {
    id,
    title: readString(assignmentRow, ["exercise_title", "title", "name"]) || "Exercise",
    childName: readString(assignmentRow, ["patient_name", "patientName"]),
    patientId: readString(assignmentRow, ["patient_id", "patientId"]),
    exerciseId: readString(assignmentRow, ["exercise_id", "exerciseId"]),
    instructions: readString(assignmentRow, ["instructions", "description"]),
    frequency: readString(assignmentRow, ["frequency"]),
    dueDate: formatDisplayDate(dueRaw),
    instructionMediaUrl: resolveReportFileUrl(instructionRaw),
    instructionMediaKind: instructionRaw ? guessMediaKind(instructionRaw) : null,
    status: resolveTaskStatus(latestSubmission),
  };
}

/**
 * Resolves report PDF/file URLs, including relative /uploads paths.
 * @param {string|null|undefined} fileUrl
 */
export function resolveReportFileUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") {
    return null;
  }

  const trimmed = fileUrl.trim();
  const httpUrl = extractMeetingUrl(trimmed);
  if (httpUrl) {
    return resolveUploadedAssetUrl(httpUrl) ?? httpUrl;
  }

  return resolveUploadedAssetUrl(trimmed);
}

/**
 * Maps the latest report row into LatestUpdatesSection props.
 * @param {Record<string, unknown>|null|undefined} reportRow
 */
export function buildLatestReportViewModel(reportRow) {
  if (!reportRow) {
    return null;
  }

  const id = readString(reportRow, ["id", "_id"]);
  const title = readString(reportRow, ["title", "report_title", "name"]);
  if (!id && !title) {
    return null;
  }

  const timestampValue = readTimestampValue(reportRow, REPORT_TIMESTAMP_KEYS);
  const summary = readString(reportRow, ["summary", "description", "content"]);
  const pdfUrl = resolveReportFileUrl(
    readString(reportRow, ["pdf_url", "pdfUrl", "file_url", "fileUrl"]),
  );

  return {
    id,
    title: title || "Progress Report",
    reportType: readString(reportRow, ["report_type", "reportType", "type"]),
    date: formatDisplayDate(timestampValue),
    preview: summary,
    status: readString(reportRow, ["status"]),
    pdfUrl,
    authorName: readString(reportRow, [
      "generated_by_name",
      "generatedByName",
      "author_name",
      "authorName",
    ]),
  };
}

/**
 * Maps the latest review row into LatestUpdatesSection props.
 * @param {Record<string, unknown>|null|undefined} reviewRow
 */
export function buildLatestFeedbackViewModel(reviewRow) {
  if (!reviewRow) {
    return null;
  }

  const quote = readString(reviewRow, [
    "feedback",
    "comments",
    "review_notes",
    "notes",
  ]) || "Review available for the latest exercise submission.";

  const timestampValue = readTimestampValue(reviewRow, REVIEW_TIMESTAMP_KEYS);
  const specialistName =
    readString(reviewRow, ["specialist_name", "specialistName"]) || "Specialist";

  return {
    id: readString(reviewRow, ["id", "_id"]),
    specialistName,
    specialty: readString(reviewRow, [
      "specialist_specialty",
      "specialistSpecialty",
      "specialty",
    ]),
    date: formatDisplayDate(timestampValue),
    quote,
    status: readString(reviewRow, ["status"]),
    rating: readNumber(reviewRow, [
      "performance_rating",
      "performanceRating",
      "rating",
    ]),
    exerciseTitle: readString(reviewRow, ["exercise_title", "exerciseTitle"]),
  };
}

function readBoolean(source, keys) {
  if (!source || typeof source !== "object") {
    return false;
  }

  for (const key of keys) {
    const value = source[key];
    if (value === true || value === false) {
      return value;
    }
  }

  return false;
}

/**
 * Maps a review row to a UI status key (needs_retry or reviewed).
 * @param {Record<string, unknown>|null|undefined} reviewRow
 */
export function resolveReviewDisplayStatus(reviewRow) {
  if (!reviewRow) {
    return "reviewed";
  }

  return readBoolean(reviewRow, ["requires_retry", "requiresRetry"])
    ? "needs_retry"
    : "reviewed";
}

/**
 * Maps a single backend review row into a feedback hub item.
 * @param {Record<string, unknown>} reviewRow
 * @param {{ id?: string, fullName?: string }|null|undefined} child
 */
export function mapReviewRowToFeedbackItem(reviewRow, child) {
  const id = readString(reviewRow, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const timestampValue = readTimestampValue(reviewRow, REVIEW_TIMESTAMP_KEYS);
  const reviewedAtMs = getEntityTimestamp(reviewRow, REVIEW_TIMESTAMP_KEYS);
  const requiresRetry = readBoolean(reviewRow, ["requires_retry", "requiresRetry"]);
  const feedback = readString(reviewRow, [
    "feedback",
    "comments",
    "review_notes",
    "notes",
  ]);

  return {
    id,
    submissionId: readString(reviewRow, ["submission_id", "submissionId"]),
    patientId: child?.id ?? null,
    childName: child?.fullName ?? null,
    exerciseTitle: readString(reviewRow, ["exercise_title", "exerciseTitle"]),
    specialistName: readString(reviewRow, ["specialist_name", "specialistName"]),
    feedback,
    performanceRating: readNumber(reviewRow, [
      "performance_rating",
      "performanceRating",
      "rating",
    ]),
    requiresRetry,
    status: resolveReviewDisplayStatus(reviewRow),
    reviewedAt: formatDisplayDate(timestampValue),
    reviewedAtMs,
  };
}

/**
 * Maps backend review rows for one child into feedback hub items.
 * @param {Array<Record<string, unknown>>} reviews
 * @param {{ id?: string, fullName?: string }|null|undefined} child
 */
export function mapReviewRowsToFeedbackItems(reviews, child) {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews
    .map((reviewRow) => mapReviewRowToFeedbackItem(reviewRow, child))
    .filter(Boolean);
}

/**
 * Builds Latest Updates view models from patient reports and reviews.
 */
export function buildLatestUpdatesViewModel({ reports, reviews }) {
  return {
    latestReport: buildLatestReportViewModel(pickLatestReport(reports)),
    recentFeedback: buildLatestFeedbackViewModel(pickLatestReview(reviews)),
  };
}

const NOTIFICATION_TIMESTAMP_KEYS = [
  "created_at",
  "createdAt",
  "sent_at",
  "sentAt",
  "updated_at",
  "updatedAt",
];

function formatTimeAgo(dateValue) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return "Just now";
  }

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * @param {Record<string, unknown>|null|undefined} notification
 */
export function getNotificationTimestamp(notification) {
  return getEntityTimestamp(notification, NOTIFICATION_TIMESTAMP_KEYS);
}

/**
 * @param {Array<Record<string, unknown>>} notifications
 */
export function sortNotificationsNewestFirst(notifications) {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return [...notifications].sort((left, right) => {
    const leftTime = getNotificationTimestamp(left) ?? 0;
    const rightTime = getNotificationTimestamp(right) ?? 0;
    return rightTime - leftTime;
  });
}

/**
 * @param {string|null|undefined} type
 */
export function normalizeNotificationType(type) {
  if (!type || typeof type !== "string") {
    return "default";
  }

  return type.trim().toLowerCase().replace(/-/g, "_");
}

/**
 * Maps backend notification type to popover icon/tone props.
 * @param {string|null|undefined} type
 */
export function mapNotificationTypeToUi(type) {
  const normalized = normalizeNotificationType(type);

  if (normalized === "new_message") {
    return { icon: "message", tone: "blue" };
  }

  if (
    normalized.includes("session")
    || normalized.includes("case_request")
  ) {
    return { icon: "calendar", tone: "green" };
  }

  if (normalized.includes("report")) {
    return { icon: "report", tone: "purple" };
  }

  if (
    normalized.includes("review")
    || normalized.includes("feedback")
    || normalized.includes("exercise")
  ) {
    return { icon: "message", tone: "blue" };
  }

  if (normalized === "general") {
    return { icon: "message", tone: "gray" };
  }

  return { icon: "message", tone: "gray" };
}

function isNotificationRead(notification) {
  return notification.is_read === true || notification.isRead === true;
}

/**
 * @param {Record<string, unknown>} notificationRow
 */
export function buildNotificationViewModel(notificationRow) {
  const id = readString(notificationRow, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const type = readString(notificationRow, ["type", "category"]);
  const { icon, tone } = mapNotificationTypeToUi(type);
  const timestampValue = readTimestampValue(notificationRow, NOTIFICATION_TIMESTAMP_KEYS);

  return {
    id,
    title: readString(notificationRow, ["title", "subject"]) || "Notification",
    body: readString(notificationRow, ["body", "message"]),
    type,
    timeAgo: formatTimeAgo(timestampValue) || "Recently",
    unread: !isNotificationRead(notificationRow),
    tone,
    icon,
    relatedEntityType: readString(notificationRow, [
      "related_entity_type",
      "relatedEntityType",
    ]),
    relatedEntityId: readString(notificationRow, [
      "related_entity_id",
      "relatedEntityId",
    ]),
    createdAt: timestampValue,
  };
}

/**
 * @param {Array<Record<string, unknown>>} notificationRows
 */
export function mapNotificationsToViewModels(notificationRows) {
  return sortNotificationsNewestFirst(notificationRows)
    .map((row) => buildNotificationViewModel(row))
    .filter(Boolean);
}

/**
 * @param {Array<{ unread?: boolean }>} notifications
 */
export function countUnreadNotifications(notifications) {
  if (!Array.isArray(notifications)) {
    return 0;
  }

  return notifications.filter((item) => item.unread).length;
}

/**
 * Counts unread chat/message notifications (type new_message only).
 * @param {Array<{ unread?: boolean, type?: string|null }>} notifications
 */
export function countUnreadMessageNotifications(notifications) {
  if (!Array.isArray(notifications)) {
    return 0;
  }

  return notifications.filter(
    (item) => item.unread && normalizeNotificationType(item.type) === "new_message",
  ).length;
}

export function getConversationMessageNotifications(notifications, conversationId) {
  if (!conversationId || !Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter((item) => (
    item.unread
    && normalizeNotificationType(item.type) === "new_message"
    && item.relatedEntityType?.trim().toLowerCase() === "conversation"
    && item.relatedEntityId === conversationId
  ));
}

/**
 * @param {number} count
 */
export function formatNotificationBadgeCount(count) {
  if (!Number.isFinite(count) || count <= 0) {
    return 0;
  }

  return count;
}

const ACTIONABLE_EXERCISE_STATUSES = new Set(["todo", "needs_retry"]);

/** Parent submission media — matches backend exercise-submission upload limits. */
export const SUBMISSION_MEDIA_MAX_BYTES = 50 * 1024 * 1024;

export const SUBMISSION_MEDIA_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
].join(",");

const SUBMISSION_MEDIA_EXTENSION_TYPES = {
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".webp": "image",
  ".mp4": "video",
  ".mov": "video",
  ".mp3": "audio",
  ".m4a": "audio",
  ".wav": "audio",
  ".aac": "audio",
};

/**
 * Detects submission media_type enum value from a browser File.
 * @param {File|null|undefined} file
 * @returns {"image"|"video"|"audio"|null}
 */
export function detectSubmissionMediaTypeFromFile(file) {
  if (!file) {
    return null;
  }

  const mime = String(file.type || "").toLowerCase().trim();

  if (mime === "application/pdf" || mime.includes("pdf")) {
    return null;
  }

  if (mime.startsWith("image/")) {
    return "image";
  }

  if (mime.startsWith("video/")) {
    return "video";
  }

  if (mime.startsWith("audio/")) {
    return "audio";
  }

  const name = String(file.name || "");
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) {
    return null;
  }

  return SUBMISSION_MEDIA_EXTENSION_TYPES[name.slice(dotIndex).toLowerCase()] ?? null;
}

/**
 * @param {number|null|undefined} bytes
 */
export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(bytes)) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validates a selected submission media file before upload.
 * @param {File|null|undefined} file
 */
export function validateSubmissionMediaFile(file) {
  if (!file) {
    return { valid: true, mediaType: null, error: null };
  }

  const mediaType = detectSubmissionMediaTypeFromFile(file);
  if (!mediaType) {
    return {
      valid: false,
      mediaType: null,
      error: "This file type is not supported. Use an image, video, or audio file.",
    };
  }

  if (file.size > SUBMISSION_MEDIA_MAX_BYTES) {
    return {
      valid: false,
      mediaType: null,
      error: "File exceeds 50 MB. Choose a smaller file.",
    };
  }

  return { valid: true, mediaType, error: null };
}

/**
 * @param {string|null|undefined} status UI exercise status key
 */
export function getExerciseSubmissionStateMessage(status) {
  if (status === "submitted") {
    return "This exercise has been submitted and is awaiting specialist review.";
  }

  if (status === "reviewed") {
    return "This exercise has been reviewed by the specialist.";
  }

  if (status === "needs_retry") {
    return "The specialist asked for this exercise to be done again. Submit a new recording or notes below.";
  }

  return null;
}

/**
 * @param {string|null|undefined} status
 */
export function isExerciseActionable(status) {
  return ACTIONABLE_EXERCISE_STATUSES.has(status);
}

const DASHBOARD_TASK_STATUS_RANK = {
  needs_retry: 0,
  todo: 1,
  submitted: 2,
  reviewed: 3,
};

const DASHBOARD_TASKS_VISIBLE_LIMIT = 4;

/**
 * Selects up to 4 dashboard Today's Tasks rows by status priority and due date.
 * Preserves original backend order as a stable fallback within each status group.
 * @param {Array<{ status?: string, dueDateMs?: number|null }>} exercises
 * @param {number} [limit=4]
 */
export function getDashboardPriorityTasks(exercises, limit = DASHBOARD_TASKS_VISIBLE_LIMIT) {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return [];
  }

  const indexed = exercises.map((exercise, index) => ({ exercise, index }));

  const sorted = [...indexed].sort((left, right) => {
    const leftRank = DASHBOARD_TASK_STATUS_RANK[left.exercise.status] ?? 99;
    const rightRank = DASHBOARD_TASK_STATUS_RANK[right.exercise.status] ?? 99;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    const leftDue = left.exercise.dueDateMs;
    const rightDue = right.exercise.dueDateMs;
    const leftHasDue = leftDue != null && !Number.isNaN(leftDue);
    const rightHasDue = rightDue != null && !Number.isNaN(rightDue);

    if (leftHasDue && rightHasDue && leftDue !== rightDue) {
      return leftDue - rightDue;
    }

    if (leftHasDue && !rightHasDue) {
      return -1;
    }

    if (!leftHasDue && rightHasDue) {
      return 1;
    }

    return left.index - right.index;
  });

  return sorted.slice(0, limit).map(({ exercise }) => exercise);
}

/**
 * Finds the next actionable exercise: needs_retry first, then todo.
 * @param {Array<{ id: string, status: string }>} exercises
 */
export function findActionableExercise(exercises) {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return null;
  }

  const needsRetry = exercises.find((exercise) => exercise.status === "needs_retry");
  if (needsRetry) {
    return needsRetry;
  }

  return exercises.find((exercise) => exercise.status === "todo") ?? null;
}

/**
 * Resolves a notification to an in-app route when one exists.
 * Returns null when no web route is registered for the notification target.
 * @param {{ type?: string|null, relatedEntityType?: string|null, relatedEntityId?: string|null }} notification
 */
export function resolveNotificationRoute(notification) {
  if (!notification?.relatedEntityId) {
    return null;
  }

  const entityType = notification.relatedEntityType?.trim().toLowerCase();
  const type = normalizeNotificationType(notification.type);

  if (entityType === "report" || type === "report_ready") {
    return buildParentReportDetailPath(notification.relatedEntityId);
  }

  if (entityType === "session" || type === "session_reminder") {
    return buildParentSessionsPath(null);
  }

  if (
    entityType === "exercise_review"
    || type === "feedback_received"
  ) {
    return PARENT_WEB_ROUTES.feedback;
  }

  return null;
}
