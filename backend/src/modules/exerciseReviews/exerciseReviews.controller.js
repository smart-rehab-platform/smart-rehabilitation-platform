const service = require("./exerciseReviews.service");
const {
  createReviewSchema,
  updateReviewSchema,
} = require("./exerciseReviews.validation");

const createReview = async (req, res, next) => {
  try {
    const { error, value } = createReviewSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const review = await service.createReview(req.params.id, value);

    res.status(201).json({
      success: true,
      message: "Exercise review created successfully",
      data: review,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "This submission already has a review",
      });
    }
    next(err);
  }
};

const getReviewBySubmissionId = async (req, res, next) => {
  try {
    const review = await service.getReviewBySubmissionId(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { error, value } = updateReviewSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });

    const review = await service.updateReview(req.params.id, value);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      message: "Exercise review updated successfully",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

const getPendingReviewsBySpecialist = async (req, res, next) => {
  try {
    const data = await service.getPendingReviewsBySpecialist(req.params.id);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

const getReviewsByPatient = async (req, res, next) => {
  try {
    const data = await service.getReviewsByPatient(req.params.id);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getReviewBySubmissionId,
  updateReview,
  getPendingReviewsBySpecialist,
  getReviewsByPatient,
};