/**
 * Speech Analysis V3.1 — English forced phoneme alignment via MFA.
 * Aligns expected pronunciation to audio; does NOT assess correctness.
 */

const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const speechAcousticExtractionService = require("./speechAcousticExtraction.service");

const PHONEME_ANALYSIS_VERSION = "3.1";
const DEFAULT_MFA_ENV_PATH = "C:\\mfa_env";
const DEFAULT_MFA_ACOUSTIC_MODEL = "english_mfa";
const DEFAULT_MFA_DICTIONARY = "english_us_mfa";
const DEFAULT_MFA_ALIGNMENT_TIMEOUT_MS = 180000;
const DEFAULT_MIN_PHONE_DURATION_SECONDS = 0.01;
const PHONE_SET_LABEL = "english_mfa";

const NON_SPEECH_WORD_LABELS = new Set(["<eps>", ""]);
const NON_SPEECH_PHONE_LABELS = new Set(["sil", "sp", "spn", ""]);

const TARGET_PHONE_MAPPINGS = {
  r: {
    aligner_phones: ["r", "ɹ", "ɚ", "ɝ", "er", "axr"],
    ipa: "ɹ",
    display: "R sound",
  },
  l: {
    aligner_phones: ["l", "ɫ", "el"],
    ipa: "l",
    display: "L sound",
  },
  s: {
    aligner_phones: ["s", "z"],
    ipa: "s",
    display: "S sound",
  },
  sh: {
    aligner_phones: ["sh", "zh", "ʃ", "ʒ"],
    ipa: "ʃ",
    display: "SH sound",
  },
  th: {
    aligner_phones: ["th", "dh", "θ", "ð"],
    ipa: "θ",
    display: "TH sound",
  },
  f: {
    aligner_phones: ["f", "v"],
    ipa: "f",
    display: "F sound",
  },
  k: {
    aligner_phones: ["k", "g", "ng"],
    ipa: "k",
    display: "K sound",
  },
  p: {
    aligner_phones: ["p", "b"],
    ipa: "p",
    display: "P sound",
  },
  t: {
    aligner_phones: ["t", "d"],
    ipa: "t",
    display: "T sound",
  },
  m: {
    aligner_phones: ["m"],
    ipa: "m",
    display: "M sound",
  },
  n: {
    aligner_phones: ["n"],
    ipa: "n",
    display: "N sound",
  },
  w: {
    aligner_phones: ["w"],
    ipa: "w",
    display: "W sound",
  },
  h: {
    aligner_phones: ["h", "hh"],
    ipa: "h",
    display: "H sound",
  },
  ch: {
    aligner_phones: ["ch", "jh", "tʃ", "dʒ"],
    ipa: "tʃ",
    display: "CH sound",
  },
  vowel_a: {
    aligner_phones: ["aa", "ae", "ah", "a", "ɑ", "æ"],
    ipa: "æ",
    display: "A vowel",
  },
  vowel_e: {
    aligner_phones: ["eh", "ey", "e", "ɛ", "eɪ"],
    ipa: "ɛ",
    display: "E vowel",
  },
  vowel_i: {
    aligner_phones: ["ih", "iy", "i", "ɪ", "i"],
    ipa: "ɪ",
    display: "I vowel",
  },
  vowel_o: {
    aligner_phones: ["ao", "ow", "o", "ɔ", "oʊ"],
    ipa: "oʊ",
    display: "O vowel",
  },
  vowel_u: {
    aligner_phones: ["uh", "uw", "u", "ʊ", "u"],
    ipa: "u",
    display: "U vowel",
  },
};

