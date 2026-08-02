const fs = require("fs");

const uploadsService = require("./uploads.service");

const cleanupUploadedFile = (file) => {
  if (!file?.path) {
    return;
  }

  fs.unlink(file.path, () => {});
};

const handleUploadError = (res, err, { maxSizeMessage = null } = {}) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message:
        maxSizeMessage || "File is too large. Maximum allowed size is 50 MB.",
    });
  }

  const statusCode = err?.statusCode || 400;
  return res.status(statusCode).json({
    success: false,
    message: err?.message || "File upload failed.",
  });
};

const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: uploadsService.uploadFile(req.file),
  });
};

const handleChildImageUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image uploaded",
    });
  }

  try {
    return res.status(201).json({
      success: true,
      message: "Child image uploaded successfully",
      data: uploadsService.uploadFile(req.file),
    });
  } catch (error) {
    cleanupUploadedFile(req.file);
    return res.status(500).json({
      success: false,
      message: error?.message || "Child image upload failed.",
    });
  }
};

const handleReportUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  res.status(201).json({
    success: true,
    message: "Report file uploaded successfully",
    data: uploadsService.uploadReportFile(req.file),
  });
};

const handleMessageAttachmentUpload = (req, res) => {
  if (req.fileValidationError) {
    return handleUploadError(res, req.fileValidationError);
  }

  return handleUpload(req, res);
};

module.exports = {
  uploadProfileImage: handleUpload,
  uploadExerciseMedia: handleUpload,
  uploadExerciseSubmissionMedia: handleUpload,
  uploadCaseRequestChildImage: handleUpload,
  uploadMessageAttachment: handleMessageAttachmentUpload,
  uploadChildImage: handleChildImageUpload,
  uploadResource: handleUpload,
  uploadReport: handleReportUpload,
  handleUploadError,
};
