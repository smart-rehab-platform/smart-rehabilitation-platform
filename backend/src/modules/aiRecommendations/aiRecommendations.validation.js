const {
  ALLOWED_UPDATE_KEYS,
  extractEditableUpdates,
} = require("./aiRecommendationDraft.edit");

const validateUpdateAiRecommendationDraft = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be an object with editable recommendation fields.",
    });
  }

  const unknownKeys = Object.keys(body).filter(
    (key) => !ALLOWED_UPDATE_KEYS.has(key)
  );

  if (unknownKeys.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unsupported fields: ${unknownKeys.join(", ")}`,
    });
  }

  const updates = extractEditableUpdates(body);
  if (!updates) {
    return res.status(400).json({
      success: false,
      message: "At least one editable recommendation field is required.",
    });
  }

  req.body = updates;
  next();
};

module.exports = {
  validateUpdateAiRecommendationDraft,
};
