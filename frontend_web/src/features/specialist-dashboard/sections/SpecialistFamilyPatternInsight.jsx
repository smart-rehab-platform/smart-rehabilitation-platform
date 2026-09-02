import { useMemo, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import familyRestroomIcon from "../../../assets/icons/family_restroom.svg";
import neurologyIcon from "../../../assets/icons/neurology.svg";
import { getVisibleFamilyPatternDetailGroups } from "../utils/specialistPatientMappers.js";
import {
  FAMILY_PATTERN_DISCLAIMER_EN,
  localizeFamilyPatternDisclaimer,
  localizedFamilyPatternEvidenceLevel,
  localizedFamilyPatternHiddenMatchesNotice,
  localizedFamilyPatternMatchedChildrenLabel,
  localizedFamilyPatternMatchedValue,
  localizedFamilyPatternScoreCaption,
  localizedFamilyPatternType,
} from "../utils/specialistPatientsLocalization.js";

const VISIBLE_PATTERN_COUNT = 3;

const KEYWORD_PATTERN_TYPES = new Set([
  "shared_difficulties",
  "previous_diagnosis_similarity",
  "family_history_similarity",
]);

function FamilyPatternSectionTitle({ title }) {
  return (
    <h2 className="pd-section-title pd-specialist-family-pattern-title">
      <img
        src={familyRestroomIcon}
        alt=""
        aria-hidden="true"
        className="pd-platform-icon pd-specialist-family-pattern-title-icon"
      />
      {title}
    </h2>
  );
}

function ClinicalSummaryPanel({ label, children }) {
  return (
    <div className="pd-specialist-family-pattern-summary-panel">
      <div className="pd-specialist-family-pattern-summary-head">
        <img
          src={neurologyIcon}
          alt=""
          aria-hidden="true"
          className="pd-platform-icon pd-specialist-family-pattern-summary-icon"
        />
        <span className="pd-specialist-family-pattern-summary-label">{label}</span>
      </div>
      {children}
    </div>
  );
}

function EvidenceBadge({ level, t }) {
  if (!level) {
    return null;
  }

  const normalized = level.trim().toUpperCase();
  const toneClass = normalized === "HIGH"
    ? "is-high"
    : normalized === "MODERATE"
      ? "is-moderate"
      : "is-low";

  return (
    <span className={`pd-specialist-family-pattern-evidence-badge ${toneClass}`}>
      {localizedFamilyPatternEvidenceLevel(t, level)}
    </span>
  );
}

function PatternKeywordChips({ keywords }) {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return null;
  }

  return (
    <div className="pd-specialist-family-pattern-chip-list">
      {keywords.map((keyword) => (
        <span key={keyword} className="pd-specialist-family-pattern-chip" dir="auto">
          {keyword}
        </span>
      ))}
    </div>
  );
}

function getPatternDisplayValue(pattern) {
  switch (pattern.type) {
    case "shared_diagnosis":
      return pattern.condition || null;
    case "shared_case_category":
      return pattern.category || null;
    default:
      return null;
  }
}

function shouldUseKeywordChips(pattern) {
  return KEYWORD_PATTERN_TYPES.has(pattern.type) && pattern.overlappingKeywords?.length > 0;
}

function PatternScoreMeter({ score, evidenceLevel, t }) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
  const scoreCaption = localizedFamilyPatternScoreCaption(t, evidenceLevel);

  return (
    <div className="pd-specialist-family-pattern-score">
      <div className="pd-specialist-family-pattern-score-head">
        <span className="pd-specialist-family-pattern-score-label">
          {t("specialist.patientDetails.familyPattern.patternScore")}
        </span>
        <span className="pd-specialist-family-pattern-score-value">
          {t("specialist.patientDetails.familyPattern.scoreOutOf", { score: safeScore })}
        </span>
      </div>
      <div
        className="pd-progress-track pd-specialist-family-pattern-score-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeScore}
        aria-label={`${t("specialist.patientDetails.familyPattern.patternScore")} ${safeScore} / 100. ${scoreCaption}`}
      >
        <div
          className="pd-progress-fill pd-progress-fill-cyan"
          style={{ width: `${safeScore}%` }}
        />
      </div>
      <p className="pd-specialist-family-pattern-score-caption" dir="auto">{scoreCaption}</p>
    </div>
  );
}

function MatchedChildrenBadge({ count, t }) {
  if (!count || count <= 0) {
    return null;
  }

  return (
    <div className="pd-specialist-family-pattern-matched-badge-wrap">
      <span className="pd-specialist-family-pattern-matched-badge">
        {localizedFamilyPatternMatchedChildrenLabel(t, count)}
      </span>
      <p className="pd-specialist-family-pattern-matched-caption">
        {t("specialist.patientDetails.familyPattern.matchedAtLeastOne")}
      </p>
    </div>
  );
}

