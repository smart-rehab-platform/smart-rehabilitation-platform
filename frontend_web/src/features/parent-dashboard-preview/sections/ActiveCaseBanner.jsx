import { ClipboardList } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";

export function ActiveCaseBanner({ caseRequest, onView }) {
  if (!caseRequest) return null;

  const firstName = caseRequest.childFirstName
    || caseRequest.childName?.split(" ")[0]
    || "Your child";

  return (
    <section className="pd-case-banner" aria-label="Active case request">
      <span className="pd-case-banner-icon" aria-hidden="true">
        <ClipboardList size={16} />
      </span>

      <div className="pd-case-banner-copy">
        <p>
          {firstName}&apos;s case request is under assessment by{" "}
          <strong>{caseRequest.specialistName}</strong>.
        </p>
      </div>

      <div className="pd-case-banner-meta">
        <span className="pd-other-child">{caseRequest.anotherChildLabel}</span>
        <StatusBadge label={caseRequest.status} tone="warning" />
        <button type="button" className="pd-link" onClick={onView}>
          View Request →
        </button>
      </div>
    </section>
  );
}
