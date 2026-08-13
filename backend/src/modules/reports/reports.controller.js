const reportsService = require("./reports.service");

const createReport = async (req, res) => {
  try {
    const report = await reportsService.createReport({
      patient_id: req.body.patient_id,
      generated_by: req.user.id,
      report_type: req.body.report_type,
      title: req.body.title,
      summary: req.body.summary,
    });

    return res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: report
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await reportsService.getAllReports(req.user);

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await reportsService.getReportById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    await reportsService.assertActorCanAccessReportPatient(req.user, report.patient_id);

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await reportsService.deleteReport(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
      data: report
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getPatientReports = async (req, res) => {
  try {
    const reports = await reportsService.getPatientReports(req.params.id);

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getPatientWeeklyReports = async (req, res) => {
  try {
    const reports = await reportsService.getPatientWeeklyReports(req.params.id);

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getPatientMonthlyReports = async (req, res) => {
  try {
    const reports = await reportsService.getPatientMonthlyReports(req.params.id);

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const exportReportPdf = async (req, res) => {
  try {
    const result = await reportsService.exportReportPdf(req.params.id, req.user);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "PDF generated successfully",
      data: result
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  deleteReport,
  getPatientReports,
  getPatientWeeklyReports,
  getPatientMonthlyReports,
  exportReportPdf
};