function SummaryPatternRow({ pattern, t }) {
  const typeLabel = localizedFamilyPatternType(t, pattern.type);
  const displayValue = getPatternDisplayValue(pattern);
  const useKeywordChips = shouldUseKeywordChips(pattern);

  return (
    <li className="pd-specialist-family-pattern-pattern-row">
      <strong dir="auto">{typeLabel}</strong>
      {displayValue ? (
        <span className="pd-specialist-family-pattern-pattern-value" dir="auto">{displayValue}</span>
      ) : null}
      {useKeywordChips ? (
        <PatternKeywordChips keywords={pattern.overlappingKeywords} />
      ) : null}
      {pattern.reason ? (
        <p className="pd-specialist-family-pattern-pattern-reason" dir="auto">{pattern.reason}</p>
      ) : null}
    </li>
  );
}

function DetailsGroupSection({ group, t }) {
  const typeLabel = localizedFamilyPatternType(t, group.type);
  const value = group.condition || group.category;

  return (
    <div className="pd-specialist-pattern-group">
      <h3 dir="auto">{typeLabel}</h3>
      {group.reason ? (
        <p className="pd-specialist-family-pattern-group-reason" dir="auto">{group.reason}</p>
      ) : null}
      {value ? (
        <p className="pd-specialist-family-pattern-group-value" dir="auto">{value}</p>
      ) : null}
      {group.overlappingKeywords?.length > 0 ? (
        <div className="pd-specialist-family-pattern-shared-terms">
          <span>{t("specialist.patientDetails.familyPattern.sharedTerms")}</span>
          <PatternKeywordChips keywords={group.overlappingKeywords} />
        </div>
      ) : null}
      <ul className="pd-specialist-family-pattern-child-list">
        {group.children.map((child) => (
          <li key={child.patientId || child.patientName}>
            <strong dir="auto">{child.patientName}</strong>
            {child.matchedValue ? (
              <p className="pd-specialist-family-pattern-child-value" dir="auto">
                {localizedFamilyPatternMatchedValue(t, child.matchedValue)}
              </p>
            ) : null}
            {child.matchedKeywords?.length > 0 ? (
              <PatternKeywordChips keywords={child.matchedKeywords} />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HiddenMatchesNotice({ count, t }) {
  if (!count || count <= 0) {
    return null;
  }

  return (
    <div className="pd-specialist-family-pattern-hidden-notice" role="note">
      <p dir="auto">{localizedFamilyPatternHiddenMatchesNotice(t, count)}</p>
    </div>
  );
}

export function SpecialistFamilyPatternInsight({
  insight,
  isLoading,
  error,
  details,
  onRetry,
  onOpenDetails,
}) {
  const { t } = useLocale();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showAllFindings, setShowAllFindings] = useState(false);
  const sectionTitle = t("specialist.patientDetails.familyPatternInsight");

  const visiblePatterns = useMemo(() => {
    if (!insight?.patterns?.length) {
      return [];
    }
    const hasHiddenPatterns = insight.patterns.length > VISIBLE_PATTERN_COUNT;
    if (!showAllFindings && hasHiddenPatterns) {
      return insight.patterns.slice(0, VISIBLE_PATTERN_COUNT);
    }
    return insight.patterns;
  }, [insight, showAllFindings]);

  const visibleDetailGroups = useMemo(
    () => getVisibleFamilyPatternDetailGroups(details),
    [details],
  );

  if (isLoading) {
    return (
      <section className="pd-specialist-patient-section">
        <FamilyPatternSectionTitle title={sectionTitle} />
        <div className="pd-card pd-card-pad pd-specialist-family-pattern-card">
          <p className="pd-inline-loading">{t("specialist.patientDetails.loadingFamilyPattern")}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pd-specialist-patient-section">
        <FamilyPatternSectionTitle title={sectionTitle} />
        <div className="pd-card pd-card-pad pd-specialist-family-pattern-card">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
            {t("common.retry")}
          </button>
        </div>
      </section>
    );
  }

  if (!insight || !insight.hasSiblings) {
    return null;
  }

  const handleOpenDetails = async () => {
    await onOpenDetails?.();
    setIsDetailsOpen(true);
  };

  const summaryText = insight.hasDetectedPatterns
    ? (insight.summaryReason || "")
    : t("specialist.patientDetails.familyPatternNeutralSummary");

  const disclaimerText = localizeFamilyPatternDisclaimer(insight.disclaimer, t);
  const isKnownDisclaimer = insight.disclaimer?.trim() === FAMILY_PATTERN_DISCLAIMER_EN;
  const hasHiddenPatterns = insight.patterns.length > VISIBLE_PATTERN_COUNT;
  const detailsDisclaimer = details?.disclaimer
    ? localizeFamilyPatternDisclaimer(details.disclaimer, t)
    : null;
  const detailsIsKnownDisclaimer = details?.disclaimer?.trim() === FAMILY_PATTERN_DISCLAIMER_EN;
  const detailsEvidenceLevel = details?.evidenceLevel || insight.evidenceLevel;
  const detailsPatternScore = details?.patternScore ?? insight.patternScore ?? 0;

  return (
    <section className="pd-specialist-patient-section">
      <FamilyPatternSectionTitle title={sectionTitle} />
      <div className="pd-card pd-card-pad pd-specialist-family-pattern-card">
        {insight.hasDetectedPatterns ? (
          <div className="pd-specialist-family-pattern-meta">
            <EvidenceBadge level={insight.evidenceLevel} t={t} />
          </div>
        ) : null}

        <ClinicalSummaryPanel label={t("specialist.patientDetails.clinicalSummary")}>
          <p className="pd-specialist-family-pattern-summary-text" dir="auto">{summaryText}</p>
        </ClinicalSummaryPanel>

        {insight.hasDetectedPatterns ? (
          <div className="pd-specialist-family-pattern-findings">
            <PatternScoreMeter
              score={insight.patternScore}
              evidenceLevel={insight.evidenceLevel}
              t={t}
            />

            <MatchedChildrenBadge count={insight.matchedChildren} t={t} />

            {visiblePatterns.length > 0 ? (
              <ul className="pd-specialist-pattern-list">
                {visiblePatterns.map((pattern) => (
                  <SummaryPatternRow
                    key={`${pattern.type}-${pattern.reason}-${pattern.condition || pattern.category || ""}`}
                    pattern={pattern}
                    t={t}
                  />
                ))}
              </ul>
            ) : null}

            {hasHiddenPatterns ? (
              <button
                type="button"
                className="pd-specialist-family-pattern-toggle"
                onClick={() => setShowAllFindings((current) => !current)}
              >
                {showAllFindings
                  ? t("specialist.patientDetails.familyPattern.showFewerFindings")
                  : t("specialist.patientDetails.familyPattern.viewAllFindings")}
              </button>
            ) : null}

            {insight.matchedChildren > 0 ? (
              <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={handleOpenDetails}>
                {t("specialist.patientDetails.reviewMatchedChildren")}
              </button>
            ) : null}
          </div>
        ) : null}

        {disclaimerText ? (
          <p
            className="pd-specialist-pattern-disclaimer"
            dir={isKnownDisclaimer ? undefined : "auto"}
          >
            {disclaimerText}
          </p>
        ) : null}
      </div>

      {isDetailsOpen && details ? (
        <div className="pd-modal-backdrop" role="presentation" onClick={() => setIsDetailsOpen(false)}>
          <div
            className="pd-modal pd-specialist-family-pattern-details"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="pd-modal-title">{t("specialist.patientDetails.matchedChildren")}</h2>
            <p className="pd-specialist-family-pattern-details-subtitle">
              {t("specialist.patientDetails.familyPattern.detailsSubtitle")}
            </p>

            <div className="pd-specialist-family-pattern-details-meta">
              <EvidenceBadge level={detailsEvidenceLevel} t={t} />
              <span className="pd-specialist-family-pattern-score-value">
                {t("specialist.patientDetails.familyPattern.scoreOutOf", { score: detailsPatternScore })}
              </span>
            </div>

            {details.hiddenMatchedChildrenCount > 0 ? (
              <HiddenMatchesNotice count={details.hiddenMatchedChildrenCount} t={t} />
            ) : null}

            {visibleDetailGroups.length === 0 ? (
              details.hiddenMatchedChildrenCount > 0 ? null : (
                <p className="pd-section-sub">
                  {t("specialist.patientDetails.familyPattern.noDetailedMatches")}
                </p>
              )
            ) : (
              visibleDetailGroups.map((group) => (
                <DetailsGroupSection
                  key={`${group.type}-${group.reason || ""}-${group.condition || group.category || ""}`}
                  group={group}
                  t={t}
                />
              ))
            )}

            {detailsDisclaimer ? (
              <p
                className="pd-specialist-pattern-disclaimer"
                dir={detailsIsKnownDisclaimer ? undefined : "auto"}
              >
                {detailsDisclaimer}
              </p>
            ) : null}

            <div className="pd-modal-actions">
              <button type="button" className="pd-btn pd-btn-primary" onClick={() => setIsDetailsOpen(false)}>
                {t("specialist.patientDetails.close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
