const sessionRequestsService = require("./sessionRequests.service");

const createSessionRequest = async (req, res) => {
  try {
    const request = await sessionRequestsService.createSessionRequest({
      parentId: req.user.id,
      patientId: req.body.patient_id.trim(),
      specialistId: req.body.specialist_id.trim(),
      reason: req.body.reason,
      reasonOtherText:
        req.body.reason === "other"
          ? req.body.reason_other_text.trim()
          : req.body.reason_other_text?.trim() || null,
      preferredDate: req.body.preferred_date.trim(),
      preferredTimePeriod: req.body.preferred_time_period,
      notes: req.body.notes?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      message: "Session request submitted successfully",
      data: request,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const listMyRequests = async (req, res) => {
  try {
    const status = req.query.status || null;
    const requests = await sessionRequestsService.listParentRequests(
      req.user.id,
      status
    );

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const listInbox = async (req, res) => {
  try {
    const status = req.query.status || null;
    const requests = await sessionRequestsService.listSpecialistInbox(
      req.user.id,
      status
    );

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveSessionRequest = async (req, res) => {
  try {
    const durationMinutes =
      req.body.duration_minutes === undefined ||
      req.body.duration_minutes === null
        ? 45
        : Number(req.body.duration_minutes);

    const result = await sessionRequestsService.approveSessionRequest({
      requestId: req.params.id.trim(),
      specialistId: req.user.id,
      scheduledAt: req.body.scheduled_at.trim(),
      durationMinutes,
      locationOrLink: req.body.location_or_link?.trim() || null,
    });

    return res.status(200).json({
      success: true,
      message: "Session request approved and session created",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectSessionRequest = async (req, res) => {
  try {
    const request = await sessionRequestsService.rejectSessionRequest({
      requestId: req.params.id.trim(),
      specialistId: req.user.id,
      rejectionReason: req.body.rejection_reason.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Session request rejected",
      data: request,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSessionRequest,
  listMyRequests,
  listInbox,
  approveSessionRequest,
  rejectSessionRequest,
};
