const validateCreateAssignedExercise = (req, res, next) => {
  const { exercise_id, plan_id, patient_id } = req.body;

  if (!exercise_id || !plan_id || !patient_id) {
    return res.status(400).json({
      success: false,
      message: "exercise_id, plan_id, and patient_id are required"
    });
  }

  next();
};

const validateUpdateAssignedExercise = (req, res, next) => {
  const allowedFields = ["frequency", "start_date", "due_date", "is_active"];
  const bodyFields = Object.keys(req.body);

  const invalidFields = bodyFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid fields: ${invalidFields.join(", ")}`
    });
  }

  next();
};

module.exports = {
  validateCreateAssignedExercise,
  validateUpdateAssignedExercise
};