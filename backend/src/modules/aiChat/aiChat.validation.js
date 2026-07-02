const validateCreateConversation = (req, res, next) => {
  if (
    req.body &&
    req.body.patient_id !== undefined &&
    (typeof req.body.patient_id !== "string" || !req.body.patient_id.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "patient_id must be a non-empty string when provided"
    });
  }

  next();
};

const validateSendMessage = (req, res, next) => {
  const { content, patient_id } = req.body || {};

  if (typeof content !== "string" || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: "content is required"
    });
  }

  if (
    patient_id !== undefined &&
    (typeof patient_id !== "string" || !patient_id.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "patient_id must be a non-empty string when provided"
    });
  }

  next();
};

const validateAsk = (req, res, next) => {
  const { content, conversation_id, patient_id } = req.body || {};

  if (typeof content !== "string" || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: "content is required"
    });
  }

  if (
    conversation_id !== undefined &&
    (typeof conversation_id !== "string" || !conversation_id.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "conversation_id must be a non-empty string when provided"
    });
  }

  if (
    patient_id !== undefined &&
    (typeof patient_id !== "string" || !patient_id.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "patient_id must be a non-empty string when provided"
    });
  }

  next();
};

module.exports = {
  validateCreateConversation,
  validateSendMessage,
  validateAsk
};
