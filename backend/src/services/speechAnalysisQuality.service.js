/**
 * Deterministic speech analysis quality assessment (V2.4).
 * Engineering reliability checks only — not clinical speech quality rating.
 */

const speechWordAlignmentService = require("./speechWordAlignment.service");

const DEFAULT_MIN_AVG_ASR_CONFIDENCE = 0.45;
const DEFAULT_MIN_WORD_ASR_CONFIDENCE = 0.30;
const DEFAULT_MIN_SPEECH_DURATION_SECONDS = 0.5;
const DEFAULT_EXTREME_MISMATCH_ACCURACY = 10;

const WARNING_MESSAGES = {
  empty_transcript:
    "No transcript was produced. Review the recording and try again before interpreting scores.",
  low_asr_confidence:
    "Speech recognition confidence was low. Review the transcript before interpreting the scores.",
  very_low_word_asr_confidence:
    "At least one ASR-recognized word has very low transcription confidence. Review the transcript before interpreting this analysis. This is not a pronunciation rating.",
  insufficient_recognized_speech:
    "Very few words were recognized with usable timing. The analysis may be unreliable.",
  expected_spoken_mismatch:
    "The detected speech differs substantially from the exercise target. Verify the recording and target text before drawing conclusions.",
  timing_quality_warning:
    "Word timing data may be unreliable. Fluency timing metrics should be interpreted cautiously.",
  very_short_speech_sample:
    "The recognized speech sample is very short. Additional recordings may be needed for reliable comparison.",
};

const getMinAvgAsrConfidence = () => {
  const parsed = Number(process.env.SPEECH_MIN_AVG_ASR_CONFIDENCE);
  if (Number.isFinite(parsed) && parsed > 0 && parsed <= 1) {
    return parsed;
  }
  return DEFAULT_MIN_AVG_ASR_CONFIDENCE;
};

const getMinWordAsrConfidence = () => {
  const parsed = Number(process.env.SPEECH_MIN_WORD_ASR_CONFIDENCE);
  if (Number.isFinite(parsed) && parsed > 0 && parsed <= 1) {
    return parsed;
  }
  return DEFAULT_MIN_WORD_ASR_CONFIDENCE;
};

const getMinSpeechDurationSeconds = () => {
  const parsed = Number(process.env.SPEECH_MIN_SPEECH_DURATION_SECONDS);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_MIN_SPEECH_DURATION_SECONDS;
};

const getExtremeMismatchAccuracy = () => {
  const parsed = Number(process.env.SPEECH_EXTREME_MISMATCH_ACCURACY);
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) {
    return parsed;
  }
  return DEFAULT_EXTREME_MISMATCH_ACCURACY;
};

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const roundMetric = (value, decimals = 4) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  return Number(Number(value).toFixed(decimals));
};

const buildWarning = (code, overrides = {}) => ({
  code,
  message: overrides.message || WARNING_MESSAGES[code] || code,
  ...overrides,
});

const extractTimestampedWords = (segments) => {
  if (!Array.isArray(segments)) {
    return [];
  }

  const words = [];
  segments.forEach((segment) => {
    const segmentWords = Array.isArray(segment?.words) ? segment.words : [];
    segmentWords.forEach((entry) => {
      const start = Number(entry?.start);
      const end = Number(entry?.end);
      const token = String(entry?.word || "").trim();
      if (!token || !Number.isFinite(start) || !Number.isFinite(end)) {
        return;
      }
      words.push({ word: token, start, end, probability: Number(entry?.probability) });
    });
  });

  return words;
};

const assessTimingQuality = ({ segments, timingMetrics }) => {
  const words = extractTimestampedWords(segments);
  if (words.length === 0) {
    if (
      timingMetrics?.timing_source === "whisper_word_timestamps" &&
      (timingMetrics?.word_count ?? 0) > 0
    ) {
      return { suspicious: true, zeroDurationCount: 0, invalidCount: 0, missingTimestamps: true };
    }
    return { suspicious: false, zeroDurationCount: 0, invalidCount: 0, missingTimestamps: false };
  }

  let zeroDurationCount = 0;
  let invalidCount = 0;

  words.forEach((word) => {
    if (word.end < word.start) {
      invalidCount += 1;
    }
    if (word.end - word.start <= 0) {
      zeroDurationCount += 1;
    }
  });

  const suspicious =
    invalidCount > 0 ||
    zeroDurationCount >= Math.max(2, Math.ceil(words.length * 0.5));

  return { suspicious, zeroDurationCount, invalidCount, missingTimestamps: false, wordCount: words.length };
};

const deriveConfidenceLabel = (warningCodes) => {
  if (warningCodes.includes("empty_transcript")) {
    return "low";
  }
  if (
    warningCodes.includes("low_asr_confidence") ||
    warningCodes.includes("very_low_word_asr_confidence") ||
    warningCodes.includes("insufficient_recognized_speech")
  ) {
    return "low";
  }
  if (warningCodes.length > 0) {
    return "moderate";
  }
  return "high";
};

const deriveQualityStatus = (warningCodes) => {
  if (warningCodes.includes("empty_transcript")) {
    return "low_quality";
  }

  const severeCodes = new Set([
    "empty_transcript",
    "insufficient_recognized_speech",
  ]);

  if (warningCodes.some((code) => severeCodes.has(code))) {
    return "low_quality";
  }

  if (warningCodes.length > 0) {
    return "usable_with_caution";
  }

  return "good";
};

