const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TITLE_MAX = 200;
const TEXT_MAX = 10000;
const MEDIA_URL_MAX = 1000;
const TARGET_WORD_MAX = 100;
const TARGET_PHONEME_MAX = 20;
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

  const expectedText = trimOrNull(body.expected_text);
  const targetWord = trimOrNull(body.target_word);
  const targetPhoneme = trimOrNull(body.target_phoneme);

  if (expectedText && expectedText.length > TEXT_MAX) {
    return res.status(400).json({
      success: false,
      message: `expected_text must be at most ${TEXT_MAX} characters.`,
    });
  }

  if (targetWord && targetWord.length > TARGET_WORD_MAX) {
    return res.status(400).json({
      success: false,
      message: `target_word must be at most ${TARGET_WORD_MAX} characters.`,
    });
  }

  if (targetPhoneme && targetPhoneme.length > TARGET_PHONEME_MAX) {
    return res.status(400).json({
      success: false,
      message: `target_phoneme must be at most ${TARGET_PHONEME_MAX} characters.`,
    });
  }

  req.body = {
    category_id: categoryId,
    title,
    description,
    instructions,
    instruction_media_url: mediaUrl,
    language,
    expected_text: expectedText,
    target_word: targetWord,
    target_phoneme: targetPhoneme,
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
    "expected_text",
    "target_word",
    "target_phoneme",
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

  if (Object.prototype.hasOwnProperty.call(body, "expected_text")) {
    const expectedText = trimOrNull(body.expected_text);
    if (expectedText && expectedText.length > TEXT_MAX) {
      return res.status(400).json({
        success: false,
        message: `expected_text must be at most ${TEXT_MAX} characters.`,
      });
    }
    nextBody.expected_text =
      body.expected_text === null || body.expected_text === undefined
        ? undefined
        : expectedText ?? "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "target_word")) {
    const targetWord = trimOrNull(body.target_word);
    if (targetWord && targetWord.length > TARGET_WORD_MAX) {
      return res.status(400).json({
        success: false,
        message: `target_word must be at most ${TARGET_WORD_MAX} characters.`,
      });
    }
    nextBody.target_word =
      body.target_word === null || body.target_word === undefined
        ? undefined
        : targetWord ?? "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "target_phoneme")) {
    const targetPhoneme = trimOrNull(body.target_phoneme);
    if (targetPhoneme && targetPhoneme.length > TARGET_PHONEME_MAX) {
      return res.status(400).json({
        success: false,
        message: `target_phoneme must be at most ${TARGET_PHONEME_MAX} characters.`,
      });
    }
    nextBody.target_phoneme =
      body.target_phoneme === null || body.target_phoneme === undefined
        ? undefined
        : targetPhoneme ?? "";
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
