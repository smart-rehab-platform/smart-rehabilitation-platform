import { useState } from "react";
import { useLocale } from "../../../context/useLocale";
import familyRestroomIcon from "../../../assets/icons/family_restroom.svg";
import neurologyIcon from "../../../assets/icons/neurology.svg";
import {
  FAMILY_PATTERN_DISCLAIMER_EN,
  localizeFamilyPatternDisclaimer,
} from "../utils/specialistPatientsLocalization.js";
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
  const sectionTitle = t("specialist.patientDetails.familyPatternInsight");

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

  return (    <section className="pd-specialist-patient-section">
      <FamilyPatternSectionTitle title={sectionTitle} />
      <div className="pd-card pd-card-pad pd-specialist-family-pattern-card">
        <ClinicalSummaryPanel label={t("specialist.patientDetails.clinicalSummary")}>
          <p className="pd-specialist-family-pattern-summary-text" dir="auto">{summaryText}</p>
        </ClinicalSummaryPanel>

        {insight.hasDetectedPatterns ? (
          <div className="pd-specialist-family-pattern-findings">
            {insight.evidenceLevel ? (
              <p className="pd-section-sub">
                {t("specialist.patientDetails.evidenceLevel", { level: insight.evidenceLevel })}
              </p>
            ) : null}
            {insight.patterns.length > 0 ? (
              <ul className="pd-specialist-pattern-list">
                {insight.patterns.map((pattern) => (
                  <li key={`${pattern.type}-${pattern.reason}`} dir="auto">
                    {pattern.condition || pattern.type}
                    {pattern.reason ? ` — ${pattern.reason}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
            <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={handleOpenDetails}>
              {t("specialist.patientDetails.reviewMatchedChildren")}
            </button>
          </div>
        ) : null}

        {disclaimerText ? (
          <p
            className="pd-specialist-pattern-disclaimer"
            dir={isKnownDisclaimer ? undefined : "auto"}
          >
            {disclaimerText}
          </p>
        ) : null}      </div>

      {isDetailsOpen && details ? (
        <div className="pd-modal-backdrop" role="presentation" onClick={() => setIsDetailsOpen(false)}>
          <div
            className="pd-modal pd-specialist-family-pattern-details"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="pd-modal-title">{t("specialist.patientDetails.matchedChildren")}</h2>
            {details.groups.length === 0 ? (
              <p className="pd-section-sub">{t("specialist.patientDetails.noMatchedChildrenDetails")}</p>
            ) : (
              details.groups.map((group) => (
                <div key={group.type || "group"} className="pd-specialist-pattern-group">
                  {group.type ? <h3 dir="auto">{group.type}</h3> : null}
                  <ul>
                    {group.children.map((child) => (
                      <li key={child.patientId || child.patientName}>
                        <strong dir="auto">{child.patientName}</strong>
                        {child.matchedValue ? (
                          <span dir="auto">{` — ${child.matchedValue}`}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
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
