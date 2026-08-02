const validateCreateProgressSnapshot = (req, res, next) => {
  const {
    patient_id,
    period,
    period_start,
    period_end,
    exercises_completed,
    average_performance,
    improvement_percentage
  } = req.body;

  if (!patient_id || !period || !period_start || !period_end) {
    return res.status(400).json({
      success: false,
      message: 'patient_id, period, period_start, and period_end are required'
    });
  }

  if (!['daily', 'weekly', 'monthly'].includes(period)) {
    return res.status(400).json({
      success: false,
      message: 'period must be daily, weekly, or monthly'
    });
  }

  if (exercises_completed !== undefined && exercises_completed < 0) {
    return res.status(400).json({
      success: false,
      message: 'exercises_completed cannot be negative'
    });
  }

  if (average_performance !== undefined && (average_performance < 0 || average_performance > 100)) {
    return res.status(400).json({
      success: false,
      message: 'average_performance must be between 0 and 100'
    });
  }

  if (improvement_percentage !== undefined && (improvement_percentage < 0 || improvement_percentage > 100)) {
    return res.status(400).json({
      success: false,
      message: 'improvement_percentage must be between 0 and 100'
    });
  }

  next();
};

const Joi = require('joi');

const patientIdParamSchema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required().messages({
    'any.required': 'Patient id is required',
    'string.empty': 'Patient id is required',
    'string.guid': 'Patient id must be a valid UUID'
  })
});

const treatmentJourneyQuerySchema = Joi.object({
  period: Joi.string()
    .valid('weekly', 'monthly', 'full')
    .default('weekly')
    .messages({
      'any.only': 'period must be weekly, monthly, or full'
    })
});

const validateGetTreatmentJourney = (req, res, next) => {
  const paramsResult = patientIdParamSchema.validate(req.params, {
    abortEarly: true,
    stripUnknown: true
  });

  if (paramsResult.error) {
    return res.status(400).json({
      success: false,
      message: paramsResult.error.details[0].message
    });
  }

  const queryResult = treatmentJourneyQuerySchema.validate(req.query, {
    abortEarly: true,
    stripUnknown: true
  });

  if (queryResult.error) {
    return res.status(400).json({
      success: false,
      message: queryResult.error.details[0].message
    });
  }

  req.params = paramsResult.value;
  req.query = queryResult.value;
  next();
};

module.exports = {
  validateCreateProgressSnapshot,
  validateGetTreatmentJourney
};