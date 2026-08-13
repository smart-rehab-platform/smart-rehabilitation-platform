import { useCallback, useEffect, useRef, useState } from "react";
import {
  analyzeSpeechSubmission,
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

export function useSpecialistSpeechAnalysis(patientId, submissionId = null) {
  const [patientName, setPatientName] = useState("Patient");
  const [analyses, setAnalyses] = useState([]);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [progressItems, setProgressItems] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);
  const analyzingRef = useRef(false);

  const scopedSubmissionId =
    typeof submissionId === "string" && submissionId.trim()
      ? submissionId.trim()
      : null;
  const hasSubmissionContext = Boolean(scopedSubmissionId);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

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

      try {
        const bundle = await loadSpecialistSpeechAnalysisBundle(
          patientId,
          scopedSubmissionId,
        );
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setPatientName(bundle.patientName);
        setAnalyses(bundle.analyses);
        setLatestAnalysis(bundle.latestAnalysis);
        setProgressItems(bundle.progressItems);
        setSelectedAnalysis(bundle.selectedAnalysis);
        setComparison(buildSpeechComparison(bundle.selectedAnalysis, bundle.analyses));
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setAnalyses([]);
        setLatestAnalysis(null);
        setProgressItems([]);
        setSelectedAnalysis(null);
        setComparison(null);
        setError(resolveErrorMessage(loadError, "Failed to load speech analysis. Please try again."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadBundle();

    return () => {
      cancelled = true;
    };
  }, [patientId, scopedSubmissionId, refreshToken]);

  const selectAnalysis = useCallback((analysisId) => {
    const next = analyses.find((item) => item.id === analysisId) || null;
    if (!next) {
      return;
    }
    setSelectedAnalysis(next);
    setComparison(buildSpeechComparison(next, analyses));
    setError(null);
  }, [analyses]);

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
        setAnalyses(refreshed.analyses);
        setProgressItems(refreshed.progressItems);
        setLatestAnalysis(refreshed.latestAnalysis);
        setSelectedAnalysis(existing);
        setComparison(nextComparison);
        return { ok: true, message: "Existing speech analysis loaded." };
      }

      const analysis = await analyzeSpeechSubmission(scopedSubmissionId, {
        patientId,
        patientName,
      });
      const refreshed = await refreshSpeechAnalysisLists(patientId, analysis);
      const nextComparison = buildSpeechComparison(analysis, refreshed.analyses);
      setAnalyses(refreshed.analyses);
      setProgressItems(refreshed.progressItems);
      setLatestAnalysis(refreshed.latestAnalysis);
      setSelectedAnalysis(analysis);
      setComparison(nextComparison);
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
  }, [patientId, patientName, scopedSubmissionId]);

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

  return {
    patientId,
    submissionId: scopedSubmissionId,
    hasSubmissionContext,
    patientName,
    analyses,
    latestAnalysis,
    progressItems,
    selectedAnalysis,
    comparison,
    isLoading,
    isAnalyzing,
    error,
    reload,
    retry,
    selectAnalysis,
    analyzeSubmission,
  };
}
