const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SESSION_REQUEST_REASONS = [
  "regular_follow_up",
  "replacement_cancelled",
  "replacement_missed",
  "additional_session",
  "consultation",
  "other",
];

const PREFERRED_TIME_PERIODS = ["morning", "afternoon", "evening", "flexible"];

const SESSION_REQUEST_STATUSES = ["pending", "approved", "rejected"];

const isValidUuid = (value) =>
  typeof value === "string" && UUID_REGEX.test(value.trim());

const isValidDateString = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return false;
  }

  const trimmed = value.trim();
  const date = new Date(`${trimmed}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const [year, month, day] = trimmed.split("-").map(Number);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
};

const isNotPastDate = (value) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const preferred = new Date(`${value.trim()}T00:00:00.000Z`);

  return preferred >= today;
};

const validateStatusQuery = (req, res, next) => {
  const { status } = req.query;

  if (status === undefined || status === null || status === "") {
    return next();
  }

  if (typeof status !== "string" || !SESSION_REQUEST_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "status must be one of: pending, approved, rejected",
    });
  }

  next();
};

const validateCreateSessionRequest = (req, res, next) => {
  const {
    patient_id,
    specialist_id,
    reason,
    reason_other_text,
    preferred_date,
    preferred_time_period,
    notes,
    parent_id,
  } = req.body || {};

  if (parent_id !== undefined) {
    return res.status(400).json({
      success: false,
      message: "parent_id must not be sent in the request body",
    });
  }

  if (!patient_id || !isValidUuid(patient_id)) {
    return res.status(400).json({
      success: false,
      message: "patient_id must be a valid UUID",
    });
  }

  if (!specialist_id || !isValidUuid(specialist_id)) {
    return res.status(400).json({
      success: false,
      message: "specialist_id must be a valid UUID",
    });
  }

  if (!reason || !SESSION_REQUEST_REASONS.includes(reason)) {
    return res.status(400).json({
      success: false,
      message:
        "reason must be one of: regular_follow_up, replacement_cancelled, replacement_missed, additional_session, consultation, other",
    });
  }

  if (reason === "other") {
    if (
      reason_other_text === undefined ||
      reason_other_text === null ||
      typeof reason_other_text !== "string" ||
      !reason_other_text.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "reason_other_text is required when reason is other",
      });
    }
  } else if (
    reason_other_text !== undefined &&
    reason_other_text !== null &&
    typeof reason_other_text !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "reason_other_text must be a string when provided",
    });
  }

  if (!preferred_date) {
    return res.status(400).json({
      success: false,
      message: "preferred_date is required",
    });
  }

  if (!isValidDateString(preferred_date)) {
    return res.status(400).json({
      success: false,
      message: "preferred_date must be a valid date in YYYY-MM-DD format",
    });
  }

  if (!isNotPastDate(preferred_date)) {
    return res.status(400).json({
      success: false,
      message: "preferred_date cannot be in the past",
    });
  }

  if (
    !preferred_time_period ||
    !PREFERRED_TIME_PERIODS.includes(preferred_time_period)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "preferred_time_period must be one of: morning, afternoon, evening, flexible",
    });
  }

  if (notes !== undefined && notes !== null && typeof notes !== "string") {
    return res.status(400).json({
      success: false,
      message: "notes must be a string when provided",
    });
  }

  next();
};

const validateRequestIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!id || !isValidUuid(id)) {
    return res.status(400).json({
      success: false,
      message: "id must be a valid UUID",
    });
  }

  next();
};

const isValidIsoDateTime = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  const parsed = new Date(value.trim());

  return !Number.isNaN(parsed.getTime());
};

const isFutureDateTime = (value) => {
  const parsed = new Date(value.trim());

  return parsed.getTime() > Date.now();
};

const validateApproveSessionRequest = (req, res, next) => {
  const { scheduled_at, duration_minutes, location_or_link } = req.body || {};

  if (!scheduled_at) {
    return res.status(400).json({
      success: false,
      message: "scheduled_at is required",
    });
  }

  if (!isValidIsoDateTime(scheduled_at)) {
    return res.status(400).json({
      success: false,
      message: "scheduled_at must be a valid ISO datetime",
    });
  }

  if (!isFutureDateTime(scheduled_at)) {
    return res.status(400).json({
      success: false,
      message: "scheduled_at must be in the future",
    });
  }

  if (duration_minutes !== undefined && duration_minutes !== null) {
    const numericDuration = Number(duration_minutes);

    if (
      !Number.isInteger(numericDuration) ||
      numericDuration < 1 ||
      numericDuration > 480
    ) {
      return res.status(400).json({
        success: false,
        message: "duration_minutes must be an integer between 1 and 480",
      });
    }
  }

  if (
    location_or_link !== undefined &&
    location_or_link !== null &&
    typeof location_or_link !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "location_or_link must be a string when provided",
    });
  }

  next();
};

const validateRejectSessionRequest = (req, res, next) => {
  const { rejection_reason } = req.body || {};

  if (
    rejection_reason === undefined ||
    rejection_reason === null ||
    typeof rejection_reason !== "string" ||
    !rejection_reason.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "rejection_reason is required",
    });
  }

  next();
};

module.exports = {
  validateCreateSessionRequest,
  validateStatusQuery,
  validateRequestIdParam,
  validateApproveSessionRequest,
  validateRejectSessionRequest,
};
