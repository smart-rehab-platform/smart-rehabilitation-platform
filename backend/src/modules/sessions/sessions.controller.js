const sessionsService = require("./sessions.service");
const {
  assertSpecialistCanManageUpcomingSession,
  notifyGuardiansOfSessionChange,
} = require("./sessions.notifications");
const { createAuditLog } = require("../auditLogs/auditLogs.helper");

const logSessionAction = (req, action, session) => {
  if (!session) {
    return;
  }

  createAuditLog({
    userId: req.user?.id,
    action,
    entityName: "session",
    entityId: session.id,
  }).catch(() => {});
};

const assertSpecialistOwnsSession = (req, session) => {
  if (!req.user || req.user.role !== "specialist") {
    return;
  }

  const requesterId = String(req.user.id || "").trim();
  if (!requesterId || String(session.specialist_id) !== requesterId) {
    const error = new Error("Access forbidden. You do not have permission");
    error.statusCode = 403;
    throw error;
  }
};

const notifyGuardiansSafely = async (session, event) => {
  try {
    await notifyGuardiansOfSessionChange(session, event);
  } catch (error) {
    console.error(
      `[sessions] Failed to notify guardians for ${event} session ${session?.id}:`,
      error.message
    );
  }
};

const createSession = async (req, res) => {
  try {
    const session = await sessionsService.createSession(req.body);

    logSessionAction(req, "session_create", session);

    return res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: session
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const sessions = await sessionsService.getAllSessions();

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await sessionsService.getSessionById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateSession = async (req, res) => {
  try {
    // Fetch existing session to enforce owner-only updates for specialists
    const existing = await sessionsService.getSessionById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // sessions.specialist_id references users.id (same as req.user.id).
    if (req.user && req.user.role === "specialist") {
      assertSpecialistOwnsSession(req, existing);
      assertSpecialistCanManageUpcomingSession(existing);
    }

    const session = await sessionsService.updateSession(req.params.id, req.body);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    logSessionAction(req, "session_update", session);

    if (req.user && req.user.role === "specialist") {
      const detail = await sessionsService.getSessionById(session.id);
      await notifyGuardiansSafely(detail || session, "updated");
    }

    return res.status(200).json({
      success: true,
      message: "Session updated successfully",
      data: session
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await sessionsService.deleteSession(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    logSessionAction(req, "session_delete", session);

    return res.status(200).json({
      success: true,
      message: "Session deleted successfully",
      data: session
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const completeSession = async (req, res) => {
  try {
    const session = await sessionsService.updateSessionStatus(
      req.params.id,
      "completed"
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    logSessionAction(req, "session_complete", session);

    return res.status(200).json({
      success: true,
      message: "Session completed successfully",
      data: session
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }
};

const cancelSession = async (req, res) => {
  try {
    // Fetch existing session to enforce owner-only cancellation for specialists
    const existing = await sessionsService.getSessionById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // sessions.specialist_id references users.id (same as req.user.id).
    if (req.user && req.user.role === "specialist") {
      assertSpecialistOwnsSession(req, existing);
      assertSpecialistCanManageUpcomingSession(existing);
    }

    const session = await sessionsService.cancelSession(
      req.params.id,
      req.body.cancellation_reason
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    logSessionAction(req, "session_cancel", session);

    if (req.user && req.user.role === "specialist") {
      const detail = await sessionsService.getSessionById(session.id);
      await notifyGuardiansSafely(
        {
          ...(detail || existing),
          ...session,
          patient_name: detail?.patient_name || existing.patient_name,
          scheduled_at: session.scheduled_at || existing.scheduled_at,
        },
        "cancelled"
      );
    }

    return res.status(200).json({
      success: true,
      message: "Session cancelled successfully",
      data: session
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }
};

const markNoShow = async (req, res) => {
  try {
    const session = await sessionsService.updateSessionStatus(
      req.params.id,
      "no_show"
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    logSessionAction(req, "session_no_show", session);

    return res.status(200).json({
      success: true,
      message: "Session marked as no-show successfully",
      data: session
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }
};

const getPatientSessions = async (req, res) => {
  try {
    const sessions = await sessionsService.getPatientSessions(req.params.id);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getSpecialistSessions = async (req, res) => {
  try {
    const sessions = await sessionsService.getSpecialistSessions(req.params.id);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getParentSessions = async (req, res) => {
  try {
    const sessions = await sessionsService.getParentSessions(req.params.id);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
  completeSession,
  cancelSession,
  markNoShow,
  getPatientSessions,
  getSpecialistSessions,
  getParentSessions
};
