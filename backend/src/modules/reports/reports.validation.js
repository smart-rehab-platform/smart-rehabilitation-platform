const validateCreateReport = (req, res, next) => {
  const { patient_id, report_type } = req.body;

  if (!patient_id || !report_type) {
    return res.status(400).json({
      success: false,
      message: "patient_id and report_type are required"
    });
  }

  next();
};

module.exports = {
  validateCreateReport
};
