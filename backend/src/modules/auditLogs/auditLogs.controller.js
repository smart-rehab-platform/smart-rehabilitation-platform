const auditLogsService = require("./auditLogs.service");

const getAllAuditLogs = async (req, res, next) => {
  try {
    const logs = await auditLogsService.getAllAuditLogs({
      user_id: req.query.user_id,
      action: req.query.action,
      entity_name: req.query.entity_name,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

const getAuditLogById = async (req, res, next) => {
  try {
    const log = await auditLogsService.getAuditLogById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

const getAuditLogsByUser = async (req, res, next) => {
  try {
    const logs = await auditLogsService.getAuditLogsByUser(
      req.params.userId
    );

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

const getAuditLogsByEntity = async (req, res, next) => {
  try {
    const logs = await auditLogsService.getAuditLogsByEntity(
      req.params.entityName,
      req.params.entityId
    );

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAuditLogs,
  getAuditLogById,
  getAuditLogsByUser,
  getAuditLogsByEntity,
};