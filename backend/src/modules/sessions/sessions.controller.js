const sessionsService = require("./sessions.service");

const createSession = async (req, res) => {
  try {
    const session = await sessionsService.createSession(req.body);

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
    const session = await sessionsService.updateSession(req.params.id, req.body);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Session updated successfully",
      data: session
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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

    return res.status(200).json({
      success: true,
      message: "Session completed successfully",
      data: session
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const cancelSession = async (req, res) => {
  try {
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

    return res.status(200).json({
      success: true,
      message: "Session cancelled successfully",
      data: session
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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

    return res.status(200).json({
      success: true,
      message: "Session marked as no-show successfully",
      data: session
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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