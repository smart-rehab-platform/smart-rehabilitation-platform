const aiClinicalProgressService = require("./aiClinicalProgress.service");

const getPatientAiProgressNotes = async (req, res, next) => {
  try {
    const notes = await aiClinicalProgressService.getPatientAiProgressNotes(
      req.params.id
    );

    if (!notes) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const generatePatientClinicalSummary = async (req, res, next) => {
  try {
    const aiProgressNote =
      await aiClinicalProgressService.generatePatientClinicalSummary(
        req.params.id
      );

    if (!aiProgressNote) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    return res.status(201).json({
      success: true,
      message: "AI clinical summary generated successfully",
      data: {
        ai_progress_note: aiProgressNote
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPatientChangeAnalysis = async (req, res, next) => {
  try {
    const analysis = await aiClinicalProgressService.getPatientChangeAnalysis(
      req.params.id
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getTreatmentEffectiveness = async (req, res, next) => {
  try {
    const effectiveness =
      await aiClinicalProgressService.getTreatmentEffectiveness(req.params.id);

    if (!effectiveness) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: effectiveness
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getDecisionSupport = async (req, res, next) => {
  try {
    const decisionSupport =
      await aiClinicalProgressService.getDecisionSupport(req.params.id);

    if (!decisionSupport) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: decisionSupport
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const generateWeeklySummary = async (req, res, next) => {
  try {
    const aiProgressNote = await aiClinicalProgressService.generateWeeklySummary(
      req.params.id
    );

    if (!aiProgressNote) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    return res.status(201).json({
      success: true,
      message: "AI weekly summary generated successfully",
      data: {
        ai_progress_note: aiProgressNote
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const generateMonthlySummary = async (req, res, next) => {
  try {
    const aiProgressNote =
      await aiClinicalProgressService.generateMonthlySummary(req.params.id);

    if (!aiProgressNote) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    return res.status(201).json({
      success: true,
      message: "AI monthly summary generated successfully",
      data: {
        ai_progress_note: aiProgressNote
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getPatientAiProgressNotes,
  generatePatientClinicalSummary,
  getPatientChangeAnalysis,
  getTreatmentEffectiveness,
  getDecisionSupport,
  generateWeeklySummary,
  generateMonthlySummary
};