const WARNING_MESSAGES = {
  missing_expected_text:
    "Expected exercise text is required for forced phoneme alignment.",
  unsupported_language:
    "Forced phoneme alignment is available for English exercises only.",
  unsupported_target_phone:
    "The exercise target sound is not supported for MFA phone mapping.",
  dictionary_oov:
    "Some words in the expected text may be outside the MFA dictionary.",
  audio_conversion_failed:
    "Audio could not be converted to the format required for MFA alignment.",
  mfa_unavailable:
    "The MFA alignment environment is unavailable.",
  alignment_timeout: "MFA forced alignment timed out.",
  alignment_failed: "MFA forced alignment failed.",
  malformed_textgrid: "MFA produced a TextGrid that could not be parsed.",
  target_phone_not_found:
    "No aligned interval matched the requested target sound in the expected text.",
  invalid_phone_timestamps:
    "One or more aligned phone intervals had invalid timestamps.",
  very_short_phone_interval:
    "One or more aligned target-phone intervals are extremely short.",
};

const getMfaEnvPath = () =>
  (process.env.MFA_ENV_PATH || DEFAULT_MFA_ENV_PATH).trim();

const getMfaAcousticModel = () =>
  (process.env.MFA_ACOUSTIC_MODEL || DEFAULT_MFA_ACOUSTIC_MODEL).trim();

const getMfaDictionary = () =>
  (process.env.MFA_DICTIONARY || DEFAULT_MFA_DICTIONARY).trim();

const getAlignmentTimeoutMs = () => {
  const parsed = Number(process.env.MFA_ALIGNMENT_TIMEOUT_MS);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_MFA_ALIGNMENT_TIMEOUT_MS;
};

const roundSeconds = (value, decimals = 3) => {
  if (!Number.isFinite(value)) {
    return null;
  }
  return Number(Number(value).toFixed(decimals));
};

const buildWarning = (code, overrides = {}) => ({
  code,
  message: overrides.message || WARNING_MESSAGES[code] || code,
  ...overrides,
});

const buildMfaProcessEnv = () => {
  const mfaEnvPath = getMfaEnvPath();
  const pathEntries = [
    path.join(mfaEnvPath, "Library", "bin"),
    path.join(mfaEnvPath, "Scripts"),
    mfaEnvPath,
  ];
  const existingPath = process.env.PATH || "";
  return {
    ...process.env,
    PATH: `${pathEntries.join(path.delimiter)}${path.delimiter}${existingPath}`,
  };
};

const getMfaExecutable = () =>
  path.join(getMfaEnvPath(), "Scripts", "mfa.exe");

const getFfmpegExecutable = () =>
  path.join(getMfaEnvPath(), "Library", "bin", "ffmpeg.exe");

const runProcess = ({ executable, args, timeoutMs, env }) =>
  new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      env: env || buildMfaProcessEnv(),
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        const timeoutError = new Error("Process timed out");
        timeoutError.code = "ETIMEDOUT";
        reject(timeoutError);
        return;
      }

      resolve({ code, stdout, stderr });
    });
  });

const stripQuotes = (value) => {
  const normalized = String(value ?? "").trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    return normalized.slice(1, -1);
  }
  return normalized;
};

const normalizeTargetKey = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase().replace(/\s+/g, "_");
};

const resolveTargetPhoneMapping = (targetPhoneme) => {
  const normalized = normalizeTargetKey(targetPhoneme);
  if (!normalized) {
    return null;
  }

  if (TARGET_PHONE_MAPPINGS[normalized]) {
    return {
      requested: normalized,
      ...TARGET_PHONE_MAPPINGS[normalized],
    };
  }

  const slashMatch = normalized.match(/^\/(.+)\/$/);
  if (slashMatch && TARGET_PHONE_MAPPINGS[slashMatch[1]]) {
    return {
      requested: slashMatch[1],
      ...TARGET_PHONE_MAPPINGS[slashMatch[1]],
    };
  }

  return null;
};

const isSpeechWord = (label) => {
  const normalized = String(label ?? "").trim();
  return normalized.length > 0 && !NON_SPEECH_WORD_LABELS.has(normalized);
};

const isSpeechPhone = (label) => {
  const normalized = String(label ?? "").trim();
  return normalized.length > 0 && !NON_SPEECH_PHONE_LABELS.has(normalized);
};

