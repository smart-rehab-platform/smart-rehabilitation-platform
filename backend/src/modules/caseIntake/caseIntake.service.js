const pool = require("../../database/db");
const { isTrustedUploadUrl } = require("../../config/messageAttachments");
const { notifyAllAdmins } = require("../notifications/adminNotifications.helper");
const notificationsService = require("../notifications/notifications.service");
const {
  createCaseRequestConversation,
} = require("../communication/communication.service");

const ACTIVE_DUPLICATE_STATUSES = [
  "pending",
  "assigned",
  "under_assessment",
  "accepted",
];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isUniqueViolation = (error) => error?.code === "23505";

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizePayload = (data) => {
  const hasPreviousDiagnosis = Boolean(data.has_previous_diagnosis);
  const isCurrentlyReceivingTreatment = Boolean(
    data.is_currently_receiving_treatment
  );

  return {
    child_name: data.child_name.trim(),
    date_of_birth: data.date_of_birth.trim(),
    gender: normalizeText(data.gender),
    child_image_url:
      data.child_image_url === undefined || data.child_image_url === null
        ? null
        : normalizeText(data.child_image_url),
    category_id: data.category_id.trim(),
    case_description: data.case_description.trim(),
    observed_difficulties: normalizeText(data.observed_difficulties),
    has_previous_diagnosis: hasPreviousDiagnosis,
    previous_diagnosis_details: hasPreviousDiagnosis
      ? normalizeText(data.previous_diagnosis_details)
      : null,
    is_currently_receiving_treatment: isCurrentlyReceivingTreatment,
    current_treatment_details: isCurrentlyReceivingTreatment
      ? normalizeText(data.current_treatment_details)
      : null,
    preferred_contact_period: data.preferred_contact_period,
  };
};

const toDateString = (value) => {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (typeof value === "string") {
    return value.trim().slice(0, 10);
  }

  return String(value).slice(0, 10);
};

const mergeUpdatePayload = (existing, updates) => {
  const merged = {
    child_name:
      updates.child_name !== undefined ? updates.child_name : existing.child_name,
    date_of_birth:
      updates.date_of_birth !== undefined
        ? updates.date_of_birth
        : toDateString(existing.date_of_birth),
    gender: updates.gender !== undefined ? updates.gender : existing.gender,
    child_image_url:
      updates.child_image_url !== undefined
        ? updates.child_image_url
        : existing.child_image_url,
    category_id:
      updates.category_id !== undefined
        ? updates.category_id
        : String(existing.category_id),
    case_description:
      updates.case_description !== undefined
        ? updates.case_description
        : existing.case_description,
    observed_difficulties:
      updates.observed_difficulties !== undefined
        ? updates.observed_difficulties
        : existing.observed_difficulties,
    has_previous_diagnosis:
      updates.has_previous_diagnosis !== undefined
        ? updates.has_previous_diagnosis
        : existing.has_previous_diagnosis,
    previous_diagnosis_details:
      updates.previous_diagnosis_details !== undefined
        ? updates.previous_diagnosis_details
        : existing.previous_diagnosis_details,
    is_currently_receiving_treatment:
      updates.is_currently_receiving_treatment !== undefined
        ? updates.is_currently_receiving_treatment
        : existing.is_currently_receiving_treatment,
    current_treatment_details:
      updates.current_treatment_details !== undefined
        ? updates.current_treatment_details
        : existing.current_treatment_details,
    preferred_contact_period:
      updates.preferred_contact_period !== undefined
        ? updates.preferred_contact_period
        : existing.preferred_contact_period,
  };

  return normalizePayload(merged);
};

const formatAttachment = (row) => ({
  id: row.id,
  case_request_id: row.case_request_id,
  file_url: row.file_url,
  file_type: row.file_type,
  original_name: row.original_name,
  created_at: row.created_at,
});

const formatAssignedSpecialist = (row) => {
  if (!row.assigned_specialist_id) {
    return null;
  }

  return {
    id: row.assigned_specialist_id,
    full_name: row.assigned_specialist_name,
    profile_image_url: row.assigned_specialist_profile_image_url,
    specialization: row.assigned_specialist_specialization,
  };
};

const formatCategory = (row, { includeActive = false } = {}) => {
  const category = {
    id: row.category_id,
    name: row.category_name,
    description: row.category_description,
  };

  if (includeActive) {
    category.is_active = row.category_is_active;
  }

  return category;
};

const formatParentSummary = (row) => ({
  id: row.parent_id,
  full_name: row.parent_full_name,
  email: row.parent_email,
  phone: row.parent_phone,
  profile_image_url: row.parent_profile_image_url,
});

const formatRequest = (row, { includeAttachments = false, audience = "parent" } = {}) => {
  const request = {
    id: row.id,
    parent_id: row.parent_id,
    child_name: row.child_name,
    date_of_birth: toDateString(row.date_of_birth),
    gender: row.gender,
    child_image_url: row.child_image_url,
    category_id: row.category_id,
    case_description: row.case_description,
    observed_difficulties: row.observed_difficulties,
    has_previous_diagnosis: row.has_previous_diagnosis,
    previous_diagnosis_details: row.previous_diagnosis_details,
    is_currently_receiving_treatment: row.is_currently_receiving_treatment,
    current_treatment_details: row.current_treatment_details,
    preferred_contact_period: row.preferred_contact_period,
    status: row.status,
    assigned_specialist_id: row.assigned_specialist_id,
    patient_id: row.patient_id,
    rejection_reason: row.rejection_reason,
    submitted_at: row.submitted_at,
    assigned_at: row.assigned_at,
    accepted_at: row.accepted_at,
    converted_at: row.converted_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category: formatCategory(row),
    attachment_count: Number(row.attachment_count || 0),
    assigned_specialist: formatAssignedSpecialist(row),
  };

  if (audience === "admin") {
    request.reviewed_by_admin_id = row.reviewed_by_admin_id;
    request.assessment_notes = row.assessment_notes;
  }

  if (audience === "specialist") {
    request.assessment_notes = row.assessment_notes;
  }

  if (includeAttachments) {
    request.attachments = row.attachments || [];
  }

  return request;
};

