const patientsService = require("./patients.service");
const { createAuditLog } = require("../auditLogs/auditLogs.helper");

const createPatient = async (req, res) => {
  try {
    const patient = await patientsService.createPatient(req.body, req.user.id);

    createAuditLog({
      userId: req.user.id,
      action: "patient_create",
      entityName: "patient",
      entityId: patient.id,
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: patient
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await patientsService.getAllPatients();

    return res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patient = await patientsService.getPatientById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const patient = await patientsService.updatePatient(
      req.params.id,
      req.body,
      req.user.id
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    createAuditLog({
      userId: req.user.id,
      action: "patient_update",
      entityName: "patient",
      entityId: patient.id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: patient
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    const patient = await patientsService.deletePatient(
      req.params.id,
      req.user.id
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    createAuditLog({
      userId: req.user.id,
      action: "patient_delete",
      entityName: "patient",
      entityId: patient.id,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
      data: patient
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createMedicalInfo = async (req, res) => {
  try {
    const medicalInfo = await patientsService.createMedicalInfo(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Medical information added successfully",
      data: medicalInfo
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMedicalInfo = async (req, res) => {
  try {
    const medicalInfo = await patientsService.getMedicalInfo(req.params.id);

    if (!medicalInfo) {
      return res.status(404).json({
        success: false,
        message: "Medical information not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: medicalInfo
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateMedicalInfo = async (req, res) => {
  try {
    const medicalInfo = await patientsService.updateMedicalInfo(
      req.params.id,
      req.body,
      req.user.id
    );

    if (!medicalInfo) {
      return res.status(404).json({
        success: false,
        message: "Medical information not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medical information updated successfully",
      data: medicalInfo
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createDiagnosis = async (req, res) => {
  try {
    const diagnosis = await patientsService.createDiagnosis(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Diagnosis added successfully",
      data: diagnosis
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getDiagnoses = async (req, res) => {
  try {
    const diagnoses = await patientsService.getDiagnoses(req.params.id);

    return res.status(200).json({
      success: true,
      count: diagnoses.length,
      data: diagnoses
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createNote = async (req, res) => {
  try {
    const note = await patientsService.createNote(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: note
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await patientsService.getNotes(req.params.id);

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPatientHistory = async (req, res) => {
  try {
    const history = await patientsService.getPatientHistory(req.params.id);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const addGuardian = async (req, res) => {
  try {
    const guardian = await patientsService.addGuardian(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Guardian linked successfully",
      data: guardian
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getGuardians = async (req, res) => {
  try {
    const guardians = await patientsService.getGuardians(req.params.id);

    return res.status(200).json({
      success: true,
      count: guardians.length,
      data: guardians
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const removeGuardian = async (req, res) => {
  try {
    const guardian = await patientsService.removeGuardian(
      req.params.id,
      req.params.guardianId,
      req.user.id
    );

    if (!guardian) {
      return res.status(404).json({
        success: false,
        message: "Guardian link not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Guardian unlinked successfully",
      data: guardian
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const addSpecialist = async (req, res) => {
  try {
    const specialist = await patientsService.addSpecialist(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Specialist linked successfully",
      data: specialist
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getSpecialists = async (req, res) => {
  try {
    const specialists = await patientsService.getSpecialists(req.params.id);

    return res.status(200).json({
      success: true,
      count: specialists.length,
      data: specialists
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const removeSpecialist = async (req, res) => {
  try {
    const specialist = await patientsService.removeSpecialist(
      req.params.id,
      req.params.specialistId,
      req.user.id
    );

    if (!specialist) {
      return res.status(404).json({
        success: false,
        message: "Specialist link not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Specialist unlinked successfully",
      data: specialist
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  createMedicalInfo,
  getMedicalInfo,
  updateMedicalInfo,
  createDiagnosis,
  getDiagnoses,
  createNote,
  getNotes,
  getPatientHistory,
  addGuardian,
  getGuardians,
  removeGuardian,
  addSpecialist,
  getSpecialists,
  removeSpecialist
};