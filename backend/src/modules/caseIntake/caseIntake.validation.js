const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PREFERRED_TIME_PERIODS = ["morning", "afternoon", "evening", "flexible"];

const CASE_INTAKE_STATUSES = [
  "pending",
  "assigned",
  "under_assessment",
  "accepted",
  "rejected",
  "converted_to_patient",
];

const FORBIDDEN_CREATE_FIELDS = new Set([
  "parent_id",
  "status",
  "assigned_specialist_id",
  "reviewed_by_admin_id",
  "patient_id",
  "assessment_notes",
  "rejection_reason",
  "submitted_at",
  "assigned_at",
  "accepted_at",
  "converted_at",
  "created_at",
  "updated_at",
  "id",
]);

const ALLOWED_UPDATE_FIELDS = new Set([
  "child_name",
  "date_of_birth",
  "gender",
  "category_id",
  "case_description",
  "observed_difficulties",
  "has_previous_diagnosis",
  "previous_diagnosis_details",
  "is_currently_receiving_treatment",
  "current_treatment_details",
  "preferred_contact_period",
]);

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

const isNotFutureDate = (value) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const date = new Date(`${value.trim()}T00:00:00.000Z`);
  return date <= today;
};

const rejectForbiddenFields = (body, forbiddenFields, res) => {
  const extraKeys = Object.keys(body || {}).filter((key) =>
    forbiddenFields.has(key)
  );

  if (extraKeys.length > 0) {
    res.status(400).json({
      success: false,
      message: `${extraKeys.join(", ")} must not be sent in the request body`,
    });
    return true;
  }

  return false;
};

const validateBooleanField = (value, fieldName, res, { required = false } = {}) => {
  if (value === undefined || value === null) {
    if (required) {
      res.status(400).json({
        success: false,
        message: `${fieldName} is required`,
      });
      return false;
    }
    return true;
  }

  if (typeof value !== "boolean") {
    res.status(400).json({
      success: false,
      message: `${fieldName} must be true or false`,
    });
    return false;
  }

  return true;
};

const validateOptionalText = (value, fieldName, res, maxLength) => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value !== "string") {
    res.status(400).json({
      success: false,
      message: `${fieldName} must be a string when provided`,
    });
    return false;
  }

  if (value.trim().length > maxLength) {
    res.status(400).json({
      success: false,
      message: `${fieldName} must not exceed ${maxLength} characters`,
    });
    return false;
  }

  return true;
};

