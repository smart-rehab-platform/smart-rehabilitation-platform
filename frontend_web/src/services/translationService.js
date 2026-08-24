import api from "./api";

const clientCache = new Map();
const ARABIC_SCRIPT_RE = /[\u0600-\u06FF]/;

function normalizeTarget(value) {
  return String(value || "").trim().toLowerCase().split("-")[0];
}

function detectSourceLanguage(text) {
  return ARABIC_SCRIPT_RE.test(String(text || "")) ? "ar" : "en";
}

function cacheKey(text, sourceLanguage, targetLanguage) {
  return `${sourceLanguage}::${targetLanguage}::${text}`;
}

function extractTexts(response) {
  const payload = response?.data?.data ?? response?.data;
  if (Array.isArray(payload?.texts)) {
    return payload.texts;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return null;
}

/**
 * Batch-translate texts via backend for the UI locale target.
 * Skips when detected source == target (no unnecessary Azure round-trip).
 */
export async function translateTexts(texts, targetLanguage = "ar") {
  const target = normalizeTarget(targetLanguage);
  const input = Array.isArray(texts) ? texts.map((t) => String(t ?? "")) : [];

  if (!target || input.length === 0) {
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
    const source = detectSourceLanguage(trimmed);
    if (source === target) {
      return;
    }
    const key = cacheKey(trimmed, source, target);
    if (clientCache.has(key)) {
      result[index] = clientCache.get(key);
      return;
    }
    pendingIndexes.push(index);
    pendingTexts.push(trimmed);
  });

  if (pendingTexts.length === 0) {
    return result;
  }

  try {
    const response = await api.post("/translations", {
      texts: pendingTexts,
      targetLanguage: target,
    });
    const translated = extractTexts(response);
    if (!Array.isArray(translated) || translated.length !== pendingTexts.length) {
      return input;
    }

    translated.forEach((value, i) => {
      const original = pendingTexts[i];
      const source = detectSourceLanguage(original);
      const next = String(value ?? original);
      clientCache.set(cacheKey(original, source, target), next);
      result[pendingIndexes[i]] = next;
    });

    return result;
  } catch {
    return input;
  }
}

export function clearClientTranslationCache() {
  clientCache.clear();
}
