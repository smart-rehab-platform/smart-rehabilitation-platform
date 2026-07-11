const specialistFeedbackService = require("./specialistFeedback.service");

const submitFeedback = async (req, res) => {
  try {
    const feedback = await specialistFeedbackService.submitFeedback({
      parentId: req.user.id,
      patientId: req.body.patient_id.trim(),
      treatmentPlanId: req.body.treatment_plan_id.trim(),
      rating: Number(req.body.rating),
      comment: req.body.comment?.trim() || null
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

const checkFeedback = async (req, res) => {
  try {
    const result = await specialistFeedbackService.checkFeedback({
      parentId: req.user.id,
      treatmentPlanId: req.params.treatmentPlanId
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

const getSpecialistFeedback = async (req, res) => {
  try {
    const { specialistId } = req.params;

    if (req.user.role === "specialist" && req.user.id !== specialistId) {
      return res.status(403).json({
        success: false,
        message: "You can only view feedback for your own specialist profile"
      });
    }

    const feedback = await specialistFeedbackService.getSpecialistFeedback(
      specialistId
    );

    return res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

const getSpecialistFeedbackSummary = async (req, res) => {
  try {
    const { specialistId } = req.params;

    if (req.user.role === "specialist" && req.user.id !== specialistId) {
      return res.status(403).json({
        success: false,
        message: "You can only view feedback summary for your own specialist profile"
      });
    }

    const summary = await specialistFeedbackService.getSpecialistFeedbackSummary(
      specialistId
    );

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  submitFeedback,
  checkFeedback,
  getSpecialistFeedback,
  getSpecialistFeedbackSummary
};
