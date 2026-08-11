import { useState } from "react";
import familyRestroomIcon from "../../../assets/icons/family_restroom.svg";
import neurologyIcon from "../../../assets/icons/neurology.svg";

const NEUTRAL_SUMMARY_MESSAGE =
  "No repeated clinical characteristics were detected in the available records.";

function FamilyPatternSectionTitle() {
  return (
    <h2 className="pd-section-title pd-specialist-family-pattern-title">
      <img
        src={familyRestroomIcon}
        alt=""
        aria-hidden="true"
        className="pd-platform-icon pd-specialist-family-pattern-title-icon"
      />
      Family Pattern Insight
    </h2>
  );
}

function ClinicalSummaryPanel({ children }) {
  return (
    <div className="pd-specialist-family-pattern-summary-panel">
      <div className="pd-specialist-family-pattern-summary-head">
        <img
          src={neurologyIcon}
          alt=""
          aria-hidden="true"
          className="pd-platform-icon pd-specialist-family-pattern-summary-icon"
        />
        <span className="pd-specialist-family-pattern-summary-label">Clinical Summary</span>
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (isLoading) {
    return (
      <section className="pd-specialist-patient-section">
        <FamilyPatternSectionTitle />
        <div className="pd-card pd-card-pad pd-specialist-family-pattern-card">
          <p className="pd-inline-loading">Loading family pattern insight...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pd-specialist-patient-section">
        <FamilyPatternSectionTitle />
        <div className="pd-card pd-card-pad pd-specialist-family-pattern-card">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>Retry</button>
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
    : NEUTRAL_SUMMARY_MESSAGE;

  return (
    <section className="pd-specialist-patient-section">
      <FamilyPatternSectionTitle />
      <div className="pd-card pd-card-pad pd-specialist-family-pattern-card">
        <ClinicalSummaryPanel>
          <p className="pd-specialist-family-pattern-summary-text">{summaryText}</p>
        </ClinicalSummaryPanel>

        {insight.hasDetectedPatterns ? (
          <div className="pd-specialist-family-pattern-findings">
            {insight.evidenceLevel ? (
              <p className="pd-section-sub">Evidence level: {insight.evidenceLevel}</p>
            ) : null}
            {insight.patterns.length > 0 ? (
              <ul className="pd-specialist-pattern-list">
                {insight.patterns.map((pattern) => (
                  <li key={`${pattern.type}-${pattern.reason}`}>
                    {pattern.condition || pattern.type}
                    {pattern.reason ? ` — ${pattern.reason}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
            <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={handleOpenDetails}>
              Review matched children
            </button>
          </div>
        ) : null}

        {insight.disclaimer ? (
          <p className="pd-specialist-pattern-disclaimer">{insight.disclaimer}</p>
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
            <h2 className="pd-modal-title">Matched Children</h2>
            {details.groups.length === 0 ? (
              <p className="pd-section-sub">No matched children details available.</p>
            ) : (
              details.groups.map((group) => (
                <div key={group.type || "group"} className="pd-specialist-pattern-group">
                  {group.type ? <h3>{group.type}</h3> : null}
                  <ul>
                    {group.children.map((child) => (
                      <li key={child.patientId || child.patientName}>
                        <strong>{child.patientName}</strong>
                        {child.matchedValue ? ` — ${child.matchedValue}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
            <div className="pd-modal-actions">
              <button type="button" className="pd-btn pd-btn-primary" onClick={() => setIsDetailsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