const formatAdminInboxItem = (row) => ({
  id: row.id,
  child_name: row.child_name,
  date_of_birth: toDateString(row.date_of_birth),
  gender: row.gender,
  child_image_url: row.child_image_url,
  status: row.status,
  submitted_at: row.submitted_at,
  assigned_at: row.assigned_at,
  updated_at: row.updated_at,
  category: {
    id: row.category_id,
    name: row.category_name,
    is_active: row.category_is_active,
  },
  parent: formatParentSummary(row),
  assigned_specialist: formatAssignedSpecialist(row),
  attachment_count: Number(row.attachment_count || 0),
});

const formatAdminRequestDetail = (row) => ({
  ...formatRequest(row, { includeAttachments: true, audience: "admin" }),
  category: formatCategory(row, { includeActive: true }),
  parent: formatParentSummary(row),
  conversation_id: row.conversation_id || null,
});

const formatSpecialistListItem = (row) => ({
  id: row.id,
  child_name: row.child_name,
  date_of_birth: toDateString(row.date_of_birth),
  gender: row.gender,
  child_image_url: row.child_image_url,
  status: row.status,
  submitted_at: row.submitted_at,
  assigned_at: row.assigned_at,
  accepted_at: row.accepted_at,
  converted_at: row.converted_at,
  updated_at: row.updated_at,
  category: formatCategory(row, { includeActive: true }),
  parent: {
    id: row.parent_id,
    full_name: row.parent_full_name,
    profile_image_url: row.parent_profile_image_url,
  },
  attachment_count: Number(row.attachment_count || 0),
  conversation_id: row.conversation_id || null,
  patient_id: row.patient_id,
});

const formatSpecialistRequestDetail = (row) => ({
  ...formatRequest(row, { includeAttachments: true, audience: "specialist" }),
  category: formatCategory(row, { includeActive: true }),
  parent: formatParentSummary(row),
  conversation_id: row.conversation_id || null,
});

const SPECIALIST_VISIBLE_STATUSES = [
  "assigned",
  "under_assessment",
  "accepted",
  "rejected",
  "converted_to_patient",
];

const ENRICHED_SELECT = `
  SELECT
    cir.*,
    cc.name AS category_name,
    cc.description AS category_description,
    cc.is_active AS category_is_active,
    parent_u.full_name AS parent_full_name,
    parent_u.email AS parent_email,
    parent_u.phone AS parent_phone,
    parent_u.profile_image_url AS parent_profile_image_url,
    (
      SELECT COUNT(*)::int
      FROM case_request_attachments cra
      WHERE cra.case_request_id = cir.id
    ) AS attachment_count,
    specialist_u.full_name AS assigned_specialist_name,
    specialist_u.profile_image_url AS assigned_specialist_profile_image_url,
    sp.specialization AS assigned_specialist_specialization,
    conv.id AS conversation_id
  FROM case_intake_requests cir
  JOIN case_categories cc ON cc.id = cir.category_id
  JOIN users parent_u ON parent_u.id = cir.parent_id
  LEFT JOIN users specialist_u ON specialist_u.id = cir.assigned_specialist_id
  LEFT JOIN specialist_profiles sp ON sp.user_id = specialist_u.id
  LEFT JOIN conversations conv ON conv.case_request_id = cir.id
`;

const ADMIN_INBOX_STATUS_ORDER = `
  CASE
    WHEN cir.status = 'pending' THEN 0
    WHEN cir.status IN ('assigned', 'under_assessment', 'accepted') THEN 1
    WHEN cir.status IN ('rejected', 'converted_to_patient') THEN 2
    ELSE 3
  END ASC,
  cir.submitted_at DESC
`;

const SPECIALIST_LIST_STATUS_ORDER = `
  CASE
    WHEN cir.status = 'assigned' THEN 0
    WHEN cir.status = 'under_assessment' THEN 1
    WHEN cir.status = 'accepted' THEN 2
    WHEN cir.status = 'converted_to_patient' THEN 3
    WHEN cir.status = 'rejected' THEN 4
    ELSE 5
  END ASC,
  cir.updated_at DESC
`;

const assertActiveCategory = async (categoryId, client = pool) => {
  const result = await client.query(
    `SELECT id, is_active
     FROM case_categories
     WHERE id = $1`,
    [categoryId]
  );

  const category = result.rows[0];

  if (!category) {
    throw createError("Category not found", 400);
  }

  if (!category.is_active) {
    throw createError("Inactive categories cannot be used for case requests", 409);
  }

  return category;
};

const findDuplicateActiveRequest = async (
  parentId,
  childName,
  dateOfBirth,
  excludeId = null,
  client = pool
) => {
  const params = [parentId, childName.trim(), dateOfBirth.trim()];
  let sql = `
    SELECT id
    FROM case_intake_requests
    WHERE parent_id = $1
      AND lower(trim(child_name)) = lower(trim($2))
      AND date_of_birth = $3::date
      AND status = ANY($4::case_intake_status[])
  `;

  params.push(ACTIVE_DUPLICATE_STATUSES);

  if (excludeId) {
    params.push(excludeId);
    sql += ` AND id <> $5`;
  }

  sql += ` LIMIT 1`;

  const result = await client.query(sql, params);
  return result.rows[0] || null;
};

const getAttachmentsForRequest = async (requestId, client = pool) => {
  const result = await client.query(
    `SELECT *
     FROM case_request_attachments
     WHERE case_request_id = $1
     ORDER BY created_at ASC`,
    [requestId]
  );

  return result.rows.map(formatAttachment);
};

const getRequestRowForParent = async (
  requestId,
  parentId,
  { includeAttachments = false, client = pool } = {}
) => {
  const result = await client.query(
    `${ENRICHED_SELECT}
     WHERE cir.id = $1
       AND cir.parent_id = $2`,
    [requestId, parentId]
  );

  const row = result.rows[0];

  if (!row) {
    throw createError("Case intake request not found", 404);
  }

  if (includeAttachments) {
    row.attachments = await getAttachmentsForRequest(requestId, client);
  }

  return row;
};

