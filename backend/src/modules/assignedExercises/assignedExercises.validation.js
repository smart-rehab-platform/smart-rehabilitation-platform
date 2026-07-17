const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_FREQUENCIES = new Set(["daily", "weekly", "one_time"]);

const isValidUuid = (value) => UUID_RE.test(String(value || "").trim());

const isValidDateOnly = (value) => {
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false;
  }

  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const validateCreateAssignedExercise = (req, res, next) => {
  const { exercise_id, plan_id, patient_id, frequency, start_date, due_date } =
    req.body || {};

  if (!exercise_id || !plan_id || !patient_id) {
    return res.status(400).json({
      success: false,
      message: "exercise_id, plan_id, and patient_id are required"
    });
  }

  if (
    !isValidUuid(exercise_id) ||
    !isValidUuid(plan_id) ||
    !isValidUuid(patient_id)
  ) {
    return res.status(400).json({
      success: false,
      message: "exercise_id, plan_id, and patient_id must be valid UUIDs."
    });
  }

  if (
    frequency !== undefined &&
    frequency !== null &&
    String(frequency).trim() !== ""
  ) {
    const normalized = String(frequency).trim().toLowerCase();
    if (!ALLOWED_FREQUENCIES.has(normalized)) {
      return res.status(400).json({
        success: false,
        message: "frequency must be one of: daily, weekly, one_time."
      });
    }
    req.body.frequency = normalized;
  }

  if (
    start_date !== undefined &&
    start_date !== null &&
    String(start_date).trim() !== ""
  ) {
    if (!isValidDateOnly(start_date)) {
      return res.status(400).json({
        success: false,
        message: "start_date must be a valid date (YYYY-MM-DD)."
      });
    }
  }

  if (
    due_date !== undefined &&
    due_date !== null &&
    String(due_date).trim() !== ""
  ) {
    if (!isValidDateOnly(due_date)) {
      return res.status(400).json({
        success: false,
        message: "due_date must be a valid date (YYYY-MM-DD)."
      });
    }
  }

  const hasStart =
    start_date !== undefined &&
    start_date !== null &&
    String(start_date).trim() !== "";
  const hasDue =
    due_date !== undefined &&
    due_date !== null &&
    String(due_date).trim() !== "";

  if (hasStart && hasDue && String(due_date).trim() < String(start_date).trim()) {
    return res.status(400).json({
      success: false,
      message: "Due date cannot be before the start date."
    });
  }

  // Never trust client-provided assigned_by.
  if (Object.prototype.hasOwnProperty.call(req.body || {}, "assigned_by")) {
    delete req.body.assigned_by;
  }

  next();
};

const validateUpdateAssignedExercise = (req, res, next) => {
  const allowedFields = ["frequency", "start_date", "due_date", "is_active"];
  const bodyFields = Object.keys(req.body || {});

  const invalidFields = bodyFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid fields: ${invalidFields.join(", ")}`
    });
  }

  next();
};

module.exports = {
  validateCreateAssignedExercise,
  validateUpdateAssignedExercise
};
