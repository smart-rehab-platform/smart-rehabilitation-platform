/**
 * Speech Analysis V3.2.2 — Node bridge to isolated Parselmouth acoustic extraction.
 * Non-fatal. Does not assess pronunciation correctness.
 */

const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const DEFAULT_TIMEOUT_MS = 15000;
const workspaceRoot = path.resolve(__dirname, "..", "..", "..");
const defaultPython = path.join(
  workspaceRoot,
  "python_services",
  "acoustic_extraction",
  ".venv",
  "Scripts",
  "python.exe"
);
const defaultCli = path.join(
  workspaceRoot,
  "python_services",
  "acoustic_extraction",
  "acoustic_cli.py"
);

const getPythonExecutable = () =>
  (process.env.SPEECH_ACOUSTIC_PYTHON || defaultPython).trim();

const getCliPath = () =>
  (process.env.SPEECH_ACOUSTIC_CLI || defaultCli).trim();

const getTimeoutMs = () => {
  const parsed = Number(process.env.SPEECH_ACOUSTIC_TIMEOUT_MS);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_TIMEOUT_MS;
};

const runProcess = ({ executable, args, timeoutMs }) =>
  new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      windowsHide: true,
      cwd: path.dirname(getCliPath()),
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
        const timeoutError = new Error("Acoustic extraction timed out");
        timeoutError.code = "ETIMEDOUT";
        reject(timeoutError);
        return;
      }
      resolve({ code, stdout, stderr });
    });
  });

const parseJsonStdout = (stdout) => {
  const trimmed = String(stdout || "").trim();
  if (!trimmed) {
    const error = new Error("Empty acoustic extractor output");
    error.code = "MALFORMED_JSON";
    throw error;
  }
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const parseError = new Error("Malformed acoustic extractor JSON");
    parseError.code = "MALFORMED_JSON";
    throw parseError;
  }
};

const normalizeWarningList = (warnings) => {
  if (!Array.isArray(warnings)) {
    return [];
  }
  return warnings
    .map((warning) => {
      if (typeof warning === "string") {
        return { code: warning, message: warning };
      }
      if (warning && typeof warning === "object") {
        return {
          code: warning.code || "acoustic_warning",
          message: warning.message || warning.code || "acoustic_warning",
        };
      }
      return null;
    })
    .filter(Boolean);
};

const buildAcousticMeasurements = (result) => {
  if (!result || result.error || !result.acoustic_measurements) {
    const warning = result?.error
      ? {
          code: result.error.code || "acoustic_extraction_failed",
          message: result.error.message || "Acoustic extraction failed for this interval.",
        }
      : {
          code: "acoustic_extraction_failed",
          message: "Acoustic extraction did not return measurements for this interval.",
        };
    return {
      duration_ms: result?.duration_ms ?? null,
      mean_f0_hz: null,
      mean_intensity_db: null,
      mean_f1_hz: null,
      mean_f2_hz: null,
      quality: {
        status: "unavailable",
        warnings: normalizeWarningList(result?.quality?.warnings).concat([warning]),
      },
    };
  }

  const measurements = result.acoustic_measurements;
  return {
    duration_ms: result.duration_ms ?? measurements.duration_ms ?? null,
    mean_f0_hz: measurements.mean_f0_hz ?? null,
    mean_intensity_db: measurements.mean_intensity_db ?? null,
    mean_f1_hz: measurements.mean_f1_hz ?? null,
    mean_f2_hz: measurements.mean_f2_hz ?? null,
    quality: {
      status: result.quality?.status || "usable",
      warnings: normalizeWarningList(result.quality?.warnings),
    },
  };
};

const attachAcousticsToOccurrences = (occurrences, results) => {
  const resultList = Array.isArray(results) ? results : [];
  return (occurrences || []).map((occurrence, index) => ({
    ...occurrence,
    acoustic_measurements: buildAcousticMeasurements(resultList[index] || null),
  }));
};

const markOccurrencesUnavailable = (occurrences, warning) =>
  (occurrences || []).map((occurrence) => ({
    ...occurrence,
    acoustic_measurements: {
      duration_ms:
        occurrence.duration_seconds != null
          ? Number((occurrence.duration_seconds * 1000).toFixed(1))
          : null,
      mean_f0_hz: null,
      mean_intensity_db: null,
      mean_f1_hz: null,
      mean_f2_hz: null,
      quality: {
        status: "unavailable",
        warnings: [warning],
      },
    },
  }));

const extractOccurrenceAcoustics = async ({
  wavPath,
  occurrences,
  runProcessFn = runProcess,
} = {}) => {
  const started = Date.now();
  if (!Array.isArray(occurrences) || occurrences.length === 0) {
    return {
      occurrences: occurrences || [],
      timings: { acoustic_extraction_ms: 0, python_process_ms: 0 },
      warning: null,
    };
  }

  let requestPath = null;
  try {
    requestPath = path.join(
      os.tmpdir(),
      `smart-rehab-acoustic-${Date.now()}-${Math.random().toString(16).slice(2)}.json`
    );
    const request = {
      audio_path: wavPath,
      intervals: occurrences.map((occurrence) => ({
        phone: occurrence.phone,
        start_seconds: occurrence.start,
        end_seconds: occurrence.end,
      })),
    };
    await fs.writeFile(requestPath, JSON.stringify(request), "utf8");

    const pythonStarted = Date.now();
    const result = await runProcessFn({
      executable: getPythonExecutable(),
      args: [getCliPath(), "--request", requestPath],
      timeoutMs: getTimeoutMs(),
    });
    const pythonProcessMs = Date.now() - pythonStarted;

    const parsed = parseJsonStdout(result.stdout);
    if (parsed.error && (!Array.isArray(parsed.results) || parsed.results.length === 0)) {
      throw Object.assign(new Error(parsed.error.message || "Acoustic extraction failed"), {
        code: parsed.error.code || "ACOUSTIC_FAILED",
      });
    }

    return {
      occurrences: attachAcousticsToOccurrences(occurrences, parsed.results || []),
      timings: {
        acoustic_extraction_ms: Date.now() - started,
        python_process_ms: pythonProcessMs,
        audio_load_ms: parsed.runtime?.audio_load_ms ?? null,
      },
      warning: null,
    };
  } catch (error) {
    const code =
      error.code === "ETIMEDOUT"
        ? "acoustic_timeout"
        : error.code === "MALFORMED_JSON"
          ? "acoustic_malformed_json"
          : error.code === "ENOENT"
            ? "acoustic_python_unavailable"
            : "acoustic_extraction_failed";
    const warning = {
      code,
      message:
        code === "acoustic_timeout"
          ? "Acoustic extraction timed out."
          : code === "acoustic_malformed_json"
            ? "Acoustic extractor returned malformed JSON."
            : code === "acoustic_python_unavailable"
              ? "Acoustic extraction Python environment is unavailable."
              : `Acoustic extraction failed: ${error.message}`,
    };
    return {
      occurrences: markOccurrencesUnavailable(occurrences, warning),
      timings: {
        acoustic_extraction_ms: Date.now() - started,
        python_process_ms: null,
      },
      warning,
    };
  } finally {
    if (requestPath) {
      try {
        await fs.unlink(requestPath);
      } catch (_) {
        // Ignore cleanup failures.
      }
    }
  }
};

module.exports = {
  DEFAULT_TIMEOUT_MS,
  getPythonExecutable,
  getCliPath,
  getTimeoutMs,
  parseJsonStdout,
  buildAcousticMeasurements,
  attachAcousticsToOccurrences,
  markOccurrencesUnavailable,
  extractOccurrenceAcoustics,
};
