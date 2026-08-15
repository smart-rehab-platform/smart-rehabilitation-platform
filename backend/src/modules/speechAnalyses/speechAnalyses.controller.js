const speechAnalysesService = require("./speechAnalyses.service");

const analyzeSpeech = async (req, res) => {
  try {
    const result = await speechAnalysesService.analyzeSpeech(req.body, {
      actor: req.user,
    });

    const created = result?.created !== false;
    const analysis = result?.analysis ?? result;

    res.status(created ? 201 : 200).json({
      success: true,
      message: created
        ? "Speech analysis completed successfully."
        : "Existing speech analysis returned for this submission.",
      data: analysis,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
      console.error("[speech-analyses] analyze failed:", {
        statusCode,
        message: error.message,
        code: error.code,
        downstreamStatus: error.downstreamStatus,
      });
    }

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getSpeechAnalysisById = async (req, res) => {
  try {
    const analysis = await speechAnalysesService.getSpeechAnalysisById(
      req.params.id,
      { actor: req.user }
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
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getSpeechAnalysesByPatient = async (req, res) => {
  try {
    const analyses =
      await speechAnalysesService.getSpeechAnalysesByPatient(req.params.id, {
        actor: req.user,
      });

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getSpeechAnalysisBySubmission = async (req, res) => {
  try {
    const analysis =
      await speechAnalysesService.getSpeechAnalysisBySubmission(req.params.id, {
        actor: req.user,
      });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No speech analysis is available for this submission yet.",
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

const getSpeechProgressByPatient = async (req, res) => {
  try {
    const includeInsights =
      String(req.query.include_insights || "").toLowerCase() === "true";
    const progress = await speechAnalysesService.getSpeechProgressByPatient(
      req.params.id,
      {
        actor: req.user,
        includeInsights,
        exerciseId: req.query.exercise_id || null,
        expectedText: req.query.expected_text || null,
        targetPhoneme: req.query.target_phoneme || null,
      }
    );

    const response = {
      success: true,
      count: progress.progressPoints.length,
      data: progress.progressPoints,
    };

    if (includeInsights) {
      response.insights = progress.insights;
      response.acoustic_progress = progress.acousticProgress;
    }

    res.status(200).json(response);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
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