const assessSpeechAnalysisQuality = ({
  transcript = "",
  expectedText = null,
  wordAnalysis = null,
  timingMetrics = null,
  asrConfidence = null,
  segments = null,
} = {}) => {
  const warnings = [];
  const measured = {
    transcript_word_count: 0,
    expected_word_count: null,
    word_accuracy_percentage: null,
    average_word_probability: null,
    minimum_word_probability: null,
    low_confidence_word_count: null,
    word_probability_count: null,
    timestamped_word_count: null,
    speech_duration_seconds: null,
    min_avg_asr_confidence_threshold: getMinAvgAsrConfidence(),
    min_word_asr_confidence_threshold: getMinWordAsrConfidence(),
    min_speech_duration_seconds_threshold: getMinSpeechDurationSeconds(),
    extreme_mismatch_accuracy_threshold: getExtremeMismatchAccuracy(),
  };

  const normalizedTranscript =
    typeof transcript === "string" ? transcript.trim() : "";
  const transcriptWords = speechWordAlignmentService.tokenizeWords(normalizedTranscript);
  measured.transcript_word_count = transcriptWords.length;

  if (!normalizedTranscript) {
    warnings.push(buildWarning("empty_transcript"));
  }

  const avgProbability = toNumber(asrConfidence?.average_word_probability);
  const minProbability = toNumber(asrConfidence?.minimum_word_probability);
  const lowConfidenceWordCount = toNumber(asrConfidence?.low_confidence_word_count);
  const wordProbabilityCount = toNumber(asrConfidence?.word_probability_count);
  measured.average_word_probability = avgProbability;
  measured.minimum_word_probability = minProbability;
  measured.low_confidence_word_count = lowConfidenceWordCount;
  measured.word_probability_count = wordProbabilityCount;

  const timestampedWords = extractTimestampedWords(segments);
  measured.timestamped_word_count = timestampedWords.length;
  measured.speech_duration_seconds = toNumber(timingMetrics?.speech_duration_seconds);

  const hasWordProbabilities =
    asrConfidence?.word_probability_count >= 1 || wordProbabilityCount >= 1;

  if (
    avgProbability !== null &&
    hasWordProbabilities &&
    avgProbability < getMinAvgAsrConfidence()
  ) {
    warnings.push(
      buildWarning("low_asr_confidence", {
        average_word_probability: roundMetric(avgProbability),
        threshold: getMinAvgAsrConfidence(),
      })
    );
  }

  if (
    minProbability !== null &&
    hasWordProbabilities &&
    minProbability < getMinWordAsrConfidence()
  ) {
    warnings.push(
      buildWarning("very_low_word_asr_confidence", {
        minimum_word_probability: roundMetric(minProbability),
        threshold: getMinWordAsrConfidence(),
        low_confidence_word_count: lowConfidenceWordCount,
        word_probability_count: wordProbabilityCount,
      })
    );
  }

  const recognizedWordCount =
    measured.timestamped_word_count > 0
      ? measured.timestamped_word_count
      : measured.transcript_word_count;

  if (recognizedWordCount <= 1 && normalizedTranscript) {
    warnings.push(
      buildWarning("insufficient_recognized_speech", {
        recognized_word_count: recognizedWordCount,
      })
    );
  }

  if (speechWordAlignmentService.hasMeaningfulExpectedText(expectedText)) {
    measured.expected_word_count = speechWordAlignmentService.tokenizeWords(expectedText).length;
    measured.word_accuracy_percentage = toNumber(wordAnalysis?.word_accuracy_percentage);

    if (
      measured.word_accuracy_percentage !== null &&
      measured.expected_word_count > 0 &&
      measured.word_accuracy_percentage <= getExtremeMismatchAccuracy()
    ) {
      warnings.push(
        buildWarning("expected_spoken_mismatch", {
          word_accuracy_percentage: measured.word_accuracy_percentage,
          threshold: getExtremeMismatchAccuracy(),
        })
      );
    }
  }

  const timingAssessment = assessTimingQuality({ segments, timingMetrics });
  if (timingAssessment.suspicious) {
    warnings.push(
      buildWarning("timing_quality_warning", {
        zero_duration_word_count: timingAssessment.zeroDurationCount,
        invalid_timestamp_count: timingAssessment.invalidCount,
        missing_word_timestamps: timingAssessment.missingTimestamps,
      })
    );
  }

  if (
    measured.speech_duration_seconds !== null &&
    measured.speech_duration_seconds > 0 &&
    measured.speech_duration_seconds < getMinSpeechDurationSeconds()
  ) {
    warnings.push(
      buildWarning("very_short_speech_sample", {
        speech_duration_seconds: roundMetric(measured.speech_duration_seconds, 2),
        threshold_seconds: getMinSpeechDurationSeconds(),
      })
    );
  }

  const warningCodes = warnings.map((warning) => warning.code);
  const status = deriveQualityStatus(warningCodes);
  const confidence = deriveConfidenceLabel(warningCodes);

  return {
    status,
    confidence,
    warnings,
    measured,
  };
};

const buildAnalysisQualityPayload = (storedQuality) => {
  if (!storedQuality || typeof storedQuality !== "object" || Array.isArray(storedQuality)) {
    return null;
  }

  return {
    status: storedQuality.status ?? null,
    confidence: storedQuality.confidence ?? null,
    warnings: Array.isArray(storedQuality.warnings) ? storedQuality.warnings : [],
    measured: storedQuality.measured ?? null,
  };
};

module.exports = {
  DEFAULT_MIN_AVG_ASR_CONFIDENCE,
  DEFAULT_MIN_WORD_ASR_CONFIDENCE,
  DEFAULT_MIN_SPEECH_DURATION_SECONDS,
  DEFAULT_EXTREME_MISMATCH_ACCURACY,
  WARNING_MESSAGES,
  getMinAvgAsrConfidence,
  getMinWordAsrConfidence,
  getMinSpeechDurationSeconds,
  getExtremeMismatchAccuracy,
  assessSpeechAnalysisQuality,
  buildAnalysisQualityPayload,
};
