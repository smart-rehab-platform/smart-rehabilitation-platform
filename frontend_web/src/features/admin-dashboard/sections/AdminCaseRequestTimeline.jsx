import { CheckCircle2, Circle, CircleDot } from "lucide-react";

function TimelineIcon({ state }) {
  if (state === "completed") {
    return <CheckCircle2 size={18} strokeWidth={2.1} aria-hidden="true" />;
  }

  if (state === "current") {
    return <CircleDot size={18} strokeWidth={2.1} aria-hidden="true" />;
  }

  return <Circle size={18} strokeWidth={2.1} aria-hidden="true" />;
}

export function AdminCaseRequestTimeline({ steps }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-timeline pd-section-enter" aria-label="Status timeline">
      <h2 className="pd-admin-case-request-section-title">Status Timeline</h2>
      <ol className="pd-admin-case-request-timeline-list">
        {steps.map((step) => (
          <li
            key={step.key}
            className={`pd-admin-case-request-timeline-step is-${step.state}`}
          >
            <span className="pd-admin-case-request-timeline-icon">
              <TimelineIcon state={step.state} />
            </span>
            <div className="pd-admin-case-request-timeline-copy">
              <strong>{step.label}</strong>
              {step.subtitle ? <span>{step.subtitle}</span> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
