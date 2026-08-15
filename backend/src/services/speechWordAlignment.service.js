/**
 * Deterministic expected-vs-spoken word alignment for Speech Analysis V2.1.
 * Uses word-level edit-distance dynamic programming (no AI).
 */

const PUNCTUATION_REGEX = /[^\p{L}\p{N}\s]/gu;

const normalizeSpeechText = (text) => {
  if (typeof text !== "string") {
    return "";
  }

  let normalized = text.trim().toLowerCase();
  normalized = normalized.replace(/\s+/g, " ");
  normalized = normalized.replace(PUNCTUATION_REGEX, " ");
  normalized = normalized.replace(/\s+/g, " ").trim();
  return normalized;
};

const tokenizeWords = (text) => {
  const normalized = normalizeSpeechText(text);
  if (!normalized) {
    return [];
  }

  return normalized.split(" ").filter(Boolean);
};

const hasMeaningfulExpectedText = (text) => tokenizeWords(text).length > 0;

const alignWordSequences = (expectedWords, detectedWords) => {
  const expectedCount = expectedWords.length;
  const detectedCount = detectedWords.length;

  const dp = Array.from({ length: expectedCount + 1 }, () =>
    Array(detectedCount + 1).fill(0)
  );
  const backtrack = Array.from({ length: expectedCount + 1 }, () =>
    Array(detectedCount + 1).fill(null)
  );

  for (let i = 1; i <= expectedCount; i += 1) {
    dp[i][0] = i;
    backtrack[i][0] = "delete";
  }

  for (let j = 1; j <= detectedCount; j += 1) {
    dp[0][j] = j;
    backtrack[0][j] = "insert";
  }

  for (let i = 1; i <= expectedCount; i += 1) {
    for (let j = 1; j <= detectedCount; j += 1) {
      const expectedWord = expectedWords[i - 1];
      const detectedWord = detectedWords[j - 1];

      if (expectedWord === detectedWord) {
        dp[i][j] = dp[i - 1][j - 1];
        backtrack[i][j] = "match";
        continue;
      }

      const substituteCost = dp[i - 1][j - 1] + 1;
      const deleteCost = dp[i - 1][j] + 1;
      const insertCost = dp[i][j - 1] + 1;
      const minCost = Math.min(substituteCost, deleteCost, insertCost);

      dp[i][j] = minCost;

      if (minCost === substituteCost) {
        backtrack[i][j] = "substitute";
      } else if (minCost === deleteCost) {
        backtrack[i][j] = "delete";
      } else {
        backtrack[i][j] = "insert";
      }
    }
  }

  const alignedWords = [];
  let i = expectedCount;
  let j = detectedCount;

  while (i > 0 || j > 0) {
    const operation =
      i > 0 && j > 0
        ? backtrack[i][j]
        : i > 0
          ? "delete"
          : "insert";

    if (
      i > 0 &&
      j > 0 &&
      (operation === "match" || operation === "substitute")
    ) {
      const expected = expectedWords[i - 1];
      const detected = detectedWords[j - 1];

      alignedWords.push({
        expected,
        detected,
        status: operation === "match" ? "correct" : "substitution",
      });

      i -= 1;
      j -= 1;
      continue;
    }

    if (i > 0 && (operation === "delete" || j === 0)) {
      alignedWords.push({
        expected: expectedWords[i - 1],
        detected: null,
        status: "omission",
      });
      i -= 1;
      continue;
    }

    alignedWords.push({
      expected: null,
      detected: detectedWords[j - 1],
      status: "insertion",
    });
    j -= 1;
  }

  alignedWords.reverse();
  return alignedWords;
};

const compareExpectedToTranscript = (expectedText, transcript) => {
  if (!hasMeaningfulExpectedText(expectedText)) {
    return null;
  }

  const expectedWords = tokenizeWords(expectedText);
  const detectedWords = tokenizeWords(transcript);
  const alignedWords = alignWordSequences(expectedWords, detectedWords);

  let correctWords = 0;
  let substitutions = 0;
  let omissions = 0;
  let insertions = 0;

  alignedWords.forEach((item) => {
    switch (item.status) {
      case "correct":
        correctWords += 1;
        break;
      case "substitution":
        substitutions += 1;
        break;
      case "omission":
        omissions += 1;
        break;
      case "insertion":
        insertions += 1;
        break;
      default:
        break;
    }
  });

  const expectedWordCount = expectedWords.length;
  const wordAccuracyPercentage =
    expectedWordCount > 0
      ? Number(((correctWords / expectedWordCount) * 100).toFixed(2))
      : null;

  return {
    word_accuracy_percentage: wordAccuracyPercentage,
    correct_words: correctWords,
    substitutions,
    omissions,
    insertions,
    expected_word_count: expectedWordCount,
    aligned_words: alignedWords,
  };
};

module.exports = {
  normalizeSpeechText,
  tokenizeWords,
  hasMeaningfulExpectedText,
  alignWordSequences,
  compareExpectedToTranscript,
};