const validateRequestPayload = (body, res, { requireAll = false } = {}) => {
  const checkRequired = (field) => requireAll || body[field] !== undefined;

  if (checkRequired("child_name")) {
    if (body.child_name === undefined || body.child_name === null) {
      res.status(400).json({ success: false, message: "child_name is required" });
      return false;
    }
    if (typeof body.child_name !== "string" || !body.child_name.trim()) {
      res.status(400).json({
        success: false,
        message: "child_name must not be empty",
      });
      return false;
    }
    if (body.child_name.trim().length > 150) {
      res.status(400).json({
        success: false,
        message: "child_name must not exceed 150 characters",
      });
      return false;
    }
  }

  if (checkRequired("date_of_birth")) {
    if (!body.date_of_birth) {
      res.status(400).json({
        success: false,
        message: "date_of_birth is required",
      });
      return false;
    }
    if (!isValidDateString(body.date_of_birth)) {
      res.status(400).json({
        success: false,
        message: "date_of_birth must be a valid date in YYYY-MM-DD format",
      });
      return false;
    }
    if (!isNotFutureDate(body.date_of_birth)) {
      res.status(400).json({
        success: false,
        message: "date_of_birth cannot be in the future",
      });
      return false;
    }
  }

  if (body.gender !== undefined && body.gender !== null) {
    if (typeof body.gender !== "string") {
      res.status(400).json({
        success: false,
        message: "gender must be a string when provided",
      });
      return false;
    }
    if (body.gender.trim().length > 10) {
      res.status(400).json({
        success: false,
        message: "gender must not exceed 10 characters",
      });
      return false;
    }
  }

  if (checkRequired("category_id")) {
    if (!body.category_id || !isValidUuid(body.category_id)) {
      res.status(400).json({
        success: false,
        message: "category_id must be a valid UUID",
      });
      return false;
    }
  } else if (body.category_id !== undefined && !isValidUuid(body.category_id)) {
    res.status(400).json({
      success: false,
      message: "category_id must be a valid UUID",
    });
    return false;
  }

  if (checkRequired("case_description")) {
    if (
      body.case_description === undefined ||
      body.case_description === null ||
      typeof body.case_description !== "string" ||
      !body.case_description.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "case_description is required",
      });
      return false;
    }
    if (body.case_description.trim().length > 5000) {
      res.status(400).json({
        success: false,
        message: "case_description must not exceed 5000 characters",
      });
      return false;
    }
  } else if (body.case_description !== undefined) {
    if (
      body.case_description === null ||
      typeof body.case_description !== "string" ||
      !body.case_description.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "case_description must not be empty",
      });
      return false;
    }
  }

  if (
    !validateOptionalText(
      body.observed_difficulties,
      "observed_difficulties",
      res,
      5000
    )
  ) {
    return false;
  }

  if (
    !validateBooleanField(body.has_previous_diagnosis, "has_previous_diagnosis", res, {
      required: requireAll,
    })
  ) {
    return false;
  }

  if (
    !validateOptionalText(
      body.previous_diagnosis_details,
      "previous_diagnosis_details",
      res,
      5000
    )
  ) {
    return false;
  }

  if (
    !validateBooleanField(
      body.is_currently_receiving_treatment,
      "is_currently_receiving_treatment",
      res,
      { required: requireAll }
    )
  ) {
    return false;
  }

  if (
    !validateOptionalText(
      body.current_treatment_details,
      "current_treatment_details",
      res,
      5000
    )
  ) {
    return false;
  }

  if (checkRequired("preferred_contact_period")) {
    if (
      !body.preferred_contact_period ||
      !PREFERRED_TIME_PERIODS.includes(body.preferred_contact_period)
    ) {
      res.status(400).json({
        success: false,
        message:
          "preferred_contact_period must be one of: morning, afternoon, evening, flexible",
      });
      return false;
    }
  } else if (
    body.preferred_contact_period !== undefined &&
    !PREFERRED_TIME_PERIODS.includes(body.preferred_contact_period)
  ) {
    res.status(400).json({
      success: false,
      message:
        "preferred_contact_period must be one of: morning, afternoon, evening, flexible",
    });
    return false;
  }

  return true;
};

const validateCreateCaseIntakeRequest = (req, res, next) => {
  const body = req.body || {};

  if (rejectForbiddenFields(body, FORBIDDEN_CREATE_FIELDS, res)) {
    return;
  }

  if (!validateRequestPayload(body, res, { requireAll: true })) {
    return;
  }

  next();
};