const parseIntervalBlock = (lines, startIndex) => {
  let index = startIndex;
  const readField = (prefix) => {
    while (index < lines.length) {
      const line = lines[index].trim();
      index += 1;
      if (line.startsWith(prefix)) {
        return line.slice(prefix.length).trim();
      }
    }
    return null;
  };

  const xmin = Number(readField("xmin ="));
  const xmax = Number(readField("xmax ="));
  const text = stripQuotes(readField("text =") ?? "");

  return {
    nextIndex: index,
    interval: {
      start: xmin,
      end: xmax,
      label: text,
    },
  };
};

const parseTier = (lines, startIndex) => {
  let index = startIndex;
  let name = null;
  let intervals = [];

  while (index < lines.length) {
    const line = lines[index].trim();
    index += 1;

    if (line.startsWith("name =")) {
      name = stripQuotes(line.slice("name =".length));
      continue;
    }

    if (line.startsWith("intervals: size =")) {
      const size = Number(line.slice("intervals: size =".length).trim());
      for (let i = 0; i < size; i += 1) {
        while (index < lines.length && !lines[index].trim().startsWith("intervals [")) {
          index += 1;
        }
        if (index >= lines.length) {
          break;
        }
        index += 1;
        const parsed = parseIntervalBlock(lines, index);
        index = parsed.nextIndex;
        intervals.push(parsed.interval);
      }
      break;
    }

    if (line.startsWith("item [")) {
      index -= 1;
      break;
    }
  }

  return { name, intervals, nextIndex: index };
};

const parseTextGrid = (content) => {
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Empty TextGrid content");
  }

  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const tiers = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    index += 1;
    if (line.startsWith("item [")) {
      const tier = parseTier(lines, index);
      index = tier.nextIndex;
      tiers.push(tier);
    }
  }

  const wordsTier = tiers.find((tier) => tier.name === "words");
  const phonesTier = tiers.find((tier) => tier.name === "phones");

  if (!wordsTier || !phonesTier) {
    throw new Error("Missing words or phones tier");
  }

  const words = [];
  wordsTier.intervals.forEach((interval, wordIndex) => {
    if (!Number.isFinite(interval.start) || !Number.isFinite(interval.end)) {
      return;
    }
    if (interval.end < interval.start) {
      return;
    }
    if (!isSpeechWord(interval.label)) {
      return;
    }

    words.push({
      word: interval.label,
      word_index: words.length,
      start: roundSeconds(interval.start),
      end: roundSeconds(interval.end),
      duration_seconds: roundSeconds(interval.end - interval.start),
    });
  });

  const phones = [];
  phonesTier.intervals.forEach((interval) => {
    if (!Number.isFinite(interval.start) || !Number.isFinite(interval.end)) {
      return;
    }
    if (interval.end < interval.start) {
      return;
    }
    if (!isSpeechPhone(interval.label)) {
      return;
    }

    phones.push({
      phone: interval.label,
      phone_index: phones.length,
      start: roundSeconds(interval.start),
      end: roundSeconds(interval.end),
      duration_seconds: roundSeconds(interval.end - interval.start),
    });
  });

  return { words, phones };
};

const findWordForPhone = (words, phoneStart, phoneEnd) => {
  const midpoint = (phoneStart + phoneEnd) / 2;
  let bestWord = null;

  words.forEach((word) => {
    if (midpoint >= word.start && midpoint <= word.end) {
      bestWord = word;
      return;
    }

    const overlapStart = Math.max(word.start, phoneStart);
    const overlapEnd = Math.min(word.end, phoneEnd);
    if (overlapEnd > overlapStart) {
      if (!bestWord || overlapEnd - overlapStart > bestWord.overlap) {
        bestWord = { ...word, overlap: overlapEnd - overlapStart };
      }
    }
  });

  if (!bestWord) {
    return null;
  }

  const { overlap, ...word } = bestWord;
  return word;
};

