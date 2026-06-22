const uploadsService = require("./uploads.service");

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

module.exports = {
  uploadProfileImage: handleUpload,
  uploadExerciseMedia: handleUpload,
  uploadMessageAttachment: handleUpload,
  uploadResource: handleUpload,
  uploadReport: handleUpload
};