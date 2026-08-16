import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

export function AdminCaseRequestSummary({ detail, labels }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-summary pd-section-enter" aria-label={detail.childName}>
      <div className="pd-admin-case-request-summary-main">
        <div className="pd-admin-case-request-summary-copy">
          <h1 className="pd-admin-case-request-summary-title" dir="auto">{detail.childName}</h1>
          <p className="pd-admin-case-request-summary-meta">
            {labels.submittedBy(detail.parentName)}
          </p>
          <p className="pd-admin-case-request-summary-meta">{detail.categoryName}</p>
        </div>
        <div className="pd-admin-case-request-summary-side">
          <StatusBadge label={detail.statusLabel} tone={detail.statusTone} />
          <p className="pd-admin-case-request-summary-date">
            {labels.submittedOn(detail.submittedLabel)}
          </p>
        </div>
      </div>
      <p className="pd-admin-case-request-summary-id">{labels.requestId(detail.shortId)}</p>
    </section>
  );
}
