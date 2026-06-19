const exerciseSubmissionsService = require("./exerciseSubmissions.service");

const createExerciseSubmission = async (req, res) => {
  try {
    const submission =
      await exerciseSubmissionsService.createExerciseSubmission(req.body, req.user.id);

    return res.status(201).json({
      success: true,
      message: "Exercise submission created successfully",
      data: submission
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllExerciseSubmissions = async (req, res) => {
  try {
    const submissions = await exerciseSubmissionsService.getAllExerciseSubmissions();

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getExerciseSubmissionById = async (req, res) => {
  try {
    const submission =
      await exerciseSubmissionsService.getExerciseSubmissionById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Exercise submission not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: submission
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateExerciseSubmission = async (req, res) => {
  try {
    const submission =
      await exerciseSubmissionsService.updateExerciseSubmission(req.params.id, req.body);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Exercise submission not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exercise submission updated successfully",
      data: submission
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteExerciseSubmission = async (req, res) => {
  try {
    const submission =
      await exerciseSubmissionsService.deleteExerciseSubmission(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Exercise submission not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exercise submission deleted successfully",
      data: submission
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const addSubmissionMedia = async (req, res) => {
  try {
    const media =
      await exerciseSubmissionsService.addSubmissionMedia(req.params.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Submission media added successfully",
      data: media
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getSubmissionMedia = async (req, res) => {
  try {
    const media = await exerciseSubmissionsService.getSubmissionMedia(req.params.id);

    return res.status(200).json({
      success: true,
      count: media.length,
      data: media
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAssignedExerciseSubmissions = async (req, res) => {
  try {
    const submissions =
      await exerciseSubmissionsService.getAssignedExerciseSubmissions(req.params.id);

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPatientSubmissions = async (req, res) => {
  try {
    const submissions =
      await exerciseSubmissionsService.getPatientSubmissions(req.params.id);

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createExerciseSubmission,
  getAllExerciseSubmissions,
  getExerciseSubmissionById,
  updateExerciseSubmission,
  deleteExerciseSubmission,
  addSubmissionMedia,
  getSubmissionMedia,
  getAssignedExerciseSubmissions,
  getPatientSubmissions
};