const validateUpdateCaseIntakeRequest = (req, res, next) => {
  const body = req.body || {};

  if (rejectForbiddenFields(body, FORBIDDEN_CREATE_FIELDS, res)) {
    return;
  }

  const keys = Object.keys(body);
  const unknownKeys = keys.filter((key) => !ALLOWED_UPDATE_FIELDS.has(key));

  if (unknownKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown fields are not allowed: ${unknownKeys.join(", ")}`,
    });
  }

  if (keys.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field must be provided",
    });
  }

  if (!validateRequestPayload(body, res, { requireAll: false })) {
    return;
  }

  next();
};

const validateRequestIdParam = (req, res, next) => {
  if (!req.params.id || !isValidUuid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "id must be a valid UUID",
    });
  }

  next();
};

const validateAttachmentIdParam = (req, res, next) => {
  if (!req.params.attachmentId || !isValidUuid(req.params.attachmentId)) {
    return res.status(400).json({
      success: false,
      message: "attachmentId must be a valid UUID",
    });
  }

  next();
};

const validateListFilters = (req, res, next) => {
  const { status, category_id: categoryId } = req.query;

  if (status !== undefined && status !== null && status !== "") {
    if (
      typeof status !== "string" ||
      !CASE_INTAKE_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "status must be one of: pending, assigned, under_assessment, accepted, rejected, converted_to_patient",
      });
    }
  }

  if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
    if (!isValidUuid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "category_id must be a valid UUID",
      });
    }
  }

  next();
};

const validateAddAttachment = (req, res, next) => {
  const body = req.body || {};
  const allowedKeys = new Set(["file_url", "file_type", "original_name"]);
  const extraKeys = Object.keys(body).filter((key) => !allowedKeys.has(key));

  if (extraKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown fields are not allowed: ${extraKeys.join(", ")}`,
    });
  }

  const { file_url: fileUrl, file_type: fileType, original_name: originalName } =
    body;

  if (!fileUrl || typeof fileUrl !== "string" || !fileUrl.trim()) {
    return res.status(400).json({
      success: false,
      message: "file_url is required",
    });
  }

  if (fileType !== undefined && fileType !== null) {
    if (typeof fileType !== "string" || fileType.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "file_type must be a string up to 50 characters when provided",
      });
    }
  }

  if (originalName !== undefined && originalName !== null) {
    if (typeof originalName !== "string" || originalName.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: "original_name must be a string up to 255 characters when provided",
      });
    }
  }

  next();
};

const SPECIALIST_LIST_STATUSES = [
  "assigned",
  "under_assessment",
  "accepted",
  "rejected",
  "converted_to_patient",
];

const SPECIALIST_INBOX_QUERY_FIELDS = new Set([
  "status",
  "category_id",
  "parent_name",
  "child_name",
  "submitted_from",
  "submitted_to",
  "page",
  "limit",
]);

const FORBIDDEN_ASSIGN_FIELDS = new Set([
  "admin_id",
  "parent_id",
  "status",
  "category_id",
  "conversation_id",
  "assigned_specialist_id",
  "reviewed_by_admin_id",
  "patient_id",
  "assessment_notes",
  "rejection_reason",
  "submitted_at",
  "assigned_at",
  "accepted_at",
  "converted_at",
  "created_at",
  "updated_at",
  "id",
]);

const ADMIN_INBOX_QUERY_FIELDS = new Set([
  "status",
  "category_id",
  "parent_name",
  "child_name",
  "submitted_from",
  "submitted_to",
  "assigned_specialist_id",
  "page",
  "limit",
]);

const parsePositiveInt = (value, { defaultValue, max = null } = {}) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = Number.parseInt(String(value), 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  if (max !== null && parsed > max) {
    return null;
  }

  return parsed;
};

