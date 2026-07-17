const treatmentPlansService = require("./treatmentPlans.service");

const handleError = (res, err, fallbackMessage) => {
  const statusCode = err?.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? fallbackMessage : err.message,
  });
};

const createTreatmentPlan = async (req, res) => {
  try {
    const plan = await treatmentPlansService.createTreatmentPlan(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Treatment plan created successfully",
      data: plan,
    });
  } catch (err) {
    return handleError(res, err, "Failed to create treatment plan.");
  }
};

const getAllTreatmentPlans = async (req, res) => {
  try {
    const plans = await treatmentPlansService.getAllTreatmentPlans();

    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (err) {
    return handleError(res, err, "Failed to load treatment plans.");
  }
};

const getTreatmentPlanById = async (req, res) => {
  try {
    const plan = await treatmentPlansService.getTreatmentPlanById(
      req.params.id
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Treatment plan not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (err) {
    return handleError(res, err, "Failed to load treatment plan.");
  }
};

const updateTreatmentPlan = async (req, res) => {
  try {
    const plan = await treatmentPlansService.updateTreatmentPlan(
      req.params.id,
      req.body,
      req.user
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Treatment plan not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Treatment plan updated successfully",
      data: plan,
    });
  } catch (err) {
    return handleError(res, err, "Failed to update treatment plan.");
  }
};

const deleteTreatmentPlan = async (req, res) => {
  try {
    const plan = await treatmentPlansService.deleteTreatmentPlan(
      req.params.id,
      req.user
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Treatment plan not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Treatment plan deleted successfully",
      data: plan,
    });
  } catch (err) {
    return handleError(res, err, "Failed to delete treatment plan.");
  }
};

const archiveTreatmentPlan = async (req, res) => {
  try {
    const plan = await treatmentPlansService.archiveTreatmentPlan(
      req.params.id,
      req.user
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Treatment plan not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Treatment plan archived successfully",
      data: plan,
    });
  } catch (err) {
    return handleError(res, err, "Failed to archive treatment plan.");
  }
};

const completeTreatmentPlan = async (req, res) => {
  try {
    const plan = await treatmentPlansService.completeTreatmentPlan(
      req.params.id,
      req.user
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Treatment plan not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Treatment plan completed successfully",
      data: plan,
    });
  } catch (err) {
    return handleError(res, err, "Failed to complete treatment plan.");
  }
};

const getPatientTreatmentPlans = async (req, res) => {
  try {
    const plans = await treatmentPlansService.getPatientTreatmentPlans(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (err) {
    return handleError(res, err, "Failed to load patient treatment plans.");
  }
};

const createTreatmentPlanRevision = async (req, res) => {
  try {
    const revision = await treatmentPlansService.createTreatmentPlanRevision(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Treatment plan revision created successfully",
      data: revision,
    });
  } catch (err) {
    return handleError(res, err, "Failed to create treatment plan revision.");
  }
};

const getTreatmentPlanRevisions = async (req, res) => {
  try {
    const revisions = await treatmentPlansService.getTreatmentPlanRevisions(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      count: revisions.length,
      data: revisions,
    });
  } catch (err) {
    return handleError(res, err, "Failed to load treatment plan revisions.");
  }
};

module.exports = {
  createTreatmentPlan,
  getAllTreatmentPlans,
  getTreatmentPlanById,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  archiveTreatmentPlan,
  completeTreatmentPlan,
  getPatientTreatmentPlans,
  createTreatmentPlanRevision,
  getTreatmentPlanRevisions,
};
