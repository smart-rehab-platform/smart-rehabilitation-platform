const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TITLE_MAX = 200;
const TEXT_MAX = 10000;
const MEDIA_URL_MAX = 1000;
const ALLOWED_EXERCISE_LANGUAGES = new Set(["en", "ar"]);
const DEFAULT_EXERCISE_LANGUAGE = "en";

const parseExerciseLanguage = (value) => {
  if (value === undefined) {
    return DEFAULT_EXERCISE_LANGUAGE;
  }

  if (value === null) {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return ALLOWED_EXERCISE_LANGUAGES.has(normalized) ? normalized : null;
};

const isValidUuid = (value) => UUID_RE.test(String(value || "").trim());

const trimOrNull = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const text = String(value).trim();
  return text.length === 0 ? null : text;
};

const validateCreateExercise = (req, res, next) => {
  const body = req.body || {};

  if (Object.prototype.hasOwnProperty.call(body, "created_by")) {
    delete body.created_by;
  }

  const categoryId = String(body.category_id || "").trim();
  const title = String(body.title || "").trim();
  const description = trimOrNull(body.description);
  const instructions = trimOrNull(body.instructions);
  const mediaUrl = trimOrNull(body.instruction_media_url);

  if (!categoryId) {
    return res.status(400).json({
      success: false,
      message: "category_id is required.",
    });
  }

  if (!isValidUuid(categoryId)) {
    return res.status(400).json({
      success: false,
      message: "category_id must be a valid UUID.",
    });
  }

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "title is required.",
    });
  }

  if (title.length > TITLE_MAX) {
    return res.status(400).json({
      success: false,
      message: `title must be at most ${TITLE_MAX} characters.`,
    });
  }

  if (description && description.length > TEXT_MAX) {
    return res.status(400).json({
      success: false,
      message: `description must be at most ${TEXT_MAX} characters.`,
    });
  }

  if (instructions && instructions.length > TEXT_MAX) {
    return res.status(400).json({
      success: false,
      message: `instructions must be at most ${TEXT_MAX} characters.`,
    });
  }

  if (mediaUrl && mediaUrl.length > MEDIA_URL_MAX) {
    return res.status(400).json({
      success: false,
      message: "instruction_media_url is too long.",
    });
  }

  const language = Object.prototype.hasOwnProperty.call(body, "language")
    ? parseExerciseLanguage(body.language)
    : DEFAULT_EXERCISE_LANGUAGE;

  if (language === null) {
    return res.status(400).json({
      success: false,
      message: "language must be 'en' or 'ar'.",
    });
  }

  req.body = {
    category_id: categoryId,
    title,
    description,
    instructions,
    instruction_media_url: mediaUrl,
    language,
  };

  next();
};

const validateUpdateExercise = (req, res, next) => {
  if (!isValidUuid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Exercise id must be a valid UUID.",
    });
  }

  const body = req.body || {};
  if (Object.prototype.hasOwnProperty.call(body, "created_by")) {
    delete body.created_by;
  }

  const allowedFields = [
    "category_id",
    "title",
    "description",
    "instructions",
    "instruction_media_url",
    "language",
  ];
  const provided = Object.keys(body).filter((key) =>
    allowedFields.includes(key)
  );

  if (provided.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one field to update.",
    });
  }

  const nextBody = {};

  if (Object.prototype.hasOwnProperty.call(body, "category_id")) {
    const categoryId = String(body.category_id || "").trim();
    if (!categoryId || !isValidUuid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "category_id must be a valid UUID.",
      });
    }
    nextBody.category_id = categoryId;
  }

  if (Object.prototype.hasOwnProperty.call(body, "title")) {
    const title = String(body.title || "").trim();
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title cannot be empty.",
      });
    }
    if (title.length > TITLE_MAX) {
      return res.status(400).json({
        success: false,
        message: `title must be at most ${TITLE_MAX} characters.`,
      });
    }
    nextBody.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(body, "description")) {
    const description = trimOrNull(body.description);
    if (description && description.length > TEXT_MAX) {
      return res.status(400).json({
        success: false,
        message: `description must be at most ${TEXT_MAX} characters.`,
      });
    }
    // Allow explicit empty string to clear description.
    nextBody.description =
      body.description === null || body.description === undefined
        ? undefined
        : description ?? "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "instructions")) {
    const instructions = trimOrNull(body.instructions);
    if (instructions && instructions.length > TEXT_MAX) {
      return res.status(400).json({
        success: false,
        message: `instructions must be at most ${TEXT_MAX} characters.`,
      });
    }
    nextBody.instructions =
      body.instructions === null || body.instructions === undefined
        ? undefined
        : instructions ?? "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "instruction_media_url")) {
    const mediaUrl = trimOrNull(body.instruction_media_url);
    if (mediaUrl && mediaUrl.length > MEDIA_URL_MAX) {
      return res.status(400).json({
        success: false,
        message: "instruction_media_url is too long.",
      });
    }
    // Empty string clears media (COALESCE would keep old value for null).
    nextBody.instruction_media_url =
      body.instruction_media_url === null ||
      body.instruction_media_url === undefined
        ? undefined
        : mediaUrl ?? "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "language")) {
    const language = parseExerciseLanguage(body.language);
    if (language === null) {
      return res.status(400).json({
        success: false,
        message: "language must be 'en' or 'ar'.",
      });
    }
    nextBody.language = language;
  }

  // Drop undefined keys so service can detect which fields were provided.
  Object.keys(nextBody).forEach((key) => {
    if (nextBody[key] === undefined) {
      delete nextBody[key];
    }
  });

  if (Object.keys(nextBody).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one field to update.",
    });
  }

  req.body = nextBody;
  next();
};

module.exports = {
  validateCreateExercise,
  validateUpdateExercise,
  ALLOWED_EXERCISE_LANGUAGES,
  DEFAULT_EXERCISE_LANGUAGE,
  parseExerciseLanguage,
};