const validateAdminInboxQuery = (req, res, next) => {
  const query = req.query || {};
  const unknownKeys = Object.keys(query).filter(
    (key) => !ADMIN_INBOX_QUERY_FIELDS.has(key)
  );

  if (unknownKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown query fields are not allowed: ${unknownKeys.join(", ")}`,
    });
  }

  const {
    status,
    category_id: categoryId,
    parent_name: parentName,
    child_name: childName,
    submitted_from: submittedFrom,
    submitted_to: submittedTo,
    assigned_specialist_id: assignedSpecialistId,
    page,
    limit,
  } = query;

  if (status !== undefined && status !== null && status !== "") {
    if (typeof status !== "string" || !CASE_INTAKE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "status must be one of: pending, assigned, under_assessment, accepted, rejected, converted_to_patient",
      });
    }
  }

  if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
    if (!isValidUuid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "category_id must be a valid UUID",
      });
    }
  }

  if (assignedSpecialistId !== undefined && assignedSpecialistId !== null && assignedSpecialistId !== "") {
    if (!isValidUuid(assignedSpecialistId)) {
      return res.status(400).json({
        success: false,
        message: "assigned_specialist_id must be a valid UUID",
      });
    }
  }

  if (parentName !== undefined && parentName !== null && parentName !== "") {
    if (typeof parentName !== "string" || !parentName.trim()) {
      return res.status(400).json({
        success: false,
        message: "parent_name must be a non-empty string when provided",
      });
    }
  }

  if (childName !== undefined && childName !== null && childName !== "") {
    if (typeof childName !== "string" || !childName.trim()) {
      return res.status(400).json({
        success: false,
        message: "child_name must be a non-empty string when provided",
      });
    }
  }

  if (submittedFrom !== undefined && submittedFrom !== null && submittedFrom !== "") {
    if (!isValidDateString(submittedFrom)) {
      return res.status(400).json({
        success: false,
        message: "submitted_from must be a valid date in YYYY-MM-DD format",
      });
    }
  }

  if (submittedTo !== undefined && submittedTo !== null && submittedTo !== "") {
    if (!isValidDateString(submittedTo)) {
      return res.status(400).json({
        success: false,
        message: "submitted_to must be a valid date in YYYY-MM-DD format",
      });
    }
  }

  const parsedPage = parsePositiveInt(page, { defaultValue: 1 });
  const parsedLimit = parsePositiveInt(limit, { defaultValue: 20, max: 100 });

  if (parsedPage === null) {
    return res.status(400).json({
      success: false,
      message: "page must be a positive integer",
    });
  }

  if (parsedLimit === null) {
    return res.status(400).json({
      success: false,
      message: "limit must be a positive integer up to 100",
    });
  }

  req.adminInboxQuery = {
    status: status || null,
    categoryId: categoryId || null,
    parentName: parentName?.trim() || null,
    childName: childName?.trim() || null,
    submittedFrom: submittedFrom?.trim() || null,
    submittedTo: submittedTo?.trim() || null,
    assignedSpecialistId: assignedSpecialistId || null,
    page: parsedPage,
    limit: parsedLimit,
  };

  next();
};

const validateAssignSpecialist = (req, res, next) => {
  const body = req.body || {};

  if (rejectForbiddenFields(body, FORBIDDEN_ASSIGN_FIELDS, res)) {
    return;
  }

  const keys = Object.keys(body);
  if (!keys.includes("specialist_id")) {
    return res.status(400).json({
      success: false,
      message: "specialist_id is required",
    });
  }

  if (keys.length !== 1) {
    const unknownKeys = keys.filter((key) => key !== "specialist_id");
    return res.status(400).json({
      success: false,
      message: `Unknown fields are not allowed: ${unknownKeys.join(", ")}`,
    });
  }

  if (!isValidUuid(body.specialist_id)) {
    return res.status(400).json({
      success: false,
      message: "specialist_id must be a valid UUID",
    });
  }

  next();
};

const validateSpecialistListQuery = (req, res, next) => {
  const query = req.query || {};
  const unknownKeys = Object.keys(query).filter(
    (key) => !SPECIALIST_INBOX_QUERY_FIELDS.has(key)
  );

  if (unknownKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown query fields are not allowed: ${unknownKeys.join(", ")}`,
    });
  }

  const {
    status,
    category_id: categoryId,
    parent_name: parentName,
    child_name: childName,
    submitted_from: submittedFrom,
    submitted_to: submittedTo,
    page,
    limit,
  } = query;

  if (status !== undefined && status !== null && status !== "") {
    if (
      typeof status !== "string" ||
      !SPECIALIST_LIST_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "status must be one of: assigned, under_assessment, accepted, rejected, converted_to_patient",
      });
    }
  }

  if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
    if (!isValidUuid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "category_id must be a valid UUID",
      });
    }
  }

  if (parentName !== undefined && parentName !== null && parentName !== "") {
    if (typeof parentName !== "string" || !parentName.trim()) {
      return res.status(400).json({
        success: false,
        message: "parent_name must be a non-empty string when provided",
      });
    }
  }

  if (childName !== undefined && childName !== null && childName !== "") {
    if (typeof childName !== "string" || !childName.trim()) {
      return res.status(400).json({
        success: false,
        message: "child_name must be a non-empty string when provided",
      });
    }
  }

  if (submittedFrom !== undefined && submittedFrom !== null && submittedFrom !== "") {
    if (!isValidDateString(submittedFrom)) {
      return res.status(400).json({
        success: false,
        message: "submitted_from must be a valid date in YYYY-MM-DD format",
      });
    }
  }

  if (submittedTo !== undefined && submittedTo !== null && submittedTo !== "") {
    if (!isValidDateString(submittedTo)) {
      return res.status(400).json({
        success: false,
        message: "submitted_to must be a valid date in YYYY-MM-DD format",
      });
    }
  }

  const parsedPage = parsePositiveInt(page, { defaultValue: 1 });
  const parsedLimit = parsePositiveInt(limit, { defaultValue: 20, max: 100 });

  if (parsedPage === null) {
    return res.status(400).json({
      success: false,
      message: "page must be a positive integer",
    });
  }

  if (parsedLimit === null) {
    return res.status(400).json({
      success: false,
      message: "limit must be a positive integer up to 100",
    });
  }

  req.specialistListQuery = {
    status: status || null,
    categoryId: categoryId || null,
    parentName: parentName?.trim() || null,
    childName: childName?.trim() || null,
    submittedFrom: submittedFrom?.trim() || null,
    submittedTo: submittedTo?.trim() || null,
    page: parsedPage,
    limit: parsedLimit,
  };

  next();
};

