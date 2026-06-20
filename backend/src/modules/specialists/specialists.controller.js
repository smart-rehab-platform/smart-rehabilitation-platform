const specialistsService = require("./specialists.service");

const createSpecialistProfile = async (req, res, next) => {
  try {
    const profile = await specialistsService.createSpecialistProfile(
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Specialist profile created successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const getAllSpecialists = async (req, res, next) => {
  try {
    const specialists = await specialistsService.getAllSpecialists();

    res.status(200).json({
      success: true,
      count: specialists.length,
      data: specialists,
    });
  } catch (error) {
    next(error);
  }
};

const getSpecialistById = async (req, res, next) => {
  try {
    const specialist = await specialistsService.getSpecialistById(req.params.id);

    if (!specialist) {
      return res.status(404).json({
        success: false,
        message: "Specialist not found",
      });
    }

    res.status(200).json({
      success: true,
      data: specialist,
    });
  } catch (error) {
    next(error);
  }
};

const updateSpecialistProfile = async (req, res, next) => {
  try {
    const profile = await specialistsService.updateSpecialistProfile(
      req.params.id,
      req.body
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Specialist profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Specialist profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const getSpecialistPatients = async (req, res, next) => {
  try {
    const patients = await specialistsService.getSpecialistPatients(req.params.id);

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
  createSpecialistProfile,
  getAllSpecialists,
  getSpecialistById,
  updateSpecialistProfile,
  getSpecialistPatients,
};