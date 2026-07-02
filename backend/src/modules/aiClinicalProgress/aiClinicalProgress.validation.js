const Joi = require("joi");

const patientIdParamSchema = Joi.object({
  id: Joi.string().guid({ version: ["uuidv4", "uuidv5"] }).required().messages({
    "any.required": "Patient id is required",
    "string.empty": "Patient id is required",
    "string.guid": "Patient id must be a valid UUID"
  })
});

const validateGetPatientAiProgressNotes = (req, res, next) => {
  const { error, value } = patientIdParamSchema.validate(req.params, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  req.params = value;
  next();
};

const validateGeneratePatientClinicalSummary = (req, res, next) => {
  const { error, value } = patientIdParamSchema.validate(req.params, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  req.params = value;
  next();
};

const validateGetPatientChangeAnalysis = (req, res, next) => {
  const { error, value } = patientIdParamSchema.validate(req.params, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  req.params = value;
  next();
};

const validateGetTreatmentEffectiveness = (req, res, next) => {
  const { error, value } = patientIdParamSchema.validate(req.params, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  req.params = value;
  next();
};

const validateGetDecisionSupport = (req, res, next) => {
  const { error, value } = patientIdParamSchema.validate(req.params, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  req.params = value;
  next();
};

const validateGenerateWeeklySummary = (req, res, next) => {
  const { error, value } = patientIdParamSchema.validate(req.params, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  req.params = value;
  next();
};

const validateGenerateMonthlySummary = (req, res, next) => {
  const { error, value } = patientIdParamSchema.validate(req.params, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  req.params = value;
  next();
};

module.exports = {
  validateGetPatientAiProgressNotes,
  validateGeneratePatientClinicalSummary,
  validateGetPatientChangeAnalysis,
  validateGetTreatmentEffectiveness,
  validateGetDecisionSupport,
  validateGenerateWeeklySummary,
  validateGenerateMonthlySummary
};
