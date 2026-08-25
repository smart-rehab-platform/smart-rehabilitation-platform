/**
 * Azure Translator helper with in-memory cache.
 * Bidirectional display translation (en ↔ ar) based on text script + targetLanguage.
 *
 * Env:
 *   AZURE_TRANSLATOR_KEY
 *   AZURE_TRANSLATOR_REGION
 *   AZURE_TRANSLATOR_ENDPOINT
 */

const AZURE_BATCH_SIZE = 50;
const ARABIC_SCRIPT_RE = /[\u0600-\u06FF]/;

const cache = new Map();

const normalizeTargetLanguage = (value) => {
  const primary = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .split("-")[0];
  return primary || "";
};

/** True when text contains Arabic script. */
const containsArabic = (text) => ARABIC_SCRIPT_RE.test(String(text || ""));

/** Detect source language from text content. */
const detectSourceLanguage = (text) =>
  containsArabic(text) ? "ar" : "en";

const buildCacheKey = (text, sourceLanguage, targetLanguage) =>
  `${sourceLanguage}::${targetLanguage}::${text}`;

const getApiKey = () =>
  String(process.env.AZURE_TRANSLATOR_KEY || "").trim();

const getRegion = () =>
  String(process.env.AZURE_TRANSLATOR_REGION || "").trim();

const getEndpoint = () => {
  const raw = String(process.env.AZURE_TRANSLATOR_ENDPOINT || "").trim();
  if (!raw) return "";
  return raw.endsWith("/") ? raw : `${raw}/`;
};

const isConfigured = () =>
  Boolean(getApiKey() && getRegion() && getEndpoint());

const chunkArray = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

/**
 * Translate one Azure batch for a fixed from/to pair.
 * On failure returns originals for that batch only.
 */
const translateAzureBatch = async (pendingTexts, source, target) => {
  const url = `${getEndpoint()}translate?api-version=3.0&from=${encodeURIComponent(source)}&to=${encodeURIComponent(target)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": getApiKey(),
      "Ocp-Apim-Subscription-Region": getRegion(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pendingTexts.map((Text) => ({ Text }))),
  });

  if (!response.ok) {
    console.warn(
      `[translation] Azure Translator failed: HTTP ${response.status}`,
    );
    return pendingTexts;
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || payload.length !== pendingTexts.length) {
    console.warn("[translation] Unexpected Azure Translator response shape");
    return pendingTexts;
  }

  return payload.map((entry, i) =>
    String(entry?.translations?.[0]?.text ?? pendingTexts[i]),
  );
};

/**
 * Translate a list of texts to targetLanguage. Preserves order.
 * Skips when detected source == target; batches by source language.
 */
const translateTexts = async (texts, targetLanguage) => {
  const target = normalizeTargetLanguage(targetLanguage);
  const input = Array.isArray(texts) ? texts.map((t) => String(t ?? "")) : [];

  if (!target || input.length === 0) {
    return input;
  }

  if (!isConfigured()) {
    return input;
  }

  const result = input.slice();
  /** @type {Record<string, { indexes: number[], texts: string[] }>} */
  const pendingBySource = {};

  input.forEach((text, index) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const source = detectSourceLanguage(trimmed);
    if (source === target) {
      return;
    }

    const key = buildCacheKey(trimmed, source, target);
    if (cache.has(key)) {
      result[index] = cache.get(key);
      return;
    }

    if (!pendingBySource[source]) {
      pendingBySource[source] = { indexes: [], texts: [] };
    }
    pendingBySource[source].indexes.push(index);
    pendingBySource[source].texts.push(trimmed);
  });

  const sources = Object.keys(pendingBySource);
  if (sources.length === 0) {
    return result;
  }

  for (const source of sources) {
    const { indexes, texts: pendingTexts } = pendingBySource[source];
    const textChunks = chunkArray(pendingTexts, AZURE_BATCH_SIZE);
    const indexChunks = chunkArray(indexes, AZURE_BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < textChunks.length; batchIndex += 1) {
      const batchTexts = textChunks[batchIndex];
      const batchIndexes = indexChunks[batchIndex];

      try {
        const translatedBatch = await translateAzureBatch(
          batchTexts,
          source,
          target,
        );
        translatedBatch.forEach((translated, i) => {
          const originalTrimmed = batchTexts[i];
          const originalIndex = batchIndexes[i];
          if (translated !== originalTrimmed) {
            cache.set(
              buildCacheKey(originalTrimmed, source, target),
              translated,
            );
          }
          result[originalIndex] = translated;
        });
      } catch (error) {
        console.warn(
          `[translation] Azure Translator batch ${source}->${target} #${batchIndex + 1} error:`,
          error.message,
        );
      }
    }
  }

  return result;
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
  containsArabic,
  detectSourceLanguage,
  AZURE_BATCH_SIZE,
};
