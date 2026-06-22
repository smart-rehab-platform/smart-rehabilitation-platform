const uploadFile = (file) => {
  return {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`
  };
};

module.exports = {
  uploadFile
};