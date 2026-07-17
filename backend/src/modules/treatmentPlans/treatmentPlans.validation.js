const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TITLE_MAX = 200;
const PLAN_STATUSES = new Set(["active", "completed", "archived"]);

const isValidUuid = (value) => UUID_RE.test(String(value || "").trim());

const trimOrNull = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const text = String(value).trim();
  return text.length === 0 ? null : text;
};

const isValidDateOnly = (value) => {
  const text = String(value || "").trim();
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

const stripClientOwnedFields = (body) => {
  const next = { ...(body || {}) };
  delete next.specialist_id;
  delete next.specialistId;
  delete next.patient_id;
  delete next.patientId;
  delete next.description;
  return next;
};

const validateCreateTreatmentPlan = (req, res, next) => {
  const body = req.body || {};

  // Never accept client-owned identity/status fields on create.
  delete body.specialist_id;
  delete body.specialistId;
  delete body.status;
  delete body.description;

  const patientId = String(body.patient_id || body.patientId || "").trim();
  const title = String(body.title || "").trim();
  const startDate = trimOrNull(body.start_date || body.startDate);
  const endDate = trimOrNull(body.end_date || body.endDate);
  const assessmentId = trimOrNull(
    body.based_on_assessment_id || body.basedOnAssessmentId
  );

  if (!patientId) {
    return res.status(400).json({
      success: false,
      message: "patient_id is required.",
    });
  }

  if (!isValidUuid(patientId)) {
    return res.status(400).json({
      success: false,
      message: "patient_id must be a valid UUID.",
    });
  }

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "title is required.",
    });
  }

  if (title.length > TITLE_MAX) {
    return res.status(400).json({
      success: false,
      message: `title must be at most ${TITLE_MAX} characters.`,
    });
  }

  if (startDate && !isValidDateOnly(startDate)) {
    return res.status(400).json({
      success: false,
      message: "start_date must be a valid date (YYYY-MM-DD).",
    });
  }

  if (endDate && !isValidDateOnly(endDate)) {
    return res.status(400).json({
      success: false,
      message: "end_date must be a valid date (YYYY-MM-DD).",
    });
  }

  if (startDate && endDate && endDate < startDate) {
    return res.status(400).json({
      success: false,
      message: "end_date cannot be before start_date.",
    });
  }

  if (assessmentId && !isValidUuid(assessmentId)) {
    return res.status(400).json({
      success: false,
      message: "based_on_assessment_id must be a valid UUID.",
    });
  }

  req.body = {
    patient_id: patientId,
    title,
    start_date: startDate,
    end_date: endDate,
    based_on_assessment_id: assessmentId,
  };

  next();
};

const validateUpdateTreatmentPlan = (req, res, next) => {
  const body = stripClientOwnedFields(req.body || {});
  const nextBody = {};

  if (Object.prototype.hasOwnProperty.call(body, "title")) {
    const title = String(body.title || "").trim();
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title cannot be empty.",
      });
    }
    if (title.length > TITLE_MAX) {
      return res.status(400).json({
        success: false,
        message: `title must be at most ${TITLE_MAX} characters.`,
      });
    }
    nextBody.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    const status = String(body.status || "")
      .trim()
      .toLowerCase();
    if (!PLAN_STATUSES.has(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be active, completed, or archived.",
      });
    }
    nextBody.status = status;
  }

  const hasStart = Object.prototype.hasOwnProperty.call(body, "start_date") ||
    Object.prototype.hasOwnProperty.call(body, "startDate");
  const hasEnd = Object.prototype.hasOwnProperty.call(body, "end_date") ||
    Object.prototype.hasOwnProperty.call(body, "endDate");

  if (hasStart) {
    const startDate = trimOrNull(body.start_date || body.startDate);
    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "start_date cannot be empty.",
      });
    }
    if (!isValidDateOnly(startDate)) {
      return res.status(400).json({
        success: false,
        message: "start_date must be a valid date (YYYY-MM-DD).",
      });
    }
    nextBody.start_date = startDate;
  }

  if (hasEnd) {
    const rawEnd = body.end_date ?? body.endDate;
    if (rawEnd === null || rawEnd === "") {
      nextBody.end_date = null;
    } else {
      const endDate = trimOrNull(rawEnd);
      if (!endDate || !isValidDateOnly(endDate)) {
        return res.status(400).json({
          success: false,
          message: "end_date must be a valid date (YYYY-MM-DD).",
        });
      }
      nextBody.end_date = endDate;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "based_on_assessment_id") ||
    Object.prototype.hasOwnProperty.call(body, "basedOnAssessmentId")) {
    const assessmentId = trimOrNull(
      body.based_on_assessment_id ?? body.basedOnAssessmentId
    );
    if (assessmentId && !isValidUuid(assessmentId)) {
      return res.status(400).json({
        success: false,
        message: "based_on_assessment_id must be a valid UUID.",
      });
    }
    nextBody.based_on_assessment_id = assessmentId;
  }

  if (Object.prototype.hasOwnProperty.call(body, "change_summary") ||
    Object.prototype.hasOwnProperty.call(body, "changeSummary")) {
    nextBody.change_summary = trimOrNull(
      body.change_summary || body.changeSummary
    );
  }

  if (Object.keys(nextBody).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one field to update.",
    });
  }

  req.body = nextBody;
  next();
};

const validatePlanIdParam = (req, res, next) => {
  const id = String(req.params.id || "").trim();
  if (!isValidUuid(id)) {
    return res.status(400).json({
      success: false,
      message: "Treatment plan id must be a valid UUID.",
    });
  }
  next();
};

module.exports = {
  validateCreateTreatmentPlan,
  validateUpdateTreatmentPlan,
  validatePlanIdParam,
};