const resolveTargetOccurrences = ({ phones, words, targetPhoneMapping }) => {
  if (!targetPhoneMapping) {
    return [];
  }

  const acceptablePhones = new Set(
    targetPhoneMapping.aligner_phones.map((phone) => phone.toLowerCase())
  );

  return phones
    .filter((phone) => acceptablePhones.has(String(phone.phone).toLowerCase()))
    .map((phone) => {
      const word = findWordForPhone(words, phone.start, phone.end);
      return {
        word: word?.word ?? null,
        word_index: word?.word_index ?? null,
        phone_index: phone.phone_index,
        phone: phone.phone,
        start: phone.start,
        end: phone.end,
        duration_seconds: phone.duration_seconds,
      };
    });
};

const deriveQualityStatus = (warnings) => {
  const codes = warnings.map((warning) => warning.code);
  if (codes.includes("missing_expected_text") || codes.includes("unsupported_language")) {
    return "unavailable";
  }
  if (
    codes.some((code) =>
      [
        "audio_conversion_failed",
        "mfa_unavailable",
        "alignment_timeout",
        "alignment_failed",
        "malformed_textgrid",
      ].includes(code)
    )
  ) {
    return "failed";
  }
  if (codes.length > 0) {
    return "partial";
  }
  return "available";
};

const buildUnavailablePayload = ({
  language,
  expectedText,
  targetPhoneme,
  warnings,
}) => {
  const targetPhoneMapping = targetPhoneme
    ? resolveTargetPhoneMapping(targetPhoneme)
    : null;

  return {
    version: PHONEME_ANALYSIS_VERSION,
    language: language || "en",
    alignment_engine: "mfa",
    phone_set: PHONE_SET_LABEL,
    expected_text: expectedText ?? null,
    target_phone: targetPhoneMapping
      ? {
          requested: targetPhoneMapping.requested,
          aligner_phones: targetPhoneMapping.aligner_phones,
          ipa: targetPhoneMapping.ipa,
          display: targetPhoneMapping.display,
        }
      : null,
    words: [],
    phones: [],
    target_occurrences: [],
    quality: {
      available: false,
      status: deriveQualityStatus(warnings),
      warnings,
    },
  };
};

const convertAudioToMfaWav = async (sourcePath, destinationPath) => {
  const ffmpegExecutable = getFfmpegExecutable();
  const result = await runProcess({
    executable: ffmpegExecutable,
    args: ["-y", "-i", sourcePath, "-ac", "1", "-ar", "16000", destinationPath],
    timeoutMs: getAlignmentTimeoutMs(),
  });

  if (result.code !== 0) {
    const error = new Error(result.stderr || "ffmpeg conversion failed");
    error.code = "AUDIO_CONVERSION_FAILED";
    throw error;
  }
};

const runMfaAlignOne = async ({ wavPath, textPath, outputPath }) => {
  const mfaExecutable = getMfaExecutable();
  const result = await runProcess({
    executable: mfaExecutable,
    args: [
      "align_one",
      wavPath,
      textPath,
      getMfaDictionary(),
      getMfaAcousticModel(),
      outputPath,
    ],
    timeoutMs: getAlignmentTimeoutMs(),
  });

  if (result.code !== 0) {
    const combined = `${result.stdout}\n${result.stderr}`.trim();
    const error = new Error(combined || "MFA align_one failed");
    error.code = "ALIGNMENT_FAILED";
    if (/out of vocabulary|oov/i.test(combined)) {
      error.code = "DICTIONARY_OOV";
    }
    throw error;
  }
};

const createTempWorkDir = async () => {
  const baseDir = path.join(os.tmpdir(), "smart-rehab-mfa");
  await fs.mkdir(baseDir, { recursive: true });
  return fs.mkdtemp(path.join(baseDir, path.sep));
};

