import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { useLocale } from "../../../context/useLocale";

function TimelineIcon({ state }) {
  if (state === "completed") {
    return <CheckCircle2 size={18} className="pd-specialist-case-timeline-icon is-completed" aria-hidden="true" />;
  }
  if (state === "current") {
    return <CircleDot size={18} className="pd-specialist-case-timeline-icon is-current" aria-hidden="true" />;
  }
  return <Circle size={18} className="pd-specialist-case-timeline-icon is-upcoming" aria-hidden="true" />;
}

export function SpecialistCaseRequestTimeline({ steps = [] }) {
  const { t } = useLocale();

  if (!Array.isArray(steps) || steps.length === 0) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-case-section">
      <h2 className="pd-specialist-case-section-title">{t("specialist.caseRequests.statusTimeline")}</h2>
      <ol className="pd-specialist-case-timeline">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`pd-specialist-case-timeline-step is-${step.state}`}
          >
            <div className="pd-specialist-case-timeline-marker">
              <TimelineIcon state={step.state} />
              {index < steps.length - 1 ? (
                <span className="pd-specialist-case-timeline-connector" aria-hidden="true" />
              ) : null}
            </div>
            <div className="pd-specialist-case-timeline-copy">
              <strong>{step.title}</strong>
              {step.subtitle ? <span>{step.subtitle}</span> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
