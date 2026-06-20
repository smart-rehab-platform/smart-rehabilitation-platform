const Joi = require("joi");

const createReviewSchema = Joi.object({
  specialist_id: Joi.string().uuid().required(),
  performance_rating: Joi.number().min(0).max(10).required(),
  feedback: Joi.string().allow("", null),
  requires_retry: Joi.boolean().default(false),
});

const updateReviewSchema = Joi.object({
  performance_rating: Joi.number().min(0).max(10),
  feedback: Joi.string().allow("", null),
  requires_retry: Joi.boolean(),
}).min(1);

module.exports = {
  createReviewSchema,
  updateReviewSchema,
};