const assertTrustedChildImageUrl = (childImageUrl) => {
  if (!childImageUrl) {
    return;
  }

  if (!isTrustedUploadUrl(childImageUrl)) {
    throw createError("Invalid or untrusted child image URL", 400);
  }
};

const createCaseIntakeRequest = async (parentId, body) => {
  const payload = normalizePayload(body);

  assertTrustedChildImageUrl(payload.child_image_url);

  await assertActiveCategory(payload.category_id);

  const duplicate = await findDuplicateActiveRequest(
    parentId,
    payload.child_name,
    payload.date_of_birth
  );

  if (duplicate) {
    throw createError(
      "An active case request already exists for this child",
      409
    );
  }

  try {
    const result = await pool.query(
      `INSERT INTO case_intake_requests (
         parent_id,
         child_name,
         date_of_birth,
         gender,
         child_image_url,
         category_id,
         case_description,
         observed_difficulties,
         has_previous_diagnosis,
         previous_diagnosis_details,
         is_currently_receiving_treatment,
         current_treatment_details,
         preferred_contact_period
       )
       VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::preferred_time_period)
       RETURNING *`,
      [
        parentId,
        payload.child_name,
        payload.date_of_birth,
        payload.gender,
        payload.child_image_url,
        payload.category_id,
        payload.case_description,
        payload.observed_difficulties,
        payload.has_previous_diagnosis,
        payload.previous_diagnosis_details,
        payload.is_currently_receiving_treatment,
        payload.current_treatment_details,
        payload.preferred_contact_period,
      ]
    );

    const created = result.rows[0];

    notifyAllAdmins({
      type: "case_request_submitted",
      title: "New case intake request",
      body: `${payload.child_name} submitted a new preliminary case request.`,
      related_entity_type: "case_intake_request",
      related_entity_id: created.id,
    }).catch(() => {});

    const row = await getRequestRowForParent(created.id, parentId);
    return formatRequest(row, { audience: "parent" });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw createError(
        "An active case request already exists for this child",
        409
      );
    }

    throw error;
  }
};

const listParentRequests = async (parentId, { status = null, categoryId = null } = {}) => {
  const params = [parentId];
  const filters = ["cir.parent_id = $1"];

  if (status) {
    params.push(status);
    filters.push(`cir.status = $${params.length}::case_intake_status`);
  }

  if (categoryId) {
    params.push(categoryId);
    filters.push(`cir.category_id = $${params.length}`);
  }

  const result = await pool.query(
    `${ENRICHED_SELECT}
     WHERE ${filters.join(" AND ")}
     ORDER BY
       CASE
         WHEN cir.status IN ('rejected', 'converted_to_patient') THEN 1
         ELSE 0
       END ASC,
       cir.submitted_at DESC`,
    params
  );

  return result.rows.map((row) => formatRequest(row, { audience: "parent" }));
};

const getParentRequestById = async (requestId, parentId) => {
  const row = await getRequestRowForParent(requestId, parentId, {
    includeAttachments: true,
  });

  return formatRequest(row, { includeAttachments: true, audience: "parent" });
};

const updatePendingRequest = async (requestId, parentId, body) => {
  const existingRow = await getRequestRowForParent(requestId, parentId);

  if (existingRow.status !== "pending") {
    throw createError("Only pending case requests can be updated", 409);
  }

  const payload = mergeUpdatePayload(existingRow, body);

  assertTrustedChildImageUrl(payload.child_image_url);

  await assertActiveCategory(payload.category_id);

  const duplicate = await findDuplicateActiveRequest(
    parentId,
    payload.child_name,
    payload.date_of_birth,
    requestId
  );

  if (duplicate) {
    throw createError(
      "An active case request already exists for this child",
      409
    );
  }

  try {
    await pool.query(
      `UPDATE case_intake_requests
       SET child_name = $1,
           date_of_birth = $2::date,
           gender = $3,
           child_image_url = $4,
           category_id = $5,
           case_description = $6,
           observed_difficulties = $7,
           has_previous_diagnosis = $8,
           previous_diagnosis_details = $9,
           is_currently_receiving_treatment = $10,
           current_treatment_details = $11,
           preferred_contact_period = $12::preferred_time_period
       WHERE id = $13
         AND parent_id = $14
         AND status = 'pending'::case_intake_status`,
      [
        payload.child_name,
        payload.date_of_birth,
        payload.gender,
        payload.child_image_url,
        payload.category_id,
        payload.case_description,
        payload.observed_difficulties,
        payload.has_previous_diagnosis,
        payload.previous_diagnosis_details,
        payload.is_currently_receiving_treatment,
        payload.current_treatment_details,
        payload.preferred_contact_period,
        requestId,
        parentId,
      ]
    );

    const row = await getRequestRowForParent(requestId, parentId, {
      includeAttachments: true,
    });

    return formatRequest(row, { includeAttachments: true, audience: "parent" });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw createError(
        "An active case request already exists for this child",
        409
      );
    }

    throw error;
  }
};

