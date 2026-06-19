const validateCreateProgressSnapshot = (req, res, next) => {
  const {
    patient_id,
    period,
    period_start,
    period_end,
    exercises_completed,
    average_performance,
    improvement_percentage
  } = req.body;

  if (!patient_id || !period || !period_start || !period_end) {
    return res.status(400).json({
      success: false,
      message: 'patient_id, period, period_start, and period_end are required'
    });
  }

  if (!['daily', 'weekly', 'monthly'].includes(period)) {
    return res.status(400).json({
      success: false,
      message: 'period must be daily, weekly, or monthly'
    });
  }

  if (exercises_completed !== undefined && exercises_completed < 0) {
    return res.status(400).json({
      success: false,
      message: 'exercises_completed cannot be negative'
    });
  }

  if (average_performance !== undefined && (average_performance < 0 || average_performance > 100)) {
    return res.status(400).json({
      success: false,
      message: 'average_performance must be between 0 and 100'
    });
  }

  if (improvement_percentage !== undefined && (improvement_percentage < 0 || improvement_percentage > 100)) {
    return res.status(400).json({
      success: false,
      message: 'improvement_percentage must be between 0 and 100'
    });
  }

  next();
};

module.exports = {
  validateCreateProgressSnapshot
};