const safeUnlink = async (targetPath) => {
  if (!targetPath) {
    return;
  }

  try {
    await fs.unlink(targetPath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      // Ignore cleanup failures.
    }
  }
};

const safeRemoveDir = async (targetPath) => {
  if (!targetPath) {
    return;
  }

  try {
    await fs.rm(targetPath, { recursive: true, force: true });
  } catch (_) {
    // Ignore cleanup failures.
  }
};

const assessParsedAlignmentQuality = ({
  words,
  phones,
  targetOccurrences,
  targetPhoneMapping,
  targetPhoneme,
}) => {
  const warnings = [];

  phones.forEach((phone) => {
    if (
      phone.start === null ||
      phone.end === null ||
      phone.end < phone.start
    ) {
      warnings.push(buildWarning("invalid_phone_timestamps"));
    }
  });

  if (targetPhoneme && !targetPhoneMapping) {
    warnings.push(buildWarning("unsupported_target_phone", { requested: targetPhoneme }));
  }

  if (targetPhoneMapping && targetOccurrences.length === 0) {
    warnings.push(buildWarning("target_phone_not_found"));
  }

  targetOccurrences.forEach((occurrence) => {
    if (
      occurrence.duration_seconds !== null &&
      occurrence.duration_seconds < DEFAULT_MIN_PHONE_DURATION_SECONDS
    ) {
      warnings.push(
        buildWarning("very_short_phone_interval", {
          phone: occurrence.phone,
          duration_seconds: occurrence.duration_seconds,
        })
      );
    }
  });

  const uniqueWarnings = [];
  const seenCodes = new Set();
  warnings.forEach((warning) => {
    if (seenCodes.has(warning.code)) {
      return;
    }
    seenCodes.add(warning.code);
    uniqueWarnings.push(warning);
  });

  return uniqueWarnings;
};

