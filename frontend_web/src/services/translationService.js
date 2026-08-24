import api from "./api";

const clientCache = new Map();

function cacheKey(text, targetLanguage) {
  return `${targetLanguage}::${text}`;
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
 * Batch-translate texts via backend. English/empty → identity.
 * Session cache avoids repeat API calls for identical strings.
 */
export async function translateTexts(texts, targetLanguage = "ar") {
  const target = String(targetLanguage || "").trim().toLowerCase().split("-")[0];
  const input = Array.isArray(texts) ? texts.map((t) => String(t ?? "")) : [];

  if (!target || target === "en" || input.length === 0) {
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
    const key = cacheKey(trimmed, target);
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
      const next = String(value ?? original);
      clientCache.set(cacheKey(original, target), next);
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
