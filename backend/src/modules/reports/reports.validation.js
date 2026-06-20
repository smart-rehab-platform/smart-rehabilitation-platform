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

const validateExportPdf = (req, res, next) => {
  const { pdf_url } = req.body;

  if (!pdf_url) {
    return res.status(400).json({
      success: false,
      message: "pdf_url is required"
    });
  }

  next();
};

module.exports = {
  validateCreateReport,
  validateExportPdf
};