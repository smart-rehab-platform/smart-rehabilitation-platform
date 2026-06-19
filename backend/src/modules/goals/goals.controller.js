const goalsService = require("./goals.service");

const createGoal = async (req, res) => {
  try {
    const goal = await goalsService.createGoal(req.params.planId, req.body);

    return res.status(201).json({
      success: true,
      message: "Goal created successfully",
      data: goal
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPlanGoals = async (req, res) => {
  try {
    const goals = await goalsService.getPlanGoals(req.params.planId);

    return res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getGoalById = async (req, res) => {
  try {
    const goal = await goalsService.getGoalById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: goal
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await goalsService.updateGoal(req.params.id, req.body);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      data: goal
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await goalsService.deleteGoal(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
      data: goal
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const achieveGoal = async (req, res) => {
  try {
    const goal = await goalsService.achieveGoal(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Goal achieved successfully",
      data: goal
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createGoalProgress = async (req, res) => {
  try {
    const progress = await goalsService.createGoalProgress(
      req.params.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Goal progress created successfully",
      data: progress
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getGoalProgress = async (req, res) => {
  try {
    const progress = await goalsService.getGoalProgress(req.params.id);

    return res.status(200).json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createGoal,
  getPlanGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  achieveGoal,
  createGoalProgress,
  getGoalProgress
};