/**
 * Google Cloud Translation helper with in-memory cache.
 * Uses Translation API v2 (API key) — no client package required.
 *
 * Env: GOOGLE_TRANSLATE_API_KEY
 */

const TRANSLATE_ENDPOINT =
  "https://translation.googleapis.com/language/translate/v2";

const cache = new Map();

const normalizeTargetLanguage = (value) => {
  const primary = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .split("-")[0];
  return primary || "";
};

const buildCacheKey = (text, targetLanguage) =>
  `${targetLanguage}::${text}`;

const getApiKey = () =>
  String(process.env.GOOGLE_TRANSLATE_API_KEY || "").trim();

const isConfigured = () => Boolean(getApiKey());

/**
 * Translate a list of texts to targetLanguage. Preserves order.
 * Cached entries are reused; empty strings pass through unchanged.
 * On failure, returns original texts (never throws for caller UX).
 */
const translateTexts = async (texts, targetLanguage) => {
  const target = normalizeTargetLanguage(targetLanguage);
  const input = Array.isArray(texts) ? texts.map((t) => String(t ?? "")) : [];

  if (!target || target === "en" || input.length === 0) {
    return input;
  }

  if (!isConfigured()) {
    return input;
  }

  const result = input.slice();
  const pendingIndexes = [];
  const pendingTexts = [];

  input.forEach((text, index) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    const key = buildCacheKey(trimmed, target);
    if (cache.has(key)) {
      result[index] = cache.get(key);
      return;
    }
    pendingIndexes.push(index);
    pendingTexts.push(trimmed);
  });

  if (pendingTexts.length === 0) {
    return result;
  }

  try {
    const url = `${TRANSLATE_ENDPOINT}?key=${encodeURIComponent(getApiKey())}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: pendingTexts,
        target,
        source: "en",
        format: "text",
      }),
    });

    if (!response.ok) {
      console.warn(
        `[translation] Google Translate failed: HTTP ${response.status}`,
      );
      return input;
    }

    const payload = await response.json();
    const translations = payload?.data?.translations;
    if (!Array.isArray(translations) || translations.length !== pendingTexts.length) {
      console.warn("[translation] Unexpected Google Translate response shape");
      return input;
    }

    translations.forEach((entry, i) => {
      const translated = String(entry?.translatedText ?? pendingTexts[i]);
      const originalIndex = pendingIndexes[i];
      const originalTrimmed = pendingTexts[i];
      cache.set(buildCacheKey(originalTrimmed, target), translated);
      result[originalIndex] = translated;
    });

    return result;
  } catch (error) {
    console.warn("[translation] Google Translate error:", error.message);
    return input;
  }
};

const translateText = async (text, targetLanguage) => {
  const [translated] = await translateTexts([text], targetLanguage);
  return translated;
};

/** Test helper — clears runtime cache. */
const clearTranslationCache = () => {
  cache.clear();
};

module.exports = {
  translateText,
  translateTexts,
  isConfigured,
  clearTranslationCache,
  normalizeTargetLanguage,
};
