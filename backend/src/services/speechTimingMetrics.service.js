/**
 * Deterministic speech timing / fluency metrics from Faster-Whisper word timestamps.
 * Engineering measurements only — not clinical diagnosis.
 */

const DEFAULT_PAUSE_THRESHOLD_SECONDS = 0.5;

const getPauseThresholdSeconds = () => {
  const parsed = Number(process.env.SPEECH_PAUSE_THRESHOLD_SECONDS);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_PAUSE_THRESHOLD_SECONDS;
};

const roundMetric = (value, decimals = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  return Number(value.toFixed(decimals));
};

const isValidTimestamp = (value) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const normalizeWordToken = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
};

const extractTimestampedWords = (segments) => {
  if (!Array.isArray(segments) || segments.length === 0) {
    return [];
  }

  const words = [];

  segments.forEach((segment) => {
    const segmentWords = Array.isArray(segment?.words) ? segment.words : [];
    segmentWords.forEach((entry) => {
      const start = Number(entry?.start);
      const end = Number(entry?.end);
      const token = normalizeWordToken(entry?.word);

      if (!token || !isValidTimestamp(start) || !isValidTimestamp(end) || end < start) {
        return;
      }

      const word = {
        word: token,
        start,
        end,
      };

      const probability = Number(entry?.probability);
      if (Number.isFinite(probability)) {
        word.probability = probability;
      }

      words.push(word);
    });
  });

  words.sort((a, b) => a.start - b.start || a.end - b.end);
  return words;
};

const countTranscriptWordsFallback = (transcript) => {
  if (typeof transcript !== "string" || !transcript.trim()) {
    return 0;
  }

  return transcript
    .trim()
    .split(/\s+/)
    .map((token) => normalizeWordToken(token))
    .filter(Boolean)
    .length;
};

const calculatePauseMetrics = (words, pauseThresholdSeconds) => {
  const pauses = [];

  for (let index = 1; index < words.length; index += 1) {
    const gap = words[index].start - words[index - 1].end;
    if (gap >= pauseThresholdSeconds) {
      pauses.push(Number(gap.toFixed(4)));
    }
  }

  if (pauses.length === 0) {
    return {
      pause_count: 0,
      total_pause_duration_seconds: 0,
      average_pause_duration_seconds: 0,
      longest_pause_seconds: 0,
      pauses: [],
    };
  }

  const totalPauseDuration = pauses.reduce((sum, value) => sum + value, 0);

  return {
    pause_count: pauses.length,
    total_pause_duration_seconds: roundMetric(totalPauseDuration, 4),
    average_pause_duration_seconds: roundMetric(
      totalPauseDuration / pauses.length,
      4
    ),
    longest_pause_seconds: roundMetric(Math.max(...pauses), 4),
    pauses,
  };
};

const calculateAsrConfidenceSummary = (words) => {
  const probabilities = words
    .map((word) => word.probability)
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  if (probabilities.length === 0) {
    return null;
  }

  const average = probabilities.reduce((sum, value) => sum + value, 0) / probabilities.length;
  const minimum = Math.min(...probabilities);
  const lowConfidenceWordCount = probabilities.filter((value) => value < 0.5).length;

  return {
    average_word_probability: roundMetric(average, 4),
    minimum_word_probability: roundMetric(minimum, 4),
    low_confidence_word_count: lowConfidenceWordCount,
    word_probability_count: probabilities.length,
  };
};

