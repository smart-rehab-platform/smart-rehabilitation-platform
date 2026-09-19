import { ArrowLeft, AudioLines } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocale } from "../../context/useLocale";
import { ADMIN_WEB_ROUTES } from "../../routes/adminDashboardRoutes";
import { loadAdminSpeechAnalysisDetails } from "../../services/adminAiCenterService";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminAiCenterSections.css";

function formatScore(value) {
  if (value == null) return "—";
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : "—";
}

function formatDate(value, locale) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function ScoreCard({ label, value }) {
  return (
    <div className="pd-admin-ai-score-card">
      <span className="pd-admin-ai-score-value">{value}</span>
      <span className="pd-admin-ai-score-label">{label}</span>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="pd-admin-ai-detail-row">
      <span className="pd-admin-ai-detail-label">{label}</span>
      <span className="pd-admin-ai-detail-value" dir="auto">{value}</span>
    </div>
  );
}

export default function AdminSpeechAnalysisDetailPage() {
  const navigate = useNavigate();
  const { analysisId } = useParams();
  const { locale } = useLocale();

  const {
    adminUser,
    badges,
    sidebarCollapsed,
    mobileNavOpen,
    notificationsOpen,
    toast,
    navItems,
    setSidebarCollapsed,
    setMobileNavOpen,
    setNotificationsOpen,
    showToast,
    handleSignOut,
    handleViewProfile,
    handleViewAllNotifications,
    handleSidebarNav,
  } = useAdminShell();

  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadTokenRef = useRef(0);

  useEffect(() => {
    if (!analysisId) {
      setIsLoading(false);
      setError("Invalid speech analysis ID.");
      return;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    loadAdminSpeechAnalysisDetails(analysisId)
      .then((data) => {
        if (cancelled || loadTokenRef.current !== loadToken) return;
        if (!data) {
          setError("Speech analysis not found.");
        } else {
          setAnalysis(data);
        }
      })
      .catch((err) => {
        if (cancelled || loadTokenRef.current !== loadToken) return;
        setError(err instanceof Error ? err.message : "Failed to load speech analysis.");
      })
      .finally(() => {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  const handleBack = useCallback(() => {
    navigate(ADMIN_WEB_ROUTES.aiCenter);
  }, [navigate]);

  const exerciseTitle = analysis?.exercise_title ?? analysis?.exerciseTitle ?? null;
  const expectedText = analysis?.exercise_expected_text ?? analysis?.exerciseExpectedText ?? null;
  const transcript = analysis?.transcript ?? null;
  const aiFeedback = analysis?.ai_feedback ?? analysis?.aiFeedback ?? null;
  const analyzedAt = formatDate(analysis?.analyzed_at ?? analysis?.analyzedAt, locale);

  return (
    <div className="pd-preview">
      <AdminDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={navItems}
        badges={badges}
        user={adminUser}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={handleSidebarNav}
        onSignOut={handleSignOut}
        onViewProfile={handleViewProfile}
        onViewAllNotifications={handleViewAllNotifications}
        showToast={showToast}
      >
        <div className="pd-admin-report-details pd-section-enter">
          <button
            type="button"
            className="pd-btn pd-btn-soft pd-admin-report-back"
            onClick={handleBack}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to AI Center
          </button>

          {isLoading && (
            <div className="pd-card pd-card-pad pd-admin-ai-detail-loading" aria-busy="true">
              <span className="pd-inline-loading" style={{ width: "40%" }} />
              <span className="pd-inline-loading" style={{ width: "60%", marginTop: "0.5rem" }} />
            </div>
          )}

          {!isLoading && error && (
            <div className="pd-card pd-card-pad pd-admin-ai-error">
              <p className="pd-inline-error">{error}</p>
            </div>
          )}

          {!isLoading && analysis && (
            <>
              <section className="pd-card pd-card-pad pd-admin-ai-detail-hero pd-section-enter" aria-label="Speech analysis overview">
                <div className="pd-admin-ai-detail-hero-icon pd-admin-ai-row-icon-blue" aria-hidden="true">
                  <AudioLines size={24} strokeWidth={2} />
                </div>
                <div className="pd-admin-ai-detail-hero-copy">
                  <h1 className="pd-section-title">Speech Analysis</h1>
                  {exerciseTitle && (
                    <p className="pd-section-sub" dir="auto">{exerciseTitle}</p>
                  )}
                  <p className="pd-admin-ai-detail-meta">Analyzed {analyzedAt}</p>
                </div>
              </section>

              <div className="pd-admin-ai-detail-grid">
                <div className="pd-admin-ai-detail-main">
                  <section className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter" aria-label="Scores">
                    <h2 className="pd-admin-report-section-title">Scores</h2>
                    <div className="pd-admin-ai-scores-row">
                      <ScoreCard label="Overall" value={formatScore(analysis.overall_score ?? analysis.overallScore)} />
                      <ScoreCard label="Pronunciation" value={formatScore(analysis.pronunciation_score ?? analysis.pronunciationScore)} />
                      <ScoreCard label="Fluency" value={formatScore(analysis.fluency_score ?? analysis.fluencyScore)} />
                    </div>
                  </section>

                  {aiFeedback && (
                    <section className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter" aria-label="AI feedback">
                      <h2 className="pd-admin-report-section-title">AI Feedback</h2>
                      <p className="pd-admin-report-summary-body" dir="auto">{aiFeedback}</p>
                    </section>
                  )}

                  {transcript && (
                    <section className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter" aria-label="Transcript">
                      <h2 className="pd-admin-report-section-title">Transcript</h2>
                      <p className="pd-admin-report-summary-body" dir="auto">{transcript}</p>
                    </section>
                  )}

                  {expectedText && (
                    <section className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter" aria-label="Expected text">
                      <h2 className="pd-admin-report-section-title">Expected Text</h2>
                      <p className="pd-admin-report-summary-body" dir="auto">{expectedText}</p>
                    </section>
                  )}
                </div>

                <div className="pd-admin-ai-detail-side">
                  <section className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter" aria-label="Details">
                    <h2 className="pd-admin-report-section-title">Details</h2>
                    <div className="pd-admin-ai-detail-rows">
                      <DetailRow label="Analysis ID" value={analysis.id} />
                      <DetailRow label="Analyzed" value={analyzedAt} />
                      <DetailRow label="Exercise" value={exerciseTitle} />
                      <DetailRow label="Language" value={analysis.language ?? analysis.exercise_language} />
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </AdminDashboardShell>

      {toast && (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
