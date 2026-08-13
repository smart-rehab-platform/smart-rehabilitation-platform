const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_REPORT_TYPES = new Set([
  "weekly",
  "monthly",
  "assessment",
  "progress",
]);

const STRIP_CREATE_FIELDS = [
  "generated_by",
  "pdf_url",
  "specialist_id",
  "status",
  "period_start",
  "period_end",
];

const isValidUuid = (value) => UUID_RE.test(String(value || "").trim());

const asTrimmedString = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const text = String(value).trim();
  return text.length === 0 ? null : text;
};

const validateCreateReport = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    req.body = {};
  }

  for (const field of STRIP_CREATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      delete req.body[field];
    }
  }

  const patientId = asTrimmedString(req.body.patient_id);
  const reportType = asTrimmedString(req.body.report_type)?.toLowerCase() ?? null;
  const title = asTrimmedString(req.body.title);
  const summary = asTrimmedString(req.body.summary);

  if (!patientId || !reportType) {
    return res.status(400).json({
      success: false,
      message: "patient_id and report_type are required",
    });
  }

  if (!isValidUuid(patientId)) {
    return res.status(400).json({
      success: false,
      message: "patient_id must be a valid UUID",
    });
  }

  if (!ALLOWED_REPORT_TYPES.has(reportType)) {
    return res.status(400).json({
      success: false,
      message: "report_type must be weekly, monthly, assessment, or progress",
    });
  }

  if (title && title.length > 200) {
    return res.status(400).json({
      success: false,
      message: "title must be 200 characters or fewer",
    });
  }

  req.body.patient_id = patientId;
  req.body.report_type = reportType;
  req.body.title = title;
  req.body.summary = summary;

  return next();
};

module.exports = {
  validateCreateReport,
  ALLOWED_REPORT_TYPES,
};
