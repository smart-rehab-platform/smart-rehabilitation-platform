const aiReportsService = require("./aiReports.service");

const generateWeeklyReport = async (req, res) => {
  try {
    const report = await aiReportsService.generateReport({
      patient_id: req.body.patient_id,
      period_start: req.body.period_start,
      period_end: req.body.period_end,
      type: "weekly",
      generated_by: req.user.id,
      language: req.body.language,
    });

    res.status(201).json({
      success: true,
      message: "Weekly AI report generated successfully",
      data: report
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

const generateMonthlyReport = async (req, res) => {
  try {
    const report = await aiReportsService.generateReport({
      patient_id: req.body.patient_id,
      period_start: req.body.period_start,
      period_end: req.body.period_end,
      type: "monthly",
      generated_by: req.user.id,
      language: req.body.language,
    });

    res.status(201).json({
      success: true,
      message: "Monthly AI report generated successfully",
      data: report
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await aiReportsService.getAllReports(req.user);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await aiReportsService.getReportById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "AI report not found"
      });
    }

    await aiReportsService.assertActorCanReadPatientAiReports(
      req.user,
      report.patient_id
    );

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

const getReportsByPatient = async (req, res) => {
  try {
    const reports = await aiReportsService.getReportsByPatient(req.params.id);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const exportReportPdf = async (req, res) => {
  try {
    const result = await aiReportsService.exportReportPdf(req.params.id, req.user);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "AI report not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "AI report PDF generated successfully",
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  generateWeeklyReport,
  generateMonthlyReport,
  getAllReports,
  getReportById,
  getReportsByPatient,
  exportReportPdf,
};