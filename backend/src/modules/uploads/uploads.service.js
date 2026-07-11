const {
  resolveMimeType,
} = require("../../config/messageAttachments");

const uploadFile = (file) => {
  return {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: resolveMimeType(file.mimetype, file.originalname) || file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`,
  };
};

const uploadReportFile = (file) => {
  return {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `/uploads/reports/${file.filename}`,
  };
};

module.exports = {
  uploadFile,
  uploadReportFile,
};
