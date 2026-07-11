const validateSubmitFeedback = (req, res, next) => {
  const { patient_id, treatment_plan_id, rating, comment, parent_id, specialist_id } =
    req.body || {};

  if (parent_id !== undefined) {
    return res.status(400).json({
      success: false,
      message: "parent_id must not be sent in the request body"
    });
  }

  if (specialist_id !== undefined) {
    return res.status(400).json({
      success: false,
      message: "specialist_id must not be sent in the request body"
    });
  }

  if (!patient_id || typeof patient_id !== "string" || !patient_id.trim()) {
    return res.status(400).json({
      success: false,
      message: "patient_id is required"
    });
  }

  if (
    !treatment_plan_id ||
    typeof treatment_plan_id !== "string" ||
    !treatment_plan_id.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "treatment_plan_id is required"
    });
  }

  if (rating === undefined || rating === null) {
    return res.status(400).json({
      success: false,
      message: "rating is required"
    });
  }

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      success: false,
      message: "rating must be an integer between 1 and 5"
    });
  }

  if (comment !== undefined && comment !== null && typeof comment !== "string") {
    return res.status(400).json({
      success: false,
      message: "comment must be a string when provided"
    });
  }

  next();
};

const validateTreatmentPlanIdParam = (req, res, next) => {
  const { treatmentPlanId } = req.params;

  if (!treatmentPlanId || !treatmentPlanId.trim()) {
    return res.status(400).json({
      success: false,
      message: "treatmentPlanId is required"
    });
  }

  next();
};

const validateSpecialistIdParam = (req, res, next) => {
  const { specialistId } = req.params;

  if (!specialistId || !specialistId.trim()) {
    return res.status(400).json({
      success: false,
      message: "specialistId is required"
    });
  }

  next();
};

module.exports = {
  validateSubmitFeedback,
  validateTreatmentPlanIdParam,
  validateSpecialistIdParam
};
