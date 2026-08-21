import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

export function AdminCaseRequestSummary({ detail, labels }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-header pd-section-enter" aria-label={detail.childName}>
      <div className="pd-admin-case-request-header-body">
        <div className="pd-admin-case-request-header-main">
          <h1 className="pd-admin-case-request-header-title">
            <bdi dir="auto">{detail.childName}</bdi>
          </h1>
          <p className="pd-admin-case-request-header-meta">
            {labels.submittedBy(detail.parentName)}
          </p>
          <p className="pd-admin-case-request-header-meta">{detail.categoryName}</p>
        </div>

        <div className="pd-admin-case-request-header-aside">
          <p className="pd-admin-case-request-header-date">
            {labels.submittedOn(detail.submittedLabel)}
          </p>
          <div className="pd-admin-case-request-header-status">
            <span className="pd-admin-case-request-header-status-label">{labels.columns.status}</span>
            <StatusBadge label={detail.statusLabel} tone={detail.statusTone} />
          </div>
        </div>
      </div>

      <p className="pd-admin-case-request-header-id">{labels.requestId(detail.shortId)}</p>
    </section>
  );
}
