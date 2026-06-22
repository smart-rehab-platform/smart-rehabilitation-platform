const validateGenerateReport = (req, res, next) => {
  const { patient_id, period_start, period_end } = req.body;

  if (!patient_id || !period_start || !period_end) {
    return res.status(400).json({
      success: false,
      message: "patient_id, period_start, and period_end are required"
    });
  }

  const startDate = new Date(period_start);
  const endDate = new Date(period_end);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (startDate > endDate) {
    return res.status(400).json({
      success: false,
      message: "period_start cannot be after period_end"
    });
  }

  if (endDate > today) {
    return res.status(400).json({
      success: false,
      message: "Cannot generate report for a period that has not ended yet"
    });
  }

  next();
};

module.exports = {
  validateGenerateReport
};