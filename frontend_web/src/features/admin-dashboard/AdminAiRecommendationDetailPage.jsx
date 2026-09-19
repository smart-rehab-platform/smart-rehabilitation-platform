import { ArrowLeft, Lightbulb } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useLocale } from "../../context/useLocale";
import { ADMIN_WEB_ROUTES } from "../../routes/adminDashboardRoutes";
import { loadAdminRecommendationDetails } from "../../services/adminAiCenterService";
import { mapAiRecommendationItem } from "../specialist-dashboard/utils/specialistAiRecommendationMappers";
import { AdminAiStatusBadge } from "./components/AdminAiStatusBadge";
import { useAdminShell } from "./hooks/useAdminShell";
import { AdminDashboardShell } from "./layout/AdminDashboardShell";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/adminDashboardSections.css";
import "./styles/adminAiCenterSections.css";

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

function getStatusTone(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  switch (normalized) {
    case "accepted":
    case "approved":
    case "completed":
      return "success";
    case "rejected":
      return "danger";
    default:
      return "warning";
  }
}

function formatTypeLabel(type) {
  const normalized = typeof type === "string" ? type.trim().toLowerCase() : "";
  switch (normalized) {
    case "exercise_suggestion": return "Exercise Suggestion";
    case "plan_adjustment": return "Plan Adjustment";
    default: return (typeof type === "string" && type.trim()) || "Recommendation";
  }
}

function joinList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return items
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }
      if (item && typeof item === "object") {
        return item.displayLine || item.title || item.name || "";
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
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

export default function AdminAiRecommendationDetailPage() {
  const navigate = useNavigate();
  const { recommendationId } = useParams();
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

  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadTokenRef = useRef(0);

  useEffect(() => {
    if (!recommendationId) {
      setIsLoading(false);
      setError("Invalid recommendation ID.");
      return;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    loadAdminRecommendationDetails(recommendationId)
      .then((data) => {
        if (cancelled || loadTokenRef.current !== loadToken) return;
        if (!data) {
          setError("Recommendation not found.");
        } else {
          setRecommendation(data);
        }
      })
      .catch((err) => {
        if (cancelled || loadTokenRef.current !== loadToken) return;
        setError(err instanceof Error ? err.message : "Failed to load recommendation.");
      })
      .finally(() => {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [recommendationId]);

  const handleBack = useCallback(() => {
    navigate(ADMIN_WEB_ROUTES.aiCenter);
  }, [navigate]);

  const mapped = useMemo(
    () => (recommendation ? mapAiRecommendationItem(recommendation) : null),
    [recommendation],
  );

  const typeLabel = useMemo(() => {
    if (mapped?.type && typeof mapped.type === "object" && mapped.type.label) {
      return mapped.type.label;
    }
    return formatTypeLabel(
      typeof mapped?.type === "string" ? mapped.type : recommendation?.type,
    );
  }, [mapped?.type, recommendation?.type]);

  const statusMeta = useMemo(() => {
    if (mapped?.status && typeof mapped.status === "object") {
      return mapped.status;
    }
    const rawStatus = typeof mapped?.status === "string"
      ? mapped.status
      : (recommendation?.status ?? null);
    return {
      id: rawStatus,
      label: rawStatus
        ? `${rawStatus.charAt(0).toUpperCase()}${rawStatus.slice(1)}`
        : null,
      tone: getStatusTone(rawStatus),
    };
  }, [mapped?.status, recommendation?.status]);

  const statusTone = statusMeta.tone || getStatusTone(statusMeta.id);
  const statusLabel = statusMeta.label;
  const generatedAt = formatDate(
    mapped?.generatedAt ?? recommendation?.generated_at ?? recommendation?.generatedAt,
    locale,
  );
  const reviewedAt = formatDate(recommendation?.reviewed_at ?? recommendation?.reviewedAt, locale);
  const patientName = recommendation?.patient_name ?? recommendation?.patientName ?? null;
  const details = mapped?.details ?? {};
  const content = details.summary
    || details.clinicalReasoning
    || recommendation?.content
    || null;
  const reasoning = details.clinicalAnalysis
    || details.clinicalReasoning
    || recommendation?.reasoning
    || null;
  const suggestedExercises = joinList(details.suggestedExercises);
  const planAdjustments = joinList(details.planAdjustments);

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

          {!isLoading && recommendation && (
            <>
              <section className="pd-card pd-card-pad pd-admin-ai-detail-hero pd-section-enter" aria-label="Recommendation overview">
                <div className="pd-admin-ai-detail-hero-icon pd-admin-ai-row-icon-teal" aria-hidden="true">
                  <Lightbulb size={24} strokeWidth={2} />
                </div>
                <div className="pd-admin-ai-detail-hero-copy">
                  <h1 className="pd-section-title">{typeLabel}</h1>
                  {patientName && (
                    <p className="pd-section-sub" dir="auto">{patientName}</p>
                  )}
                  <div className="pd-admin-ai-detail-meta-row">
                    <span className="pd-admin-ai-detail-meta">Generated {generatedAt}</span>
                    {statusLabel && (
                      <AdminAiStatusBadge label={statusLabel} tone={statusTone} />
                    )}
                  </div>
                </div>
              </section>

              <div className="pd-admin-ai-detail-grid">
                <div className="pd-admin-ai-detail-main">
                  {content && (
                    <section className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter" aria-label="Recommendation content">
                      <h2 className="pd-admin-report-section-title">Recommendation</h2>
                      <p className="pd-admin-report-summary-body" dir="auto">{content}</p>
                    </section>
                  )}

                  {reasoning && reasoning !== content && (
                    <section className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter" aria-label="Reasoning">
                      <h2 className="pd-admin-report-section-title">Clinical Analysis</h2>
                      <p className="pd-admin-report-summary-body" dir="auto">{reasoning}</p>
                    </section>
                  )}

                  {suggestedExercises && (
                    <section className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter" aria-label="Suggested exercises">
                      <h2 className="pd-admin-report-section-title">Suggested Exercises</h2>
                      <p className="pd-admin-report-summary-body" dir="auto" style={{ whiteSpace: "pre-line" }}>
                        {suggestedExercises}
                      </p>
                    </section>
                  )}

                  {planAdjustments && (
                    <section className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter" aria-label="Plan adjustments">
                      <h2 className="pd-admin-report-section-title">Plan Adjustments</h2>
                      <p className="pd-admin-report-summary-body" dir="auto" style={{ whiteSpace: "pre-line" }}>
                        {planAdjustments}
                      </p>
                    </section>
                  )}
                </div>

                <div className="pd-admin-ai-detail-side">
                  <section className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter" aria-label="Details">
                    <h2 className="pd-admin-report-section-title">Details</h2>
                    <div className="pd-admin-ai-detail-rows">
                      <DetailRow label="ID" value={recommendation.id} />
                      <DetailRow label="Patient" value={patientName} />
                      <DetailRow label="Type" value={typeLabel} />
                      <DetailRow label="Status" value={statusLabel} />
                      <DetailRow label="Generated" value={generatedAt} />
                      {recommendation.reviewed_at && (
                        <DetailRow label="Reviewed" value={reviewedAt} />
                      )}
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
