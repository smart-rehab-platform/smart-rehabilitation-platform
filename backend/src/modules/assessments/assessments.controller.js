const assessmentsService = require("./assessments.service");

const createAssessment = async (req, res) => {
  try {
    const assessment = await assessmentsService.createAssessment(
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Assessment created successfully",
      data: assessment
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllAssessments = async (req, res) => {
  try {
    const assessments = await assessmentsService.getAllAssessments();

    return res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const assessment = await assessmentsService.getAssessmentById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateAssessment = async (req, res) => {
  try {
    const assessment = await assessmentsService.updateAssessment(
      req.params.id,
      req.body,
      req.user.id
    );

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assessment updated successfully",
      data: assessment
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const assessment = await assessmentsService.deleteAssessment(
      req.params.id,
      req.user.id
    );

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assessment deleted successfully",
      data: assessment
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createAssessmentResult = async (req, res) => {
  try {
    const result = await assessmentsService.createAssessmentResult(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Assessment result added successfully",
      data: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAssessmentResults = async (req, res) => {
  try {
    const results = await assessmentsService.getAssessmentResults(req.params.id);

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPatientAssessments = async (req, res) => {
  try {
    const assessments = await assessmentsService.getPatientAssessments(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  createAssessmentResult,
  getAssessmentResults,
  getPatientAssessments
};