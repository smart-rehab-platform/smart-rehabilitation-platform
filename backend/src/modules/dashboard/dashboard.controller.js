const dashboardService = require("./dashboard.service");

// Admin Dashboard
exports.getAdminOverview = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminOverview();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminUsers = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminUsers();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSystemAnalytics = async (req, res, next) => {
  try {
    const data = await dashboardService.getSystemAnalytics();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Specialist Dashboard
exports.getSpecialistOverview = async (req, res, next) => {
  try {
    const data = await dashboardService.getSpecialistOverview(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSpecialistActiveCases = async (req, res, next) => {
  try {
    const data = await dashboardService.getSpecialistActiveCases(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSpecialistUpcomingSessions = async (req, res, next) => {
  try {
    const data = await dashboardService.getSpecialistUpcomingSessions(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSpecialistPendingReviews = async (req, res, next) => {
  try {
    const data = await dashboardService.getSpecialistPendingReviews(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Parent Dashboard
exports.getParentOverview = async (req, res, next) => {
  try {
    const data = await dashboardService.getParentOverview(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getParentChildrenProgress = async (req, res, next) => {
  try {
    const data = await dashboardService.getParentChildrenProgress(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getParentTasks = async (req, res, next) => {
  try {
    const data = await dashboardService.getParentTasks(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getParentReports = async (req, res, next) => {
  try {
    const data = await dashboardService.getParentReports(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};