const calculateSpeechTimingMetrics = ({
  segments = null,
  transcript = "",
  audioDurationSeconds = null,
} = {}) => {
  const pauseThresholdSeconds = getPauseThresholdSeconds();
  const timestampedWords = extractTimestampedWords(segments);

  if (timestampedWords.length === 0) {
    const fallbackWordCount = countTranscriptWordsFallback(transcript);
    const audioDuration = isValidTimestamp(Number(audioDurationSeconds))
      ? Number(audioDurationSeconds)
      : null;

    if (fallbackWordCount === 0 && !audioDuration) {
      return null;
    }

    return {
      speech_duration_seconds: audioDuration ? roundMetric(audioDuration) : null,
      audio_duration_seconds: audioDuration ? roundMetric(audioDuration) : null,
      word_count: fallbackWordCount,
      words_per_second: null,
      words_per_minute: null,
      pause_threshold_seconds: pauseThresholdSeconds,
      pause_count: null,
      total_pause_duration_seconds: null,
      average_pause_duration_seconds: null,
      longest_pause_seconds: null,
      pause_ratio_percentage: null,
      timing_source: "transcript_fallback",
      asr_confidence: null,
    };
  }

  const firstWordStart = timestampedWords[0].start;
  const lastWordEnd = timestampedWords[timestampedWords.length - 1].end;
  const speechDurationSeconds = Math.max(lastWordEnd - firstWordStart, 0);
  const wordCount = timestampedWords.length;
  const wordsPerSecond =
    speechDurationSeconds > 0 ? wordCount / speechDurationSeconds : null;
  const wordsPerMinute =
    wordsPerSecond !== null ? wordsPerSecond * 60 : null;
  const pauseMetrics = calculatePauseMetrics(
    timestampedWords,
    pauseThresholdSeconds
  );
  const pauseRatioPercentage =
    speechDurationSeconds > 0
      ? (pauseMetrics.total_pause_duration_seconds / speechDurationSeconds) * 100
      : 0;

  return {
    speech_duration_seconds: roundMetric(speechDurationSeconds),
    audio_duration_seconds: isValidTimestamp(Number(audioDurationSeconds))
      ? roundMetric(Number(audioDurationSeconds))
      : roundMetric(lastWordEnd),
    word_count: wordCount,
    words_per_second: wordsPerSecond !== null ? roundMetric(wordsPerSecond) : null,
    words_per_minute:
      wordsPerMinute !== null ? roundMetric(wordsPerMinute) : null,
    pause_threshold_seconds: pauseThresholdSeconds,
    pause_count: pauseMetrics.pause_count,
    total_pause_duration_seconds: pauseMetrics.total_pause_duration_seconds,
    average_pause_duration_seconds: pauseMetrics.average_pause_duration_seconds,
    longest_pause_seconds: pauseMetrics.longest_pause_seconds,
    pause_ratio_percentage: roundMetric(pauseRatioPercentage),
    timing_source: "whisper_word_timestamps",
    asr_confidence: calculateAsrConfidenceSummary(timestampedWords),
  };
};

const buildFluencyMetricsPayload = (storedMetrics) => {
  if (!storedMetrics || typeof storedMetrics !== "object" || Array.isArray(storedMetrics)) {
    return null;
  }

  return {
    speech_duration_seconds: storedMetrics.speech_duration_seconds ?? null,
    audio_duration_seconds: storedMetrics.audio_duration_seconds ?? null,
    word_count: storedMetrics.word_count ?? null,
    words_per_second: storedMetrics.words_per_second ?? null,
    words_per_minute: storedMetrics.words_per_minute ?? null,
    pause_threshold_seconds: storedMetrics.pause_threshold_seconds ?? null,
    pause_count: storedMetrics.pause_count ?? null,
    total_pause_duration_seconds:
      storedMetrics.total_pause_duration_seconds ?? null,
    average_pause_duration_seconds:
      storedMetrics.average_pause_duration_seconds ?? null,
    longest_pause_seconds: storedMetrics.longest_pause_seconds ?? null,
    pause_ratio_percentage: storedMetrics.pause_ratio_percentage ?? null,
    timing_source: storedMetrics.timing_source ?? null,
  };
};

module.exports = {
  DEFAULT_PAUSE_THRESHOLD_SECONDS,
  getPauseThresholdSeconds,
  extractTimestampedWords,
  calculateSpeechTimingMetrics,
  buildFluencyMetricsPayload,
};