const validateAssessmentNotes = (req, res, next) => {
  const body = req.body || {};
  const allowedKeys = new Set(["assessment_notes"]);
  const extraKeys = Object.keys(body).filter((key) => !allowedKeys.has(key));

  if (extraKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown fields are not allowed: ${extraKeys.join(", ")}`,
    });
  }

  const { assessment_notes: assessmentNotes } = body;

  if (
    assessmentNotes === undefined ||
    assessmentNotes === null ||
    typeof assessmentNotes !== "string" ||
    !assessmentNotes.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "assessment_notes is required",
    });
  }

  if (assessmentNotes.trim().length > 10000) {
    return res.status(400).json({
      success: false,
      message: "assessment_notes must not exceed 10000 characters",
    });
  }

  next();
};

const validateRejectReason = (req, res, next) => {
  const body = req.body || {};
  const allowedKeys = new Set(["reason"]);
  const extraKeys = Object.keys(body).filter((key) => !allowedKeys.has(key));

  if (extraKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown fields are not allowed: ${extraKeys.join(", ")}`,
    });
  }

  const { reason } = body;

  if (
    reason === undefined ||
    reason === null ||
    typeof reason !== "string" ||
    !reason.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "reason is required",
    });
  }

  const trimmed = reason.trim();

  if (trimmed.length < 5) {
    return res.status(400).json({
      success: false,
      message: "reason must be at least 5 characters",
    });
  }

  if (trimmed.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "reason must not exceed 2000 characters",
    });
  }

  next();
};

const RELATIONSHIP_TYPES = ["mother", "father", "guardian", "other"];

const FORBIDDEN_CONVERT_FIELDS = new Set([
  "parent_id",
  "specialist_id",
  "patient_id",
  "status",
  "conversation_id",
  "created_by",
  "admin_id",
  "category_id",
  "assigned_specialist_id",
  "reviewed_by_admin_id",
  "id",
]);

