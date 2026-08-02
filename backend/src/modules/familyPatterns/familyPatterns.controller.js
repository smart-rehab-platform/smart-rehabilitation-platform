const familyPatternsService = require("./familyPatterns.service");

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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
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
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getFamilyPatterns,
  getFamilyPatternDetails
};