const runPhonemeAlignment = async ({
  audioFilePath,
  expectedText,
  targetPhoneme = null,
  language = "en",
} = {}) => {
  const normalizedLanguage = String(language || "").trim().toLowerCase();
  const trimmedExpectedText =
    typeof expectedText === "string" ? expectedText.trim() : "";

  if (normalizedLanguage !== "en") {
    return buildUnavailablePayload({
      language: normalizedLanguage || null,
      expectedText: trimmedExpectedText || null,
      targetPhoneme,
      warnings: [buildWarning("unsupported_language")],
    });
  }

  if (!trimmedExpectedText) {
    return buildUnavailablePayload({
      language: "en",
      expectedText: null,
      targetPhoneme,
      warnings: [buildWarning("missing_expected_text")],
    });
  }

  const targetPhoneMapping = targetPhoneme
    ? resolveTargetPhoneMapping(targetPhoneme)
    : null;

  let tempDir = null;
  const tempFiles = [];

  const startedAt = Date.now();
  const timings = {
    audio_conversion_ms: null,
    mfa_alignment_ms: null,
    total_ms: null,
  };

  try {
    tempDir = await createTempWorkDir();
    const wavPath = path.join(tempDir, "alignment-input.wav");
    const textPath = path.join(tempDir, "alignment-input.txt");
    const textGridPath = path.join(tempDir, "alignment-input.TextGrid");
    tempFiles.push(wavPath, textPath, textGridPath);

    const conversionStarted = Date.now();
    await convertAudioToMfaWav(audioFilePath, wavPath);
    timings.audio_conversion_ms = Date.now() - conversionStarted;

    await fs.writeFile(textPath, trimmedExpectedText, "utf8");

    const alignmentStarted = Date.now();
    await runMfaAlignOne({ wavPath, textPath, outputPath: textGridPath });
    timings.mfa_alignment_ms = Date.now() - alignmentStarted;

    const textGridContent = await fs.readFile(textGridPath, "utf8");
    const parsed = parseTextGrid(textGridContent);
    const targetOccurrences = resolveTargetOccurrences({
      phones: parsed.phones,
      words: parsed.words,
      targetPhoneMapping,
    });
    const warnings = assessParsedAlignmentQuality({
      words: parsed.words,
      phones: parsed.phones,
      targetOccurrences,
      targetPhoneMapping,
      targetPhoneme,
    });

    let enrichedOccurrences = targetOccurrences;
    if (targetOccurrences.length > 0) {
      const acoustic = await speechAcousticExtractionService.extractOccurrenceAcoustics({
        wavPath,
        occurrences: targetOccurrences,
      });
      enrichedOccurrences = acoustic.occurrences;
      timings.acoustic_extraction_ms = acoustic.timings?.acoustic_extraction_ms ?? null;
      timings.python_process_ms = acoustic.timings?.python_process_ms ?? null;
      if (acoustic.warning) {
        warnings.push(acoustic.warning);
      }
    }

    timings.total_ms = Date.now() - startedAt;

    return {
      version: PHONEME_ANALYSIS_VERSION,
      language: "en",
      alignment_engine: "mfa",
      phone_set: PHONE_SET_LABEL,
      expected_text: trimmedExpectedText,
      target_phone: targetPhoneMapping
        ? {
            requested: targetPhoneMapping.requested,
            aligner_phones: targetPhoneMapping.aligner_phones,
            ipa: targetPhoneMapping.ipa,
            display: targetPhoneMapping.display,
          }
        : null,
      words: parsed.words,
      phones: parsed.phones,
      target_occurrences: enrichedOccurrences,
      quality: {
        available: true,
        status: deriveQualityStatus(warnings),
        warnings,
        timings,
      },
    };
  } catch (error) {
    timings.total_ms = Date.now() - startedAt;

    const warnings = [];
    if (error.code === "ETIMEDOUT") {
      warnings.push(buildWarning("alignment_timeout"));
    } else if (error.code === "AUDIO_CONVERSION_FAILED") {
      warnings.push(buildWarning("audio_conversion_failed"));
    } else if (error.code === "DICTIONARY_OOV") {
      warnings.push(buildWarning("dictionary_oov"));
      warnings.push(buildWarning("alignment_failed", { detail: error.message }));
    } else if (error.code === "ALIGNMENT_FAILED") {
      warnings.push(buildWarning("alignment_failed", { detail: error.message }));
    } else if (/textgrid/i.test(error.message)) {
      warnings.push(buildWarning("malformed_textgrid", { detail: error.message }));
    } else if (error.code === "ENOENT") {
      warnings.push(buildWarning("mfa_unavailable", { detail: error.message }));
    } else {
      warnings.push(buildWarning("alignment_failed", { detail: error.message }));
    }

    return buildUnavailablePayload({
      language: "en",
      expectedText: trimmedExpectedText,
      targetPhoneme,
      warnings,
    });
  } finally {
    await Promise.all(tempFiles.map((filePath) => safeUnlink(filePath)));
    await safeRemoveDir(tempDir);
  }
};

const buildPhonemeAnalysisPayload = (storedValue) => {
  if (!storedValue || typeof storedValue !== "object" || Array.isArray(storedValue)) {
    return null;
  }

  return storedValue;
};

module.exports = {
  PHONEME_ANALYSIS_VERSION,
  DEFAULT_MFA_ENV_PATH,
  DEFAULT_MFA_ACOUSTIC_MODEL,
  DEFAULT_MFA_DICTIONARY,
  DEFAULT_MFA_ALIGNMENT_TIMEOUT_MS,
  TARGET_PHONE_MAPPINGS,
  WARNING_MESSAGES,
  getMfaEnvPath,
  getMfaAcousticModel,
  getMfaDictionary,
  getAlignmentTimeoutMs,
  buildMfaProcessEnv,
  resolveTargetPhoneMapping,
  parseTextGrid,
  resolveTargetOccurrences,
  runPhonemeAlignment,
  buildPhonemeAnalysisPayload,
};
