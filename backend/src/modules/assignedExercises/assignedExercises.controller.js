const assignedExercisesService = require("./assignedExercises.service");

const createAssignedExercise = async (req, res) => {
  try {
    const assignedExercise =
      await assignedExercisesService.createAssignedExercise(req.body, req.user.id);

    return res.status(201).json({
      success: true,
      message: "Exercise assigned successfully",
      data: assignedExercise
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllAssignedExercises = async (req, res) => {
  try {
    const assignedExercises =
      await assignedExercisesService.getAllAssignedExercises();

    return res.status(200).json({
      success: true,
      count: assignedExercises.length,
      data: assignedExercises
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAssignedExerciseById = async (req, res) => {
  try {
    const assignedExercise =
      await assignedExercisesService.getAssignedExerciseById(req.params.id);

    if (!assignedExercise) {
      return res.status(404).json({
        success: false,
        message: "Assigned exercise not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: assignedExercise
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateAssignedExercise = async (req, res) => {
  try {
    const assignedExercise =
      await assignedExercisesService.updateAssignedExercise(req.params.id, req.body);

    if (!assignedExercise) {
      return res.status(404).json({
        success: false,
        message: "Assigned exercise not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assigned exercise updated successfully",
      data: assignedExercise
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAssignedExercise = async (req, res) => {
  try {
    const assignedExercise =
      await assignedExercisesService.deleteAssignedExercise(req.params.id);

    if (!assignedExercise) {
      return res.status(404).json({
        success: false,
        message: "Assigned exercise not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assigned exercise deleted successfully",
      data: assignedExercise
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deactivateAssignedExercise = async (req, res) => {
  try {
    const assignedExercise =
      await assignedExercisesService.deactivateAssignedExercise(req.params.id);

    if (!assignedExercise) {
      return res.status(404).json({
        success: false,
        message: "Assigned exercise not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assigned exercise deactivated successfully",
      data: assignedExercise
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPatientAssignedExercises = async (req, res) => {
  try {
    const assignedExercises =
      await assignedExercisesService.getPatientAssignedExercises(req.params.id);

    return res.status(200).json({
      success: true,
      count: assignedExercises.length,
      data: assignedExercises
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getDailyTasks = async (req, res) => {
  try {
    const tasks = await assignedExercisesService.getDailyTasks(req.params.id);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getWeeklyTasks = async (req, res) => {
  try {
    const tasks = await assignedExercisesService.getWeeklyTasks(req.params.id);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createAssignedExercise,
  getAllAssignedExercises,
  getAssignedExerciseById,
  updateAssignedExercise,
  deleteAssignedExercise,
  deactivateAssignedExercise,
  getPatientAssignedExercises,
  getDailyTasks,
  getWeeklyTasks
};