const ALLOWED_CONVERT_FIELDS = new Set([
  "full_name",
  "date_of_birth",
  "gender",
  "profile_image_url",
  "relationship",
  "is_primary_contact",
]);

const validateConvertToPatient = (req, res, next) => {
  const body = req.body || {};

  if (rejectForbiddenFields(body, FORBIDDEN_CONVERT_FIELDS, res)) {
    return;
  }

  const unknownKeys = Object.keys(body).filter(
    (key) => !ALLOWED_CONVERT_FIELDS.has(key)
  );

  if (unknownKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unknown fields are not allowed: ${unknownKeys.join(", ")}`,
    });
  }

  if (!body.relationship) {
    return res.status(400).json({
      success: false,
      message: "relationship is required",
    });
  }

  if (!RELATIONSHIP_TYPES.includes(body.relationship)) {
    return res.status(400).json({
      success: false,
      message: "relationship must be one of: mother, father, guardian, other",
    });
  }

  if (body.full_name !== undefined && body.full_name !== null) {
    if (typeof body.full_name !== "string" || !body.full_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "full_name must not be empty when provided",
      });
    }
    if (body.full_name.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "full_name must not exceed 150 characters",
      });
    }
  }

  if (body.date_of_birth !== undefined && body.date_of_birth !== null && body.date_of_birth !== "") {
    if (!isValidDateString(body.date_of_birth)) {
      return res.status(400).json({
        success: false,
        message: "date_of_birth must be a valid date in YYYY-MM-DD format",
      });
    }
    if (!isNotFutureDate(body.date_of_birth)) {
      return res.status(400).json({
        success: false,
        message: "date_of_birth cannot be in the future",
      });
    }
  }

  if (body.gender !== undefined && body.gender !== null) {
    if (typeof body.gender !== "string") {
      return res.status(400).json({
        success: false,
        message: "gender must be a string when provided",
      });
    }
    if (body.gender.trim().length > 10) {
      return res.status(400).json({
        success: false,
        message: "gender must not exceed 10 characters",
      });
    }
  }

  if (body.profile_image_url !== undefined && body.profile_image_url !== null) {
    if (typeof body.profile_image_url !== "string") {
      return res.status(400).json({
        success: false,
        message: "profile_image_url must be a string or null when provided",
      });
    }
    const trimmed = body.profile_image_url.trim();
    if (trimmed.length > 0) {
      const { isTrustedUploadUrl } = require("../../config/messageAttachments");
      if (!isTrustedUploadUrl(trimmed)) {
        return res.status(400).json({
          success: false,
          message: "profile_image_url must be a trusted local upload URL",
        });
      }
    }
  }

  if (
    body.is_primary_contact !== undefined &&
    body.is_primary_contact !== null &&
    typeof body.is_primary_contact !== "boolean"
  ) {
    return res.status(400).json({
      success: false,
      message: "is_primary_contact must be true or false",
    });
  }

  req.convertBody = {
    full_name:
      body.full_name !== undefined && body.full_name !== null
        ? body.full_name.trim()
        : undefined,
    date_of_birth:
      body.date_of_birth !== undefined && body.date_of_birth !== null && body.date_of_birth !== ""
        ? body.date_of_birth.trim()
        : undefined,
    gender: body.gender,
    profile_image_url:
      body.profile_image_url === undefined
        ? undefined
        : body.profile_image_url === null
          ? null
          : body.profile_image_url.trim() || null,
    relationship: body.relationship,
    is_primary_contact: body.is_primary_contact,
  };

  next();
};

module.exports = {
  validateCreateCaseIntakeRequest,
  validateUpdateCaseIntakeRequest,
  validateRequestIdParam,
  validateAttachmentIdParam,
  validateListFilters,
  validateAddAttachment,
  validateAdminInboxQuery,
  validateAssignSpecialist,
  validateSpecialistListQuery,
  validateAssessmentNotes,
  validateRejectReason,
  validateConvertToPatient,
};
