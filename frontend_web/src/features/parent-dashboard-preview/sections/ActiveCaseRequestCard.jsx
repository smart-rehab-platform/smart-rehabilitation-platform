import { Check } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";

export function ActiveCaseRequestCard({ caseRequest, onView }) {
  return (
    <section className="pd-card pd-card-pad pd-equal-card">
      <div className="pd-card-header">
        <div>
          <h2 className="pd-section-title">Active Case Request</h2>
          <p className="pd-section-sub">{caseRequest.title}</p>
        </div>
        <div className="pd-case-badges">
          <span className="pd-other-child">{caseRequest.anotherChildLabel}</span>
          <StatusBadge label={caseRequest.status} tone="warning" />
        </div>
      </div>

      <p className="pd-case-line">
        <strong>{caseRequest.childName}</strong> · {caseRequest.therapyType}
      </p>
      <p className="pd-case-meta">
        {caseRequest.specialistName} · {caseRequest.updatedLabel}
      </p>

      <ol className="pd-case-steps">
        {caseRequest.steps.map((step, index) => (
          <li key={step.id} className={step.done ? "is-done" : ""}>
            <span className="pd-step-node" aria-hidden="true">
              {step.done ? <Check size={12} /> : null}
            </span>
            <span className="pd-step-label">{step.label}</span>
            {index < caseRequest.steps.length - 1 ? (
              <span className="pd-step-line" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="pd-card-footer">
        <span>Case {caseRequest.caseNumber}</span>
        <button type="button" className="pd-link" onClick={onView}>
          View Request →
        </button>
      </div>
    </section>
  );
}
