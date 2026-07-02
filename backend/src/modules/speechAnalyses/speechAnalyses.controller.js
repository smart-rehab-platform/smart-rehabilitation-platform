const speechAnalysesService = require("./speechAnalyses.service");

const analyzeSpeech = async (req, res) => {
  try {
    const analysis = await speechAnalysesService.analyzeSpeech(req.body);

    res.status(201).json({
      success: true,
      message: "Speech analysis completed successfully.",
      data: analysis,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSpeechAnalysisById = async (req, res) => {
  try {
    const analysis = await speechAnalysesService.getSpeechAnalysisById(
      req.params.id
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Speech analysis not found",
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSpeechAnalysesByPatient = async (req, res) => {
  try {
    const analyses =
      await speechAnalysesService.getSpeechAnalysesByPatient(req.params.id);

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSpeechAnalysisBySubmission = async (req, res) => {
  try {
    const analysis =
      await speechAnalysesService.getSpeechAnalysisBySubmission(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Speech analysis not found for this submission",
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSpeechProgressByPatient = async (req, res) => {
  try {
    const progress =
      await speechAnalysesService.getSpeechProgressByPatient(req.params.id);

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
    analyzeSpeech,
  getSpeechAnalysisById,
  getSpeechAnalysesByPatient,
  getSpeechAnalysisBySubmission,
  getSpeechProgressByPatient,
};