import { ArrowLeft } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale";
import {
  buildSpecialistPatientDetailPath,
  SPECIALIST_WEB_ROUTES,
} from "../../routes/specialistDashboardRoutes";
import { SpecialistSpeechAcousticProgress } from "./components/SpecialistSpeechAcousticProgress";
import { SpecialistSpeechAiFeedback } from "./components/SpecialistSpeechAiFeedback";
import { SpecialistSpeechAnalysisHeader } from "./components/SpecialistSpeechAnalysisHeader";
import { SpecialistSpeechAnalysisQuality } from "./components/SpecialistSpeechAnalysisQuality";
import { SpecialistSpeechAnalyzeCard } from "./components/SpecialistSpeechAnalyzeCard";
import { SpecialistSpeechComparison } from "./components/SpecialistSpeechComparison";
import {
  SpecialistSpeechAudioPlayer,
  SpecialistSpeechExpectedVsSpoken,
} from "./components/SpecialistSpeechExpectedVsSpoken";
import { SpecialistSpeechHistory } from "./components/SpecialistSpeechHistory";
import { SpecialistSpeechPhonemeAnalysis } from "./components/SpecialistSpeechPhonemeAnalysis";
import {
  SpecialistSpeechAcousticDurationChart,
  SpecialistSpeechWordAccuracyChart,
} from "./components/SpecialistSpeechProgressCharts";
import { SpecialistSpeechProgressInsights } from "./components/SpecialistSpeechProgressInsights";
import { SpecialistSpeechScoreCards } from "./components/SpecialistSpeechScoreCards";
import { SpecialistSpeechTimingMetrics } from "./components/SpecialistSpeechTimingMetrics";
import { SpecialistSpeechTranscript } from "./components/SpecialistSpeechTranscript";
import { SpecialistSpeechTrend } from "./components/SpecialistSpeechTrend";
import { SpecialistSpeechWordAnalysis } from "./components/SpecialistSpeechWordAnalysis";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { useSpecialistSpeechAnalysis } from "./hooks/useSpecialistSpeechAnalysis";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import { getSpecialistSpeechAnalysisLabels } from "./utils/specialistSpeechAnalysisLocalization";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

function resolveToastMessage(message, labels) {
  if (message === "Existing speech analysis loaded.") {
    return labels.existingLoaded;
  }
  if (message === "Speech analysis completed successfully.") {
    return labels.completedSuccess;
  }
  return message;
}

export default function SpecialistSpeechAnalysisPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const submissionId = searchParams.get("submissionId");
  const { user, isInitializing } = useAuth();
  const { t } = useLocale();
  const labels = useMemo(() => getSpecialistSpeechAnalysisLabels(t), [t]);
  const specialistUserId = isInitializing ? null : user?.id ?? null;

  const {
    specialist,
    badges,
    sidebarCollapsed,
    mobileNavOpen,
    notificationsOpen,
    toast,
    navItems,
    notifications,
    isLoadingNotifications,
    notificationsError,
    unreadCount,
    setSidebarCollapsed,
    setMobileNavOpen,
    setNotificationsOpen,
    showToast,
    handleSignOut,
    handleViewProfile,
    handleMessages,
    handleViewAllNotifications,
    handleNotificationSelect,
    handleSidebarNav,
  } = useSpecialistShell(specialistUserId);

  const {
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
    retry,
    retryProgress,
    selectAnalysis,
    analyzeSubmission,
  } = useSpecialistSpeechAnalysis(patientId, submissionId);

  const handleBack = useCallback(() => {
    if (patientId) {
      navigate(buildSpecialistPatientDetailPath(patientId));
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(SPECIALIST_WEB_ROUTES.patients);
  }, [navigate, patientId]);

  const handleAnalyze = useCallback(async () => {
    const result = await analyzeSubmission();
    if (result.ok && result.message) {
      showToast(resolveToastMessage(result.message, labels));
    }
  }, [analyzeSubmission, labels, showToast]);

  const handleRetry = useCallback(async () => {
    const result = await retry();
    if (result?.ok && result.message) {
      showToast(resolveToastMessage(result.message, labels));
    }
  }, [labels, retry, showToast]);

  const busy = isAnalyzing || isLoading;
  const headerAnalyzedAt =
    selectedAnalysis?.analyzedAt || latestAnalysis?.analyzedAt || null;
  const chartHistoryPoints = progressInsights?.historyPoints || [];

  const renderContent = () => {
    if (isLoading && analyses.length === 0) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-loading">{labels.loading}</p>
        </section>
      );
    }

    if (error && analyses.length === 0 && !selectedAnalysis) {
      return (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={handleRetry}
            disabled={busy}
          >
            {labels.retry}
          </button>
        </section>
      );
    }

    return (
      <div className="pd-specialist-speech-stack">
        <SpecialistSpeechAnalysisHeader
          patientName={patientName}
          profileImageUrl={profileImageUrl}
          submissionId={hasSubmissionContext ? submissionId : null}
          analyzedAt={headerAnalyzedAt}
        />

        <div className="pd-specialist-speech-layout">
          <div className="pd-specialist-speech-main">
            {error ? (
              <div className="pd-card pd-card-pad pd-inline-error-card">
                <p className="pd-inline-error">{error}</p>
                <button
                  type="button"
                  className="pd-btn pd-btn-soft"
                  onClick={handleRetry}
                  disabled={busy}
                >
                  {labels.retry}
                </button>
              </div>
            ) : null}

            {!selectedAnalysis && analyses.length === 0 ? (
              <section className="pd-card pd-card-pad pd-task-hub-state">
                <p className="pd-section-sub">{labels.emptyResults}</p>
              </section>
            ) : null}

            {selectedAnalysis ? (
              <section className="pd-specialist-speech-summary">
                <h2 className="pd-specialist-speech-section-title">{labels.latestSummary}</h2>

                <SpecialistSpeechScoreCards
                  pronunciationScore={selectedAnalysis.pronunciationScore}
                  fluencyScore={selectedAnalysis.fluencyScore}
                  overallScore={selectedAnalysis.overallScore}
                />

                <SpecialistSpeechExpectedVsSpoken
                  expectedSpeech={selectedAnalysis.expectedSpeech}
                  transcript={selectedAnalysis.transcript}
                />

                <SpecialistSpeechAudioPlayer audioFileUrl={selectedAnalysis.audioFileUrl} />

                <SpecialistSpeechAnalysisQuality
                  analysisQuality={selectedAnalysis.analysisQuality}
                />

                <SpecialistSpeechWordAnalysis
                  expectedSpeech={selectedAnalysis.expectedSpeech}
                  wordAnalysis={selectedAnalysis.wordAnalysis}
                  transcript={selectedAnalysis.transcript}
                />

                <div className="pd-specialist-speech-mid-grid">
                  <SpecialistSpeechTranscript
                    transcript={selectedAnalysis.transcript}
                    language={selectedAnalysis.language}
                    durationSeconds={selectedAnalysis.durationSeconds}
                  />
                  <SpecialistSpeechComparison comparison={comparison} />
                </div>

                <SpecialistSpeechTimingMetrics
                  fluencyMetrics={selectedAnalysis.fluencyMetrics}
                  asrConfidence={selectedAnalysis.asrConfidence}
                />

                <SpecialistSpeechPhonemeAnalysis
                  phonemeAnalysis={selectedAnalysis.phonemeAnalysis}
                />

                <SpecialistSpeechProgressInsights
                  insights={progressInsights}
                  isLoading={isProgressLoading}
                  error={progressError}
                  onRetry={retryProgress}
                />

                <SpecialistSpeechAcousticProgress acousticProgress={acousticProgress} />

                <SpecialistSpeechAiFeedback feedback={selectedAnalysis.aiFeedback} />

                <div className="pd-specialist-speech-charts-grid">
                  <SpecialistSpeechWordAccuracyChart historyPoints={chartHistoryPoints} />
                  <SpecialistSpeechAcousticDurationChart
                    historyPoints={acousticProgress?.historyPoints || []}
                  />
                </div>

                <SpecialistSpeechTrend progressItems={progressItems} />
              </section>
            ) : null}
          </div>

          <aside className="pd-specialist-speech-sidebar">
            {hasSubmissionContext ? (
              <SpecialistSpeechAnalyzeCard
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyze}
              />
            ) : null}
            <SpecialistSpeechHistory
              analyses={analyses}
              selectedId={selectedAnalysis?.id}
              onSelect={selectAnalysis}
            />
          </aside>
        </div>
      </div>
    );
  };

  return (
    <div className="pd-preview">
      <SpecialistDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={navItems}
        badges={badges}
        user={specialist}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        notificationsLoading={isLoadingNotifications}
        notificationsError={notificationsError}
        notificationBadgeCount={unreadCount}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={handleSidebarNav}
        onSignOut={handleSignOut}
        onViewProfile={handleViewProfile}
        onMessages={handleMessages}
        onViewAllNotifications={handleViewAllNotifications}
        onNotificationSelect={handleNotificationSelect}
        showToast={showToast}
      >
        <div className="pd-task-hub-page pd-specialist-speech-shell">
          <div className="pd-task-hub-panel pd-specialist-speech-page">
            <header className="pd-specialist-treatment-plan-page-header">
              <button
                type="button"
                className="pd-specialist-back-btn"
                onClick={handleBack}
              >
                <ArrowLeft size={18} aria-hidden="true" />
                {labels.backToPatient}
              </button>
              <h1 className="pd-section-title">{labels.pageTitle}</h1>
            </header>
            {renderContent()}
          </div>
        </div>
      </SpecialistDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
