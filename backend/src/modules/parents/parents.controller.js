const parentsService = require("./parents.service");

const createParentProfile = async (req, res, next) => {
  try {
    const profile = await parentsService.createParentProfile(
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Parent profile created successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const getAllParents = async (req, res, next) => {
  try {
    const parents = await parentsService.getAllParents();

    res.status(200).json({
      success: true,
      count: parents.length,
      data: parents,
    });
  } catch (error) {
    next(error);
  }
};

const getParentById = async (req, res, next) => {
  try {
    const parent = await parentsService.getParentById(req.params.id);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    res.status(200).json({
      success: true,
      data: parent,
    });
  } catch (error) {
    next(error);
  }
};

const updateParentProfile = async (req, res, next) => {
  try {
    const profile = await parentsService.updateParentProfile(
      req.params.id,
      req.body
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Parent profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const getParentPatients = async (req, res, next) => {
  try {
    const patients = await parentsService.getParentPatients(req.params.id);

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createParentProfile,
  getAllParents,
  getParentById,
  updateParentProfile,
  getParentPatients,
};