const addAttachment = async (requestId, parentId, { fileUrl, fileType, originalName }) => {
  const row = await getRequestRowForParent(requestId, parentId);

  if (row.status !== "pending") {
    throw createError(
      "Attachments can only be added to pending case requests",
      409
    );
  }

  const trimmedUrl = fileUrl.trim();

  if (!isTrustedUploadUrl(trimmedUrl)) {
    throw createError("Invalid or untrusted file URL", 400);
  }

  const duplicateUrl = await pool.query(
    `SELECT id
     FROM case_request_attachments
     WHERE case_request_id = $1
       AND file_url = $2
     LIMIT 1`,
    [requestId, trimmedUrl]
  );

  if (duplicateUrl.rows[0]) {
    throw createError("This file is already attached to the request", 409);
  }

  const result = await pool.query(
    `INSERT INTO case_request_attachments (
       case_request_id,
       file_url,
       file_type,
       original_name
     )
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      requestId,
      trimmedUrl,
      normalizeText(fileType),
      normalizeText(originalName),
    ]
  );

  return formatAttachment(result.rows[0]);
};

const deleteAttachment = async (requestId, parentId, attachmentId) => {
  const row = await getRequestRowForParent(requestId, parentId);

  if (row.status !== "pending") {
    throw createError(
      "Attachments can only be deleted from pending case requests",
      409
    );
  }

  const result = await pool.query(
    `DELETE FROM case_request_attachments
     WHERE id = $1
       AND case_request_id = $2
     RETURNING *`,
    [attachmentId, requestId]
  );

  if (!result.rows[0]) {
    throw createError("Attachment not found", 404);
  }

  return formatAttachment(result.rows[0]);
};

const buildAdminInboxFilters = ({
  status,
  categoryId,
  parentName,
  childName,
  submittedFrom,
  submittedTo,
  assignedSpecialistId,
}) => {
  const params = [];
  const filters = [];

  if (status) {
    params.push(status);
    filters.push(`cir.status = $${params.length}::case_intake_status`);
  }

  if (categoryId) {
    params.push(categoryId);
    filters.push(`cir.category_id = $${params.length}`);
  }

  if (parentName) {
    params.push(`%${parentName.trim()}%`);
    filters.push(`parent_u.full_name ILIKE $${params.length}`);
  }

  if (childName) {
    params.push(`%${childName.trim()}%`);
    filters.push(`cir.child_name ILIKE $${params.length}`);
  }

  if (submittedFrom) {
    params.push(submittedFrom);
    filters.push(`cir.submitted_at >= $${params.length}::date`);
  }

  if (submittedTo) {
    params.push(submittedTo);
    filters.push(
      `cir.submitted_at < ($${params.length}::date + INTERVAL '1 day')`
    );
  }

  if (assignedSpecialistId) {
    params.push(assignedSpecialistId);
    filters.push(`cir.assigned_specialist_id = $${params.length}`);
  }

  return { params, filters };
};

const listAdminInbox = async ({
  status = null,
  categoryId = null,
  parentName = null,
  childName = null,
  submittedFrom = null,
  submittedTo = null,
  assignedSpecialistId = null,
  page = 1,
  limit = 20,
} = {}) => {
  const { params, filters } = buildAdminInboxFilters({
    status,
    categoryId,
    parentName,
    childName,
    submittedFrom,
    submittedTo,
    assignedSpecialistId,
  });

  const whereClause =
    filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM case_intake_requests cir
     JOIN users parent_u ON parent_u.id = cir.parent_id
     ${whereClause}`,
    params
  );

  const total = countResult.rows[0]?.total || 0;
  const offset = (page - 1) * limit;

  const listParams = [...params, limit, offset];
  const limitIndex = params.length + 1;
  const offsetIndex = params.length + 2;

  const result = await pool.query(
    `${ENRICHED_SELECT}
     ${whereClause}
     ORDER BY ${ADMIN_INBOX_STATUS_ORDER}
     LIMIT $${limitIndex}
     OFFSET $${offsetIndex}`,
    listParams
  );

  return {
    items: result.rows.map(formatAdminInboxItem),
    pagination: {
      page,
      limit,
      total,
      total_pages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

const getAdminRequestById = async (requestId) => {
  const result = await pool.query(
    `${ENRICHED_SELECT}
     WHERE cir.id = $1`,
    [requestId]
  );

  const row = result.rows[0];

  if (!row) {
    throw createError("Case intake request not found", 404);
  }

  row.attachments = await getAttachmentsForRequest(requestId);
  return formatAdminRequestDetail(row);
};

const getMatchingSpecialistsForRequest = async (requestId) => {
  const requestResult = await pool.query(
    `SELECT cir.id, cir.category_id, cc.is_active AS category_is_active
     FROM case_intake_requests cir
     JOIN case_categories cc ON cc.id = cir.category_id
     WHERE cir.id = $1`,
    [requestId]
  );

  const request = requestResult.rows[0];

  if (!request) {
    throw createError("Case intake request not found", 404);
  }

  if (!request.category_is_active) {
    throw createError(
      "Inactive categories cannot be used for specialist matching",
      409
    );
  }

  const result = await pool.query(
    `SELECT
       u.id,
       u.full_name,
       u.email,
       u.phone,
       u.profile_image_url,
       sp.specialization,
       sp.license_number,
       sp.years_of_experience,
       sp.bio,
       (
         SELECT COUNT(*)::int
         FROM patient_specialists ps
         WHERE ps.specialist_id = u.id
       ) AS active_cases_count,
       (
         SELECT COUNT(*)::int
         FROM case_intake_requests cir2
         WHERE cir2.assigned_specialist_id = u.id
           AND cir2.status IN ('assigned', 'under_assessment', 'accepted')
       ) AS current_case_requests_count
     FROM users u
     INNER JOIN specialist_profiles sp ON sp.user_id = u.id
     INNER JOIN specialist_case_categories scc ON scc.specialist_id = u.id
     WHERE scc.category_id = $1
       AND u.role = 'specialist'
       AND u.is_active = TRUE
     ORDER BY current_case_requests_count ASC,
              active_cases_count ASC,
              sp.years_of_experience DESC NULLS LAST,
              u.full_name ASC`,
    [request.category_id]
  );

  return result.rows.map((row) => ({
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    profile_image_url: row.profile_image_url,
    specialization: row.specialization,
    license_number: row.license_number,
    years_of_experience: row.years_of_experience,
    bio: row.bio,
    active_cases_count: row.active_cases_count,
    current_case_requests_count: row.current_case_requests_count,
  }));
};

const assignSpecialistToRequest = async (requestId, adminId, specialistId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const requestResult = await client.query(
      `SELECT cir.*, cc.is_active AS category_is_active
       FROM case_intake_requests cir
       JOIN case_categories cc ON cc.id = cir.category_id
       WHERE cir.id = $1
       FOR UPDATE`,
      [requestId]
    );

    const request = requestResult.rows[0];

    if (!request) {
      throw createError("Case intake request not found", 404);
    }

    if (request.status !== "pending") {
      throw createError("Only pending case requests can be assigned", 409);
    }

    if (!request.category_is_active) {
      throw createError(
        "Inactive categories cannot be used for case assignment",
        409
      );
    }

    const existingConversation = await client.query(
      `SELECT id
       FROM conversations
       WHERE case_request_id = $1
       LIMIT 1`,
      [requestId]
    );

    if (existingConversation.rows[0]) {
      throw createError(
        "A conversation already exists for this case request",
        409
      );
    }

    const specialistResult = await client.query(
      `SELECT u.id, u.role, u.is_active, u.full_name, u.profile_image_url,
              sp.specialization
       FROM users u
       LEFT JOIN specialist_profiles sp ON sp.user_id = u.id
       WHERE u.id = $1`,
      [specialistId]
    );

    const specialist = specialistResult.rows[0];

    if (!specialist) {
      throw createError("Specialist not found", 404);
    }

    if (specialist.role !== "specialist") {
      throw createError("Selected user is not a specialist", 409);
    }

    if (!specialist.is_active) {
      throw createError("Inactive specialists cannot be assigned", 409);
    }

    const categoryMatch = await client.query(
      `SELECT 1
       FROM specialist_case_categories
       WHERE specialist_id = $1
         AND category_id = $2
       LIMIT 1`,
      [specialistId, request.category_id]
    );

    if (!categoryMatch.rows[0]) {
      throw createError(
        "Specialist is not assigned to this case category",
        409
      );
    }

    await client.query(
      `UPDATE case_intake_requests
       SET status = 'assigned'::case_intake_status,
           assigned_specialist_id = $1,
           reviewed_by_admin_id = $2,
           assigned_at = now()
       WHERE id = $3`,
      [specialistId, adminId, requestId]
    );

    const conversation = await createCaseRequestConversation(client, {
      caseRequestId: requestId,
      parentId: request.parent_id,
      specialistId,
    });

    await client.query("COMMIT");

    const detailResult = await pool.query(
      `${ENRICHED_SELECT}
       WHERE cir.id = $1`,
      [requestId]
    );

    const updatedRow = detailResult.rows[0];

    notificationsService
      .createNotification({
        user_id: request.parent_id,
        type: "case_request_assigned",
        title: "Case request assigned",
        body: "A specialist has been assigned to your preliminary case request.",
        related_entity_type: "case_intake_request",
        related_entity_id: requestId,
      })
      .catch(() => {});

    notificationsService
      .createNotification({
        user_id: specialistId,
        type: "case_request_assigned",
        title: "New case request assigned",
        body: "You have been assigned a new preliminary case request for assessment.",
        related_entity_type: "case_intake_request",
        related_entity_id: requestId,
      })
      .catch(() => {});

    return {
      request: formatAdminInboxItem(updatedRow),
      assigned_specialist: {
        id: specialist.id,
        full_name: specialist.full_name,
        specialization: specialist.specialization,
        profile_image_url: specialist.profile_image_url,
      },
      conversation: {
        id: conversation.id,
        case_request_id: conversation.case_request_id,
        patient_id: conversation.patient_id,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");

    if (isUniqueViolation(error)) {
      throw createError(
        "A conversation already exists for this case request",
        409
      );
    }

    throw error;
  } finally {
    client.release();
  }
};

const getRequestRowForSpecialist = async (
  requestId,
  specialistId,
  { includeAttachments = false, client = pool } = {}
) => {
  const result = await client.query(
    `${ENRICHED_SELECT}
     WHERE cir.id = $1
       AND cir.assigned_specialist_id = $2
       AND cir.status <> 'pending'::case_intake_status`,
    [requestId, specialistId]
  );

  const row = result.rows[0];

  if (!row) {
    throw createError("Case intake request not found", 404);
  }

  if (includeAttachments) {
    row.attachments = await getAttachmentsForRequest(requestId, client);
  }

  return row;
};

const listSpecialistAssignedRequests = async (
  specialistId,
  {
    status = null,
    categoryId = null,
    parentName = null,
    childName = null,
    submittedFrom = null,
    submittedTo = null,
    page = 1,
    limit = 20,
  } = {}
) => {
  const params = [specialistId];
  const allFilters = ["cir.assigned_specialist_id = $1"];

  if (status) {
    params.push(status);
    allFilters.push(`cir.status = $${params.length}::case_intake_status`);
  } else {
    params.push(SPECIALIST_VISIBLE_STATUSES);
    allFilters.push(`cir.status = ANY($${params.length}::case_intake_status[])`);
  }

  if (categoryId) {
    params.push(categoryId);
    allFilters.push(`cir.category_id = $${params.length}`);
  }

  if (parentName) {
    params.push(`%${parentName.trim()}%`);
    allFilters.push(`parent_u.full_name ILIKE $${params.length}`);
  }

  if (childName) {
    params.push(`%${childName.trim()}%`);
    allFilters.push(`cir.child_name ILIKE $${params.length}`);
  }

  if (submittedFrom) {
    params.push(submittedFrom);
    allFilters.push(`cir.submitted_at >= $${params.length}::date`);
  }

  if (submittedTo) {
    params.push(submittedTo);
    allFilters.push(
      `cir.submitted_at < ($${params.length}::date + INTERVAL '1 day')`
    );
  }

  const whereClause = `WHERE ${allFilters.join(" AND ")}`;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM case_intake_requests cir
     JOIN users parent_u ON parent_u.id = cir.parent_id
     ${whereClause}`,
    params
  );

  const total = countResult.rows[0]?.total || 0;
  const offset = (page - 1) * limit;
  const listParams = [...params, limit, offset];
  const limitIndex = params.length + 1;
  const offsetIndex = params.length + 2;

  const result = await pool.query(
    `${ENRICHED_SELECT}
     ${whereClause}
     ORDER BY ${SPECIALIST_LIST_STATUS_ORDER}
     LIMIT $${limitIndex}
     OFFSET $${offsetIndex}`,
    listParams
  );

  return {
    items: result.rows.map(formatSpecialistListItem),
    pagination: {
      page,
      limit,
      total,
      total_pages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

const getSpecialistRequestById = async (requestId, specialistId) => {
  const row = await getRequestRowForSpecialist(requestId, specialistId, {
    includeAttachments: true,
  });

  return formatSpecialistRequestDetail(row);
};

const loadSpecialistOwnedRequest = async (requestId, specialistId, client = pool) => {
  const result = await client.query(
    `SELECT id, status, parent_id, assessment_notes
     FROM case_intake_requests
     WHERE id = $1
       AND assigned_specialist_id = $2`,
    [requestId, specialistId]
  );

  if (!result.rows[0]) {
    throw createError("Case intake request not found", 404);
  }

  return result.rows[0];
};

const startAssessment = async (requestId, specialistId) => {
  const conversationCheck = await pool.query(
    `SELECT cir.id
     FROM case_intake_requests cir
     INNER JOIN conversations conv ON conv.case_request_id = cir.id
     WHERE cir.id = $1
       AND cir.assigned_specialist_id = $2`,
    [requestId, specialistId]
  );

  if (!conversationCheck.rows[0]) {
    const owned = await pool.query(
      `SELECT id
       FROM case_intake_requests
       WHERE id = $1
         AND assigned_specialist_id = $2`,
      [requestId, specialistId]
    );

    if (!owned.rows[0]) {
      throw createError("Case intake request not found", 404);
    }

    throw createError(
      "Preliminary conversation not found for this case request",
      409
    );
  }

  const result = await pool.query(
    `UPDATE case_intake_requests
     SET status = 'under_assessment'::case_intake_status
     WHERE id = $1
       AND assigned_specialist_id = $2
       AND status = 'assigned'::case_intake_status
     RETURNING id, parent_id`,
    [requestId, specialistId]
  );

  if (!result.rows[0]) {
    throw createError("Only assigned case requests can start assessment", 409);
  }

  notificationsService
    .createNotification({
      user_id: result.rows[0].parent_id,
      type: "general",
      title: "Case assessment started",
      body: "The specialist has started the preliminary assessment for your case request.",
      related_entity_type: "case_intake_request",
      related_entity_id: requestId,
    })
    .catch(() => {});

  const row = await getRequestRowForSpecialist(requestId, specialistId);
  return formatSpecialistRequestDetail(row);
};

const updateAssessmentNotes = async (requestId, specialistId, assessmentNotes) => {
  const notes = assessmentNotes.trim();

  const result = await pool.query(
    `UPDATE case_intake_requests
     SET assessment_notes = $1
     WHERE id = $2
       AND assigned_specialist_id = $3
       AND status IN ('under_assessment'::case_intake_status, 'accepted'::case_intake_status)
     RETURNING id`,
    [notes, requestId, specialistId]
  );

  if (!result.rows[0]) {
    const request = await loadSpecialistOwnedRequest(requestId, specialistId);

    if (request.status === "assigned") {
      throw createError(
        "Start assessment before updating preliminary assessment notes",
        409
      );
    }

    throw createError(
      "Assessment notes can only be updated while under assessment or after acceptance",
      409
    );
  }

  const row = await getRequestRowForSpecialist(requestId, specialistId);
  return formatSpecialistRequestDetail(row);
};

const acceptCaseRequest = async (requestId, specialistId) => {
  const client = await pool.connect();
  const defaultConvertBody = {
    relationship: "guardian",
    is_primary_contact: true,
  };

  let conversion;
  let parentId;

  try {
    await client.query("BEGIN");

    const acceptResult = await client.query(
      `UPDATE case_intake_requests
       SET status = 'accepted'::case_intake_status,
           accepted_at = now(),
           rejection_reason = NULL
       WHERE id = $1
         AND assigned_specialist_id = $2
         AND status = 'under_assessment'::case_intake_status
         AND assessment_notes IS NOT NULL
         AND char_length(trim(assessment_notes)) > 0
       RETURNING id, parent_id`,
      [requestId, specialistId]
    );

    if (!acceptResult.rows[0]) {
      const request = await loadSpecialistOwnedRequest(requestId, specialistId);

      if (
        request.status === "under_assessment" &&
        !normalizeText(request.assessment_notes)
      ) {
        throw createError(
          "Assessment notes are required before accepting a case request",
          409
        );
      }

      throw createError("Only case requests under assessment can be accepted", 409);
    }

    parentId = acceptResult.rows[0].parent_id;

    conversion = await convertRequestToPatient(
      requestId,
      specialistId,
      defaultConvertBody,
      { client, deferNotifications: true }
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  notificationsService
    .createNotification({
      user_id: parentId,
      type: "case_request_accepted",
      title: "Case request accepted",
      body: "Your preliminary case request has been accepted by the specialist.",
      related_entity_type: "case_intake_request",
      related_entity_id: requestId,
    })
    .catch(() => {});

  notifyAllAdmins({
    type: "case_request_accepted",
    title: "Case request accepted",
    body: "A specialist accepted a preliminary case request.",
    related_entity_type: "case_intake_request",
    related_entity_id: requestId,
  }).catch(() => {});

  sendConversionNotifications({
    parentId,
    specialistId,
    fullName: conversion.patient.full_name,
    patientId: conversion.patient.id,
  });

  const row = await getRequestRowForSpecialist(requestId, specialistId);
  return {
    detail: formatSpecialistRequestDetail(row),
    conversion,
  };
};

const rejectCaseRequest = async (requestId, specialistId, reason) => {
  const trimmedReason = reason.trim();

  const result = await pool.query(
    `UPDATE case_intake_requests
     SET status = 'rejected'::case_intake_status,
         rejection_reason = $1
     WHERE id = $2
       AND assigned_specialist_id = $3
       AND status IN ('assigned'::case_intake_status, 'under_assessment'::case_intake_status)
     RETURNING id, parent_id`,
    [trimmedReason, requestId, specialistId]
  );

  if (!result.rows[0]) {
    const request = await loadSpecialistOwnedRequest(requestId, specialistId);

    if (["accepted", "rejected", "converted_to_patient"].includes(request.status)) {
      throw createError("This case request can no longer be rejected", 409);
    }

    throw createError("Only assigned or under-assessment requests can be rejected", 409);
  }

  notificationsService
    .createNotification({
      user_id: result.rows[0].parent_id,
      type: "case_request_rejected",
      title: "Case request declined",
      body: "Your preliminary case request was declined by the specialist.",
      related_entity_type: "case_intake_request",
      related_entity_id: requestId,
    })
    .catch(() => {});

  notifyAllAdmins({
    type: "case_request_rejected",
    title: "Case request rejected",
    body: "A specialist rejected a preliminary case request.",
    related_entity_type: "case_intake_request",
    related_entity_id: requestId,
  }).catch(() => {});

  const row = await getRequestRowForSpecialist(requestId, specialistId);
  return formatSpecialistRequestDetail(row);
};

const insertCaseHistory = async (
  client,
  patientId,
  userId,
  eventType,
  description
) => {
  await client.query(
    `INSERT INTO case_history (patient_id, changed_by, event_type, description)
     VALUES ($1, $2, $3, $4)`,
    [patientId, userId, eventType, description]
  );
};

const formatConvertedPatient = (row) => ({
  id: row.id,
  full_name: row.full_name,
  date_of_birth: toDateString(row.date_of_birth),
  gender: row.gender,
  profile_image_url: row.profile_image_url,
  created_by: row.created_by,
});

const sendConversionNotifications = ({
  parentId,
  specialistId,
  fullName,
  patientId,
}) => {
  notificationsService
    .createNotification({
      user_id: parentId,
      type: "case_request_converted",
      title: "Child profile is now active",
      body: `${fullName}'s official patient profile is now active.`,
      related_entity_type: "patient",
      related_entity_id: patientId,
    })
    .catch(() => {});

  notificationsService
    .createNotification({
      user_id: specialistId,
      type: "case_request_converted",
      title: "Case converted to patient",
      body: `${fullName}'s case request was converted to an official patient profile.`,
      related_entity_type: "patient",
      related_entity_id: patientId,
    })
    .catch(() => {});

  notifyAllAdmins({
    type: "case_request_converted",
    title: "Case request converted to patient",
    body: `${fullName}'s preliminary case request was converted to an official patient profile.`,
    related_entity_type: "patient",
    related_entity_id: patientId,
  }).catch(() => {});
};

const convertRequestToPatient = async (requestId, specialistId, body, options = {}) => {
  const ownsTransaction = !options.client;
  const client = options.client || (await pool.connect());
  const deferNotifications = Boolean(options.deferNotifications);

  try {
    if (ownsTransaction) {
      await client.query("BEGIN");
    }

    const requestResult = await client.query(
      `SELECT *
       FROM case_intake_requests
       WHERE id = $1
       FOR UPDATE`,
      [requestId]
    );

    const request = requestResult.rows[0];

    if (!request) {
      throw createError("Case intake request not found", 404);
    }

    if (request.assigned_specialist_id !== specialistId) {
      throw createError("Case intake request not found", 404);
    }

    if (request.status !== "accepted") {
      throw createError(
        "Only accepted case requests can be converted to a patient",
        409
      );
    }

    if (request.patient_id) {
      throw createError(
        "This case request has already been converted to a patient",
        409
      );
    }

    const parentResult = await client.query(
      `SELECT id, role
       FROM users
       WHERE id = $1`,
      [request.parent_id]
    );

    if (!parentResult.rows[0] || parentResult.rows[0].role !== "parent") {
      throw createError(
        "Parent account is invalid for this case request",
        409
      );
    }

    const specialistResult = await client.query(
      `SELECT id, role, is_active
       FROM users
       WHERE id = $1`,
      [specialistId]
    );

    if (!specialistResult.rows[0] || specialistResult.rows[0].role !== "specialist") {
      throw createError("Specialist account is invalid", 409);
    }

    if (!specialistResult.rows[0].is_active) {
      throw createError("Inactive specialists cannot convert case requests", 409);
    }

    const conversationResult = await client.query(
      `SELECT id, patient_id, parent_id, specialist_id, case_request_id
       FROM conversations
       WHERE case_request_id = $1
       FOR UPDATE`,
      [requestId]
    );

    if (conversationResult.rows.length !== 1) {
      throw createError(
        "Expected exactly one preliminary conversation for this case request",
        409
      );
    }

    const conversation = conversationResult.rows[0];

    const fullName = body.full_name?.trim() || request.child_name.trim();
    const dateOfBirth =
      body.date_of_birth?.trim() || toDateString(request.date_of_birth);
    const gender =
      body.gender !== undefined && body.gender !== null
        ? normalizeText(body.gender)
        : normalizeText(request.gender);
    const profileImageUrl =
      body.profile_image_url !== undefined && body.profile_image_url !== null
        ? normalizeText(body.profile_image_url)
        : normalizeText(request.child_image_url);

    if (profileImageUrl && !isTrustedUploadUrl(profileImageUrl)) {
      throw createError("Invalid or untrusted profile image URL", 400);
    }

    const relationship = body.relationship;
    const isPrimaryContact =
      body.is_primary_contact !== undefined
        ? Boolean(body.is_primary_contact)
        : true;

    const patientResult = await client.query(
      `INSERT INTO patients (full_name, date_of_birth, gender, profile_image_url, created_by)
       VALUES ($1, $2::date, $3, $4, $5)
       RETURNING *`,
      [fullName, dateOfBirth, gender, profileImageUrl, specialistId]
    );

    const patient = patientResult.rows[0];

    const guardianResult = await client.query(
      `INSERT INTO patient_guardians (patient_id, parent_id, relationship, is_primary_contact)
       VALUES ($1, $2, $3::relationship_type, $4)
       RETURNING patient_id, parent_id, relationship, is_primary_contact`,
      [patient.id, request.parent_id, relationship, isPrimaryContact]
    );

    const specialistLinkResult = await client.query(
      `INSERT INTO patient_specialists (patient_id, specialist_id, is_primary)
       VALUES ($1, $2, TRUE)
       RETURNING patient_id, specialist_id, is_primary`,
      [patient.id, specialistId]
    );

    const updatedRequestResult = await client.query(
      `UPDATE case_intake_requests
       SET status = 'converted_to_patient'::case_intake_status,
           patient_id = $1,
           converted_at = now()
       WHERE id = $2
         AND assigned_specialist_id = $3
         AND status = 'accepted'::case_intake_status
         AND patient_id IS NULL
       RETURNING id, status, patient_id, converted_at`,
      [patient.id, requestId, specialistId]
    );

    if (!updatedRequestResult.rows[0]) {
      throw createError(
        "This case request has already been converted to a patient",
        409
      );
    }

    const convertedRequest = updatedRequestResult.rows[0];

    const updatedConversationResult = await client.query(
      `UPDATE conversations
       SET patient_id = $1
       WHERE case_request_id = $2
       RETURNING id, case_request_id, patient_id`,
      [patient.id, requestId]
    );

    const updatedConversation = updatedConversationResult.rows[0];

    const historyDescription = `Converted from case intake request ${requestId}`;

    await insertCaseHistory(
      client,
      patient.id,
      specialistId,
      "patient_created_from_case_intake",
      historyDescription
    );
    await insertCaseHistory(
      client,
      patient.id,
      specialistId,
      "guardian_added",
      `Guardian linked during conversion from case intake request ${requestId}`
    );
    await insertCaseHistory(
      client,
      patient.id,
      specialistId,
      "specialist_assigned",
      `Specialist assigned during conversion from case intake request ${requestId}`
    );

    const conversionResult = {
      request: {
        id: convertedRequest.id,
        status: convertedRequest.status,
        patient_id: convertedRequest.patient_id,
        converted_at: convertedRequest.converted_at,
      },
      patient: formatConvertedPatient(patient),
      parent_link: {
        parent_id: guardianResult.rows[0].parent_id,
        relationship: guardianResult.rows[0].relationship,
        is_primary_contact: guardianResult.rows[0].is_primary_contact,
      },
      specialist_link: {
        specialist_id: specialistLinkResult.rows[0].specialist_id,
        is_primary: specialistLinkResult.rows[0].is_primary,
      },
      conversation: {
        id: updatedConversation.id,
        case_request_id: updatedConversation.case_request_id,
        patient_id: updatedConversation.patient_id,
      },
    };

    if (ownsTransaction) {
      await client.query("COMMIT");

      if (!deferNotifications) {
        sendConversionNotifications({
          parentId: request.parent_id,
          specialistId,
          fullName,
          patientId: patient.id,
        });
      }
    }

    return conversionResult;
  } catch (error) {
    if (ownsTransaction) {
      await client.query("ROLLBACK");
    }

    if (isUniqueViolation(error)) {
      throw createError(
        "This case request has already been converted to a patient",
        409
      );
    }

    throw error;
  } finally {
    if (ownsTransaction) {
      client.release();
    }
  }
};

const repairAcceptedCaseRequestConversion = async (requestId) => {
  const requestResult = await pool.query(
    `SELECT id, status, patient_id, assigned_specialist_id, child_name
     FROM case_intake_requests
     WHERE id = $1`,
    [requestId]
  );

  const request = requestResult.rows[0];

  if (!request) {
    throw createError("Case intake request not found", 404);
  }

  if (request.status === "converted_to_patient" && request.patient_id) {
    const patientResult = await pool.query(
      `SELECT *
       FROM patients
       WHERE id = $1`,
      [request.patient_id]
    );
    const patient = patientResult.rows[0];

    if (!patient) {
      throw createError(
        "Converted case request references a missing patient record",
        409
      );
    }

    const guardianResult = await pool.query(
      `SELECT patient_id, parent_id, relationship, is_primary_contact
       FROM patient_guardians
       WHERE patient_id = $1
       LIMIT 1`,
      [request.patient_id]
    );

    const specialistLinkResult = await pool.query(
      `SELECT patient_id, specialist_id, is_primary
       FROM patient_specialists
       WHERE patient_id = $1
       LIMIT 1`,
      [request.patient_id]
    );

    return {
      alreadyConverted: true,
      request: {
        id: request.id,
        status: request.status,
        patient_id: request.patient_id,
      },
      patient: formatConvertedPatient(patient),
      parent_link: guardianResult.rows[0] || null,
      specialist_link: specialistLinkResult.rows[0] || null,
    };
  }

  if (request.status !== "accepted" || request.patient_id) {
    throw createError(
      "Only accepted case requests without a patient can be repaired",
      409
    );
  }

  if (!request.assigned_specialist_id) {
    throw createError(
      "Case request is missing an assigned specialist for conversion",
      409
    );
  }

  const conversion = await convertRequestToPatient(
    requestId,
    request.assigned_specialist_id,
    {
      relationship: "guardian",
      is_primary_contact: true,
    }
  );

  return {
    alreadyConverted: false,
    ...conversion,
  };
};

module.exports = {
  createCaseIntakeRequest,
  listParentRequests,
  getParentRequestById,
  updatePendingRequest,
  addAttachment,
  deleteAttachment,
  listAdminInbox,
  getAdminRequestById,
  getMatchingSpecialistsForRequest,
  assignSpecialistToRequest,
  listSpecialistAssignedRequests,
  getSpecialistRequestById,
  startAssessment,
  updateAssessmentNotes,
  acceptCaseRequest,
  rejectCaseRequest,
  convertRequestToPatient,
  repairAcceptedCaseRequestConversion,
};
