const exercisesService = require("./exercises.service");

const respondError = (res, err) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Something went wrong while processing the exercise request."
        : err.message,
  });
};

const createExerciseCategory = async (req, res) => {
  try {
    const category = await exercisesService.createExerciseCategory(req.body);

    return res.status(201).json({
      success: true,
      message: "Exercise category created successfully",
      data: category
    });
  } catch (err) {
    return respondError(res, err);
  }
};

const getExerciseCategories = async (req, res) => {
  try {
    const categories = await exercisesService.getExerciseCategories();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    return respondError(res, err);
  }
};

const updateExerciseCategory = async (req, res) => {
  try {
    const category = await exercisesService.updateExerciseCategory(
      req.params.id,
      req.body
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Exercise category not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exercise category updated successfully",
      data: category
    });
  } catch (err) {
    return respondError(res, err);
  }
};

const deleteExerciseCategory = async (req, res) => {
  try {
    const category = await exercisesService.deleteExerciseCategory(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Exercise category not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exercise category deleted successfully",
      data: category
    });
  } catch (err) {
    return respondError(res, err);
  }
};

const createExercise = async (req, res) => {
  try {
    const exercise = await exercisesService.createExercise(
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Exercise created successfully",
      data: exercise
    });
  } catch (err) {
    return respondError(res, err);
  }
};

const getAllExercises = async (req, res) => {
  try {
    const exercises = await exercisesService.getAllExercises();

    return res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (err) {
    return respondError(res, err);
  }
};

const getExerciseById = async (req, res) => {
  try {
    const exercise = await exercisesService.getExerciseById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (err) {
    return respondError(res, err);
  }
};

const getExercisesByCategory = async (req, res) => {
  try {
    const exercises = await exercisesService.getExercisesByCategory(
      req.params.categoryId
    );

    return res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (err) {
    return respondError(res, err);
  }
};

const updateExercise = async (req, res) => {
  try {
    const exercise = await exercisesService.updateExercise(
      req.params.id,
      req.body,
      { id: req.user.id, role: req.user.role }
    );

    return res.status(200).json({
      success: true,
      message: "Exercise updated successfully",
      data: exercise
    });
  } catch (err) {
    return respondError(res, err);
  }
};

const deleteExercise = async (req, res) => {
  try {
    const exercise = await exercisesService.deleteExercise(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Exercise deleted successfully",
      data: exercise
    });
  } catch (err) {
    return respondError(res, err);
  }
};

module.exports = {
  createExerciseCategory,
  getExerciseCategories,
  updateExerciseCategory,
  deleteExerciseCategory,
  createExercise,
  getAllExercises,
  getExerciseById,
  getExercisesByCategory,
  updateExercise,
  deleteExercise
};
