const fs = require("fs/promises");
const path = require("path");

const FASTER_WHISPER_ENGINE = "faster-whisper";
const DEFAULT_TIMEOUT_MS = 120000;

const getTimeoutMs = () => {
  const parsed = Number(process.env.FASTER_WHISPER_TIMEOUT_MS);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_TIMEOUT_MS;
};

const backendRoot = path.resolve(__dirname, "..", "..");
const workspaceRoot = path.resolve(backendRoot, "..");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getConfiguredEngine = () => (process.env.WHISPER_ENGINE || "").trim();

const getApiUrl = () => (process.env.FASTER_WHISPER_API_URL || "").trim();

const isConfigured = () =>
  getConfiguredEngine() === FASTER_WHISPER_ENGINE && Boolean(getApiUrl());

const getAudioMimeType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".m4a":
      return "audio/mp4";
    case ".ogg":
      return "audio/ogg";
    case ".webm":
      return "audio/webm";
    case ".flac":
      return "audio/flac";
    default:
      return "application/octet-stream";
  }
};

const resolveAudioPath = async (audioFilePath) => {
  if (typeof audioFilePath !== "string" || !audioFilePath.trim()) {
    throw createError("audioFilePath is required", 400);
  }

  const normalizedInput = audioFilePath.trim();
  const candidates = path.isAbsolute(normalizedInput)
    ? [normalizedInput]
    : [
        path.resolve(process.cwd(), normalizedInput),
        path.resolve(backendRoot, normalizedInput),
        path.resolve(workspaceRoot, normalizedInput)
      ];

  const uniqueCandidates = [...new Set(candidates)];

  for (const candidate of uniqueCandidates) {
    try {
      const stats = await fs.stat(candidate);

      if (stats.isFile()) {
        return candidate;
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw createError(
          `Unable to access audio file: ${error.message}`,
          500
        );
      }
    }
  }

  throw createError(`Audio file not found: ${normalizedInput}`, 404);
};

const parseJsonResponse = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    throw createError("Invalid response from Faster-Whisper service", 502);
  }
};

const validateTranscriptionResponse = (payload) => {
  if (
    !payload ||
    payload.success !== true ||
    typeof payload.transcript !== "string" ||
    typeof payload.language !== "string" ||
    typeof payload.duration !== "number" ||
    Number.isNaN(payload.duration)
  ) {
    throw createError("Invalid response from Faster-Whisper service", 502);
  }

  return {
    transcript: payload.transcript,
    language: payload.language,
    duration: payload.duration
  };
};

const transcribeAudio = async (audioFilePath) => {
  if (getConfiguredEngine() !== FASTER_WHISPER_ENGINE) {
    throw createError(
      "Faster-Whisper is not enabled. Set WHISPER_ENGINE=faster-whisper",
      503
    );
  }

  const apiUrl = getApiUrl();
  if (!apiUrl) {
    throw createError("FASTER_WHISPER_API_URL is not configured", 503);
  }

  if (
    typeof fetch !== "function" ||
    typeof FormData !== "function" ||
    typeof Blob !== "function"
  ) {
    throw createError(
      "Current Node.js runtime does not support fetch/FormData/Blob",
      500
    );
  }

  const resolvedAudioPath = await resolveAudioPath(audioFilePath);
  const audioBuffer = await fs.readFile(resolvedAudioPath);
  const formData = new FormData();
  const audioBlob = new Blob([audioBuffer], {
    type: getAudioMimeType(resolvedAudioPath)
  });

  formData.append("audio", audioBlob, path.basename(resolvedAudioPath));

  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => {
    abortController.abort();
  }, getTimeoutMs());

  let response;

  try {
    response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      signal: abortController.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw createError("Faster-Whisper service timed out", 504);
    }

    throw createError(
      `Faster-Whisper service unavailable: ${error.message}`,
      503
    );
  } finally {
    clearTimeout(timeoutHandle);
  }

  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    const downstreamMessage =
      payload.message ||
      payload.error ||
      `Faster-Whisper service returned status ${response.status}`;
    console.error("[faster-whisper] downstream failure:", {
      status: response.status,
      apiUrl,
      message: downstreamMessage,
    });
    const mappedStatus =
      response.status === 404
        ? 502
        : response.status >= 500
          ? 502
          : response.status === 400 || response.status === 422
            ? 422
            : 502;
    const error = createError(downstreamMessage, mappedStatus);
    error.downstreamStatus = response.status;
    throw error;
  }

  return validateTranscriptionResponse(payload);
};

module.exports = {
  isConfigured,
  transcribeAudio
};
