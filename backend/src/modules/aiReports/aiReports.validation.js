const {
  DEFAULT_AI_REPORT_LANGUAGE,
  parseAiReportLanguage,
} = require("./aiReportLanguage");
const {
  ALLOWED_UPDATE_KEYS,
  extractEditableUpdates,
} = require("./aiReportDraft.edit");

const validateGenerateReport = (req, res, next) => {
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, "specialist_id")) {
    delete req.body.specialist_id;
  }

  const { patient_id, period_start, period_end } = req.body;

  if (!patient_id || !period_start || !period_end) {
    return res.status(400).json({
      success: false,
      message: "patient_id, period_start, and period_end are required"
    });
  }

  const startDate = new Date(period_start);
  const endDate = new Date(period_end);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (startDate > endDate) {
    return res.status(400).json({
      success: false,
      message: "period_start cannot be after period_end"
    });
  }

  if (endDate > today) {
    return res.status(400).json({
      success: false,
      message: "Cannot generate report for a period that has not ended yet"
    });
  }

  const languageInput = req.body.language ?? req.body.locale;
  const parsedLanguage = parseAiReportLanguage(languageInput);

  if (parsedLanguage === null) {
    return res.status(400).json({
      success: false,
      message: "language must be 'en' or 'ar'."
    });
  }

  req.body.language = parsedLanguage || DEFAULT_AI_REPORT_LANGUAGE;

  next();
};

const validateUpdateAiReportDraft = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be an object with editable report fields.",
    });
  }

  const unknownKeys = Object.keys(body).filter(
    (key) => !ALLOWED_UPDATE_KEYS.has(key)
  );

  if (unknownKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unsupported fields: ${unknownKeys.join(", ")}`,
    });
  }

  const updates = extractEditableUpdates(body);
  if (!updates) {
    return res.status(400).json({
      success: false,
      message: "At least one editable report field is required.",
    });
  }

  req.body = updates;
  next();
};

module.exports = {
  validateGenerateReport,
  validateUpdateAiReportDraft,
};
