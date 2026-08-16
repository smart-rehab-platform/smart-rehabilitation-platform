import { useMemo } from "react";
import { ChevronRight, Paperclip } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { getAdminCaseRequestsLabels } from "../utils/adminCaseRequestsLocalization.js";

function ViewAction({ onView, label }) {
  return (
    <button
      type="button"
      className="pd-btn pd-btn-soft pd-btn-compact pd-admin-case-requests-view-btn"
      onClick={(event) => {
        event.stopPropagation();
        onView?.();
      }}
    >
      {label}
      <ChevronRight size={16} aria-hidden="true" className="pd-admin-case-requests-view-chevron" />
    </button>
  );
}

function AttachmentsCell({ countLabel }) {
  return (
    <span className="pd-admin-case-requests-attachments">
      <Paperclip size={14} aria-hidden="true" />
      {countLabel}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <tr key={index} className="pd-admin-case-requests-row-loading" aria-hidden="true">
          <td><span className="pd-admin-case-requests-skeleton-line is-wide" /></td>
          <td><span className="pd-admin-case-requests-skeleton-line" /></td>
          <td><span className="pd-admin-case-requests-skeleton-line" /></td>
          <td><span className="pd-admin-case-requests-skeleton-line is-short" /></td>
          <td><span className="pd-admin-case-requests-skeleton-line" /></td>
          <td><span className="pd-admin-case-requests-skeleton-line is-short" /></td>
          <td><span className="pd-admin-case-requests-skeleton-line is-short" /></td>
        </tr>
      ))}
    </>
  );
}

function TableHeader({ labels }) {
  return (
    <thead>
      <tr>
        <th scope="col">{labels.columns.child}</th>
        <th scope="col">{labels.columns.parent}</th>
        <th scope="col">{labels.columns.category}</th>
        <th scope="col">{labels.columns.status}</th>
        <th scope="col">{labels.columns.submitted}</th>
        <th scope="col">{labels.columns.attachments}</th>
        <th scope="col"><span className="pd-sr-only">{labels.columns.view}</span></th>
      </tr>
    </thead>
  );
}

export function AdminCaseRequestsTable({
  items,
  isLoading,
  emptyKind,
  onViewRequest,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminCaseRequestsLabels(t), [t]);

  if (isLoading) {
    return (
      <section className="pd-card pd-admin-case-requests-table-wrap pd-section-enter" aria-busy="true">
        <table className="pd-admin-case-requests-table">
          <TableHeader labels={labels} />
          <tbody>
            <SkeletonRows />
          </tbody>
        </table>
      </section>
    );
  }

  if (emptyKind === "no-requests") {
    return (
      <section className="pd-card pd-card-pad pd-admin-case-requests-empty pd-section-enter">
        <p className="pd-admin-case-requests-empty-copy">{labels.empty}</p>
      </section>
    );
  }

  if (emptyKind === "no-matches") {
    return (
      <section className="pd-card pd-card-pad pd-admin-case-requests-empty pd-section-enter">
        <p className="pd-admin-case-requests-empty-copy">{labels.emptyFiltered}</p>
      </section>
    );
  }

  return (
    <section className="pd-card pd-admin-case-requests-table-wrap pd-section-enter" aria-label={labels.tableAriaLabel}>
      <table className="pd-admin-case-requests-table">
        <TableHeader labels={labels} />
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="pd-admin-case-requests-row"
              tabIndex={0}
              onClick={() => onViewRequest(item.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onViewRequest(item.id);
                }
              }}
            >
              <td data-label={labels.columns.child}>
                <strong dir="auto">{item.childName}</strong>
              </td>
              <td data-label={labels.columns.parent} dir="auto">{item.parentName}</td>
              <td data-label={labels.columns.category}>{item.categoryName}</td>
              <td data-label={labels.columns.status}>
                <StatusBadge label={item.statusLabel} tone={item.statusTone} />
              </td>
              <td data-label={labels.columns.submitted}>{item.submittedLabel}</td>
              <td data-label={labels.columns.attachments}>
                <AttachmentsCell countLabel={item.attachmentCountLabel} />
              </td>
              <td data-label={labels.columns.view}>
                <ViewAction onView={() => onViewRequest(item.id)} label={labels.view} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
