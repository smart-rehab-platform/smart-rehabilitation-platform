const express = require("express");
const authenticate = require("../../middleware/auth.middleware");
const translationService = require("../../services/translation.service");

const router = express.Router();

const MAX_TEXT_LENGTH = 5000;

router.post("/translations", authenticate, async (req, res) => {
  try {
    const texts = req.body?.texts;
    const targetLanguage = translationService.normalizeTargetLanguage(
      req.body?.targetLanguage ?? req.body?.target_language,
    );

    if (!Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        message: "texts must be an array of strings.",
      });
    }

    if (texts.length === 0) {
      return res.status(200).json({
        success: true,
        data: { texts: [], targetLanguage: targetLanguage || "ar" },
      });
    }

    const normalizedTexts = texts.map((item) => {
      const value = item == null ? "" : String(item);
      return value.length > MAX_TEXT_LENGTH
        ? value.slice(0, MAX_TEXT_LENGTH)
        : value;
    });

    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "targetLanguage is required.",
      });
    }

    const translated = await translationService.translateTexts(
      normalizedTexts,
      targetLanguage,
    );

    return res.status(200).json({
      success: true,
      data: {
        texts: translated,
        targetLanguage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Translation failed.",
    });
  }
});

module.exports = router;
