import { useCallback, useEffect, useRef, useState } from "react";
import {
  analyzeSpeechSubmission,
  fetchSpeechProgressBundleForAnalysis,
  fetchSubmissionSpeechAnalysis,
  friendlySpeechAnalysisError,
  loadSpecialistSpeechAnalysisBundle,
  refreshSpeechAnalysisLists,
} from "../../../services/specialistSpeechAnalysisService";
import { buildSpeechComparison } from "../utils/specialistSpeechAnalysisMappers";

function resolveErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function buildProgressRequestKey(patientId, analysis) {
  if (!patientId || !analysis?.id) {
    return "";
  }
  const scope = [
    analysis.exerciseId || "",
    analysis.expectedSpeech?.expectedText || "",
    analysis.phonemeAnalysis?.targetPhone?.requested ||
      analysis.expectedSpeech?.targetPhoneme ||
      "",
  ].join("|");
  return `${patientId}:${analysis.id}:${scope}`;
}

export function useSpecialistSpeechAnalysis(patientId, submissionId = null) {
  const [patientName, setPatientName] = useState("Patient");
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [progressItems, setProgressItems] = useState([]);
  const [progressInsights, setProgressInsights] = useState(null);
  const [acousticProgress, setAcousticProgress] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [progressError, setProgressError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);
  const analyzingRef = useRef(false);
  const progressRequestRef = useRef({ key: "", inFlight: false });
  const progressCacheRef = useRef(new Map());

  const scopedSubmissionId =
    typeof submissionId === "string" && submissionId.trim()
      ? submissionId.trim()
      : null;
  const hasSubmissionContext = Boolean(scopedSubmissionId);

  const reload = useCallback(() => {
    progressCacheRef.current.clear();
    setRefreshToken((value) => value + 1);
  }, []);

  const loadProgressBundle = useCallback(async (analysis, { force = false } = {}) => {
    if (!patientId || !analysis?.id) {
      setProgressInsights(null);
      setAcousticProgress(null);
      setProgressError(null);
      return;
    }

    const requestKey = buildProgressRequestKey(patientId, analysis);
    if (!force && progressCacheRef.current.has(requestKey)) {
      const cached = progressCacheRef.current.get(requestKey);
      setProgressInsights(cached.insights ?? analysis.progressInsights ?? null);
      setAcousticProgress(cached.acousticProgress ?? null);
      setProgressError(null);
      return;
    }

    if (progressRequestRef.current.inFlight && progressRequestRef.current.key === requestKey) {
      return;
    }

    progressRequestRef.current = { key: requestKey, inFlight: true };
    setIsProgressLoading(true);
    setProgressError(null);

    try {
      const bundle = await fetchSpeechProgressBundleForAnalysis(patientId, analysis);
      progressCacheRef.current.set(requestKey, bundle);
      setProgressInsights(bundle.insights ?? analysis.progressInsights ?? null);
      setAcousticProgress(bundle.acousticProgress ?? null);
    } catch (progressLoadError) {
      setProgressInsights(analysis.progressInsights ?? null);
      setAcousticProgress(null);
      setProgressError(
        resolveErrorMessage(
          progressLoadError,
          "Failed to load speech progress insights.",
        ),
      );
    } finally {
      progressRequestRef.current = { key: requestKey, inFlight: false };
      setIsProgressLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (!patientId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadBundle() {
      setIsLoading(true);
      setError(null);
      setProgressError(null);

      try {
        const bundle = await loadSpecialistSpeechAnalysisBundle(
          patientId,
          scopedSubmissionId,
        );
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setPatientName(bundle.patientName);
        setProfileImageUrl(bundle.profileImageUrl ?? null);
        setAnalyses(bundle.analyses);
        setLatestAnalysis(bundle.latestAnalysis);
        setProgressItems(bundle.progressItems);
        setSelectedAnalysis(bundle.selectedAnalysis);
        setComparison(buildSpeechComparison(bundle.selectedAnalysis, bundle.analyses));
        setIsLoading(false);

        if (bundle.selectedAnalysis) {
          await loadProgressBundle(bundle.selectedAnalysis);
        } else {
          setProgressInsights(null);
          setAcousticProgress(null);
        }
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setAnalyses([]);
        setLatestAnalysis(null);
        setProgressItems([]);
        setSelectedAnalysis(null);
        setComparison(null);
        setProgressInsights(null);
        setAcousticProgress(null);
        setError(resolveErrorMessage(loadError, "Failed to load speech analysis. Please try again."));
        setIsLoading(false);
      }
    }

    loadBundle();

    return () => {
      cancelled = true;
    };
  }, [patientId, scopedSubmissionId, refreshToken, loadProgressBundle]);

  const selectAnalysis = useCallback((analysisId) => {
    const next = analyses.find((item) => item.id === analysisId) || null;
    if (!next) {
      return;
    }
    setSelectedAnalysis(next);
    setComparison(buildSpeechComparison(next, analyses));
    setError(null);
    loadProgressBundle(next);
  }, [analyses, loadProgressBundle]);

  const analyzeSubmission = useCallback(async () => {
    if (!patientId) {
      return { ok: false, message: null };
    }
    if (!scopedSubmissionId) {
      setError("No submission selected for speech analysis.");
      return { ok: false, message: null };
    }
    if (analyzingRef.current) {
      return { ok: false, message: null };
    }

    analyzingRef.current = true;
    setIsAnalyzing(true);
    setError(null);

    try {
      const existing = await fetchSubmissionSpeechAnalysis(scopedSubmissionId, {
        patientId,
        patientName,
      });

      if (existing?.id) {
        const refreshed = await refreshSpeechAnalysisLists(patientId, existing);
        const nextComparison = buildSpeechComparison(existing, refreshed.analyses);
        progressCacheRef.current.clear();
        setAnalyses(refreshed.analyses);
        setProgressItems(refreshed.progressItems);
        setLatestAnalysis(refreshed.latestAnalysis);
        setSelectedAnalysis(existing);
        setComparison(nextComparison);
        await loadProgressBundle(existing, { force: true });
        return { ok: true, message: "Existing speech analysis loaded." };
      }

      const analysis = await analyzeSpeechSubmission(scopedSubmissionId, {
        patientId,
        patientName,
      });
      const refreshed = await refreshSpeechAnalysisLists(patientId, analysis);
      const nextComparison = buildSpeechComparison(analysis, refreshed.analyses);
      progressCacheRef.current.clear();
      setAnalyses(refreshed.analyses);
      setProgressItems(refreshed.progressItems);
      setLatestAnalysis(refreshed.latestAnalysis);
      setSelectedAnalysis(analysis);
      setComparison(nextComparison);
      await loadProgressBundle(analysis, { force: true });
      return { ok: true, message: "Speech analysis completed successfully." };
    } catch (analyzeError) {
      const message =
        analyzeError instanceof Error && analyzeError.message
          ? analyzeError.message
          : friendlySpeechAnalysisError(analyzeError, "analyze");
      setError(message);
      return { ok: false, message: null };
    } finally {
      analyzingRef.current = false;
      setIsAnalyzing(false);
    }
  }, [patientId, patientName, scopedSubmissionId, loadProgressBundle]);

  const retry = useCallback(async () => {
    if (isAnalyzing || isLoading) {
      return { ok: false, message: null };
    }
    if (hasSubmissionContext && error) {
      return analyzeSubmission();
    }
    reload();
    return { ok: true, message: null };
  }, [
    analyzeSubmission,
    error,
    hasSubmissionContext,
    isAnalyzing,
    isLoading,
    reload,
  ]);

  const retryProgress = useCallback(async () => {
    if (!selectedAnalysis) {
      return;
    }
    await loadProgressBundle(selectedAnalysis, { force: true });
  }, [loadProgressBundle, selectedAnalysis]);

  return {
    patientId,
    submissionId: scopedSubmissionId,
    hasSubmissionContext,
    patientName,
    profileImageUrl,
    analyses,
    latestAnalysis,
    progressItems,
    progressInsights,
    acousticProgress,
    selectedAnalysis,
    comparison,
    isLoading,
    isProgressLoading,
    isAnalyzing,
    error,
    progressError,
    reload,
    retry,
    retryProgress,
    selectAnalysis,
    analyzeSubmission,
  };
}
