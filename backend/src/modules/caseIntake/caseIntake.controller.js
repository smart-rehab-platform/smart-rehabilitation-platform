const caseIntakeService = require("./caseIntake.service");
const { createAuditLog } = require("../auditLogs/auditLogs.helper");

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? "Request failed." : error.message || "Request failed.";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const createCaseIntakeRequest = async (req, res) => {
  try {
    const request = await caseIntakeService.createCaseIntakeRequest(
      req.user.id,
      req.body
    );

    createAuditLog({
      userId: req.user.id,
      action: "case_intake_request_create",
      entityName: "case_intake_request",
      entityId: request.id,
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Case intake request submitted successfully",
      data: request,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const listMyRequests = async (req, res) => {
  try {
    const status = req.query.status || null;
    const categoryId = req.query.category_id || null;

    const requests = await caseIntakeService.listParentRequests(req.user.id, {
      status,
      categoryId,
    });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getMyRequestById = async (req, res) => {
  try {
    const request = await caseIntakeService.getParentRequestById(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateMyRequest = async (req, res) => {
  try {
    const request = await caseIntakeService.updatePendingRequest(
      req.params.id,
      req.user.id,
      req.body
    );

    createAuditLog({
      userId: req.user.id,
      action: "case_intake_request_update",
      entityName: "case_intake_request",
      entityId: request.id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Case intake request updated successfully",
      data: request,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const addAttachment = async (req, res) => {
  try {
    const attachment = await caseIntakeService.addAttachment(
      req.params.id,
      req.user.id,
      {
        fileUrl: req.body.file_url,
        fileType: req.body.file_type,
        originalName: req.body.original_name,
      }
    );

    createAuditLog({
      userId: req.user.id,
      action: "case_intake_attachment_add",
      entityName: "case_intake_request",
      entityId: req.params.id,
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Attachment added successfully",
      data: attachment,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const attachment = await caseIntakeService.deleteAttachment(
      req.params.id,
      req.user.id,
      req.params.attachmentId
    );

    createAuditLog({
      userId: req.user.id,
      action: "case_intake_attachment_delete",
      entityName: "case_intake_request",
      entityId: req.params.id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Attachment deleted successfully",
      data: attachment,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const listAdminInbox = async (req, res) => {
  try {
    const result = await caseIntakeService.listAdminInbox(req.adminInboxQuery);

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getAdminRequestById = async (req, res) => {
  try {
    const request = await caseIntakeService.getAdminRequestById(req.params.id);

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getMatchingSpecialists = async (req, res) => {
  try {
    const specialists = await caseIntakeService.getMatchingSpecialistsForRequest(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      count: specialists.length,
      data: specialists,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const assignSpecialist = async (req, res) => {
  try {
    const result = await caseIntakeService.assignSpecialistToRequest(
      req.params.id,
      req.user.id,
      req.body.specialist_id.trim()
    );

    createAuditLog({
      userId: req.user.id,
      action: "case_intake_request_assign",
      entityName: "case_intake_request",
      entityId: req.params.id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Specialist assigned successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const listSpecialistAssigned = async (req, res) => {
  try {
    const result = await caseIntakeService.listSpecialistAssignedRequests(
      req.user.id,
      req.specialistListQuery
    );

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getSpecialistRequestById = async (req, res) => {
  try {
    const request = await caseIntakeService.getSpecialistRequestById(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const startAssessment = async (req, res) => {
  try {
    const request = await caseIntakeService.startAssessment(
      req.params.id,
      req.user.id
    );

    createAuditLog({
      userId: req.user.id,
      action: "case_intake_assessment_start",
      entityName: "case_intake_request",
      entityId: req.params.id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Assessment started successfully",
      data: request,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateAssessmentNotes = async (req, res) => {
  try {
    const request = await caseIntakeService.updateAssessmentNotes(
      req.params.id,
      req.user.id,
      req.body.assessment_notes
    );

    createAuditLog({
      userId: req.user.id,
      action: "case_intake_assessment_notes_update",
      entityName: "case_intake_request",
      entityId: req.params.id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Assessment notes updated successfully",
      data: request,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const acceptCaseRequest = async (req, res) => {
  try {
    const request = await caseIntakeService.acceptCaseRequest(
      req.params.id,
      req.user.id
    );

    createAuditLog({
      userId: req.user.id,
      action: "case_intake_request_accept",
      entityName: "case_intake_request",
      entityId: req.params.id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Case request accepted successfully",
      data: request,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const rejectCaseRequest = async (req, res) => {
  try {
    const request = await caseIntakeService.rejectCaseRequest(
      req.params.id,
      req.user.id,
      req.body.reason
    );

    createAuditLog({
      userId: req.user.id,
      action: "case_intake_request_reject",
      entityName: "case_intake_request",
      entityId: req.params.id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Case request rejected successfully",
      data: request,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const convertToPatient = async (req, res) => {
  try {
    const result = await caseIntakeService.convertRequestToPatient(
      req.params.id,
      req.user.id,
      req.convertBody
    );

    createAuditLog({
      userId: req.user.id,
      action: "case_intake_request_convert",
      entityName: "patient",
      entityId: result.patient.id,
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Case request converted to patient successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createCaseIntakeRequest,
  listMyRequests,
  getMyRequestById,
  updateMyRequest,
  addAttachment,
  deleteAttachment,
  listAdminInbox,
  getAdminRequestById,
  getMatchingSpecialists,
  assignSpecialist,
  listSpecialistAssigned,
  getSpecialistRequestById,
  startAssessment,
  updateAssessmentNotes,
  acceptCaseRequest,
  rejectCaseRequest,
  convertToPatient,
};
