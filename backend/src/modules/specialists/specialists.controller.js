const specialistsService = require("./specialists.service");
const {
  updateSpecialistVerificationSchema,
  specialistUserIdParamSchema,
} = require("./specialists.validation");

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

const updateSpecialistVerification = async (req, res) => {
  try {
    const { error: paramsError, value: params } =
      specialistUserIdParamSchema.validate(
        { userId: req.params.userId },
        { abortEarly: false }
      );

    if (paramsError) {
      return res.status(400).json({
        success: false,
        message: paramsError.details[0]?.message || "Invalid specialist user id.",
      });
    }

    const { error: bodyError, value: body } =
      updateSpecialistVerificationSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

    if (bodyError) {
      return res.status(400).json({
        success: false,
        message: bodyError.details[0]?.message || "Invalid verification status.",
      });
    }

    const profile = await specialistsService.updateSpecialistVerificationByUserId(
      params.userId,
      body.status
    );

    return res.status(200).json({
      success: true,
      message:
        body.status === "approved"
          ? "Specialist account approved successfully."
          : "Specialist account rejected successfully.",
      data: {
        user_id: profile.user_id,
        verification_status: profile.verification_status,
        specialization: profile.specialization,
        license_number: profile.license_number,
        full_name: profile.full_name,
        email: profile.email,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update specialist verification.",
    });
  }
};

module.exports = {
  createSpecialistProfile,
  getAllSpecialists,
  getSpecialistById,
  updateSpecialistProfile,
  getSpecialistPatients,
  updateSpecialistVerification,
};
