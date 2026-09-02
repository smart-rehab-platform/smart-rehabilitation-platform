const pool = require("../../database/db");
const familyPatternsService = require("./familyPatterns.service");

const respondWithServiceError = (res, error, fallbackMessage) => {
  if (pool.isConnectionExhaustedError?.(error)) {
    pool.logDatabaseError?.("familyPatterns.controller", error);
    return res.status(503).json({
      success: false,
      message: "The service is temporarily busy. Please try again in a moment.",
    });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallbackMessage,
  });
};

const getFamilyPatterns = async (req, res) => {
  try {
    const result = await familyPatternsService.getFamilyPatterns(
      req.params.id,
      req.user
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return respondWithServiceError(res, error, "Failed to load family patterns");
  }
};

const getFamilyPatternDetails = async (req, res) => {
  try {
    const result = await familyPatternsService.getFamilyPatternDetails(
      req.params.id,
      req.user
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return respondWithServiceError(res, error, "Failed to load family pattern details");
  }
};

module.exports = {
  getFamilyPatterns,
  getFamilyPatternDetails
};
