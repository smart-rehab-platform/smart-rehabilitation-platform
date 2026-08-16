const supportRequestsService = require("./supportRequests.service");
const { createAuditLog } = require("../auditLogs/auditLogs.helper");

const sendSuccess = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    ...(error.code ? { code: error.code } : {}),
  });
};

exports.createSupportRequest = async (req, res) => {
  try {
    const data = await supportRequestsService.createSupportRequest({
      specialistId: req.user.id,
      category: req.body.category,
      subject: req.body.subject,
      description: req.body.description,
      attachmentUrl: req.body.attachment_url,
    });

    createAuditLog({
      userId: req.user.id,
      action: "support_request_created",
      entityName: "support_request",
      entityId: data.id,
    }).catch(() => {});

    sendSuccess(res, data, 201);
  } catch (error) {
    handleError(res, error);
  }
};

exports.listMySupportRequests = async (req, res) => {
  try {
    const data = await supportRequestsService.listSpecialistSupportRequests(
      req.user.id,
      req.validatedQuery ?? req.query
    );
    sendSuccess(res, data);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getMySupportRequestById = async (req, res) => {
  try {
    const data = await supportRequestsService.getSpecialistSupportRequestById(
      req.user.id,
      req.params.id
    );
    sendSuccess(res, data);
  } catch (error) {
    handleError(res, error);
  }
};

exports.addSpecialistMessage = async (req, res) => {
  try {
    const { request } = await supportRequestsService.addSpecialistMessage({
      specialistId: req.user.id,
      supportRequestId: req.params.id,
      content: req.body.content,
      attachmentUrl: req.body.attachment_url,
    });
    sendSuccess(res, request, 201);
  } catch (error) {
    handleError(res, error);
  }
};

exports.listAdminSupportRequests = async (req, res) => {
  try {
    const data = await supportRequestsService.listAdminSupportRequests(
      req.validatedQuery ?? req.query
    );
    sendSuccess(res, data);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getAdminSupportRequestById = async (req, res) => {
  try {
    const data = await supportRequestsService.getAdminSupportRequestById(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    handleError(res, error);
  }
};

exports.addAdminMessage = async (req, res) => {
  try {
    const { request } = await supportRequestsService.addAdminMessage({
      adminId: req.user.id,
      supportRequestId: req.params.id,
      content: req.body.content,
      attachmentUrl: req.body.attachment_url,
    });
    sendSuccess(res, request, 201);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateSupportRequestStatus = async (req, res) => {
  try {
    const data = await supportRequestsService.updateSupportRequestStatus({
      adminId: req.user.id,
      supportRequestId: req.params.id,
      status: req.body.status,
    });

    createAuditLog({
      userId: req.user.id,
      action: "support_request_status_changed",
      entityName: "support_request",
      entityId: data.id,
    }).catch(() => {});

    if (data.status === "resolved") {
      createAuditLog({
        userId: req.user.id,
        action: "support_request_resolved",
        entityName: "support_request",
        entityId: data.id,
      }).catch(() => {});
    }

    sendSuccess(res, data);
  } catch (error) {
    handleError(res, error);
  }
};
