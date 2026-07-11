const uploadsService = require("./uploads.service");

const handleUploadError = (res, err) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File is too large. Maximum allowed size is 50 MB.",
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
      message: "No file uploaded"
    });
  }

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: uploadsService.uploadFile(req.file)
  });
};

const handleReportUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded"
    });
  }

  res.status(201).json({
    success: true,
    message: "Report file uploaded successfully",
    data: uploadsService.uploadReportFile(req.file)
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
  uploadMessageAttachment: handleMessageAttachmentUpload,
  uploadResource: handleUpload,
  uploadReport: handleReportUpload,
  handleUploadError,
};