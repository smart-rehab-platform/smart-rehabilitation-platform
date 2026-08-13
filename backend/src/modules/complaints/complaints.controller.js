const complaintsService = require("./complaints.service");
const { createAuditLog } = require("../auditLogs/auditLogs.helper");

const sendSuccess = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

exports.createComplaint = async (req, res, next) => {
  try {
    const data = await complaintsService.createComplaint({
      parentId: req.user.id,
      patientId: req.body.patient_id,
      specialistId: req.body.specialist_id,
      category: req.body.category,
      description: req.body.description,
      attachmentUrl: req.body.attachment_url,
    });

    createAuditLog({
      userId: req.user.id,
      action: "complaint_submitted",
      entityName: "complaint",
      entityId: data.id,
    }).catch(() => {});

    sendSuccess(res, data, 201);
  } catch (error) {
    next(error);
  }
};

exports.listMyComplaints = async (req, res, next) => {
  try {
    const data = await complaintsService.listParentComplaints(req.user.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

exports.getMyComplaintById = async (req, res, next) => {
  try {
    const data = await complaintsService.getParentComplaintById(
      req.user.id,
      req.params.id
    );
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

exports.listAdminComplaints = async (req, res, next) => {
  try {
    const data = await complaintsService.listAdminComplaints(
      req.validatedQuery ?? req.query
    );
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

exports.getAdminComplaintById = async (req, res, next) => {
  try {
    const data = await complaintsService.getAdminComplaintById(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

exports.startComplaintReview = async (req, res, next) => {
  try {
    const { complaint } = await complaintsService.startComplaintReview({
      complaintId: req.params.id,
      adminId: req.user.id,
    });

    createAuditLog({
      userId: req.user.id,
      action: "complaint_review_started",
      entityName: "complaint",
      entityId: complaint.id,
    }).catch(() => {});

    sendSuccess(res, complaint);
  } catch (error) {
    next(error);
  }
};

exports.resolveComplaint = async (req, res, next) => {
  try {
    const { complaint, warning } = await complaintsService.resolveComplaint({
      complaintId: req.params.id,
      adminId: req.user.id,
      adminNotes: req.body.admin_notes,
      parentResponse: req.body.parent_response,
    });

    createAuditLog({
      userId: req.user.id,
      action: "complaint_resolved",
      entityName: "complaint",
      entityId: complaint.id,
    }).catch(() => {});

    if (warning) {
      createAuditLog({
        userId: req.user.id,
        action: "specialist_warning_issued",
        entityName: "specialist_warning",
        entityId: warning.id,
      }).catch(() => {});
    }

    sendSuccess(res, { complaint, warning });
  } catch (error) {
    next(error);
  }
};

exports.rejectComplaint = async (req, res, next) => {
  try {
    const { complaint } = await complaintsService.rejectComplaint({
      complaintId: req.params.id,
      adminId: req.user.id,
      adminNotes: req.body.admin_notes,
      parentResponse: req.body.parent_response,
    });

    createAuditLog({
      userId: req.user.id,
      action: "complaint_rejected",
      entityName: "complaint",
      entityId: complaint.id,
    }).catch(() => {});

    sendSuccess(res, complaint);
  } catch (error) {
    next(error);
  }
};

exports.getSpecialistComplaintsSummary = async (req, res, next) => {
  try {
    const data = await complaintsService.getSpecialistComplaintsSummary(
      req.params.id
    );
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
