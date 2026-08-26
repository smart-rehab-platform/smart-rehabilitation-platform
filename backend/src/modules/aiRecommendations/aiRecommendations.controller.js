const aiRecommendationsService = require("./aiRecommendations.service");

const generateRecommendation = async (req, res) => {
  try {
    const recommendation =
      await aiRecommendationsService.generateRecommendation(req.body);

    res.status(201).json({
      success: true,
      message: "AI recommendation generated successfully",
      data: recommendation,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllRecommendations = async (req, res) => {
  try {
    const recommendations =
      await aiRecommendationsService.getAllRecommendations();

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRecommendationById = async (req, res) => {
  try {
    const recommendation =
      await aiRecommendationsService.getRecommendationById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRecommendationsByPatient = async (req, res) => {
  try {
    const recommendations =
      await aiRecommendationsService.getRecommendationsByPatient(
        req.params.id
      );

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const acceptRecommendation = async (req, res) => {
  try {
    const recommendation =
      await aiRecommendationsService.updateRecommendationStatus(
        req.params.id,
        "accepted",
        req.user?.id
      );

    res.status(200).json({
      success: true,
      message: "Recommendation accepted",
      data: recommendation,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectRecommendation = async (req, res) => {
  try {
    const recommendation =
      await aiRecommendationsService.updateRecommendationStatus(
        req.params.id,
        "rejected",
        req.user?.id
      );

    res.status(200).json({
      success: true,
      message: "Recommendation rejected",
      data: recommendation,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateRecommendationDraft = async (req, res) => {
  try {
    const recommendation =
      await aiRecommendationsService.updateAiRecommendationDraft(
        req.params.id,
        req.user,
        req.body
      );

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "AI recommendation draft updated successfully",
      data: recommendation,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateRecommendation,
  getAllRecommendations,
  getRecommendationById,
  getRecommendationsByPatient,
  acceptRecommendation,
  rejectRecommendation,
  updateRecommendationDraft,
};