import { ChevronRight, Paperclip } from "lucide-react";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

function ViewAction({ onView }) {
  return (
    <button
      type="button"
      className="pd-btn pd-btn-soft pd-btn-compact pd-admin-case-requests-view-btn"
      onClick={(event) => {
        event.stopPropagation();
        onView?.();
      }}
    >
      View
      <ChevronRight size={16} aria-hidden="true" />
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

export function AdminCaseRequestsTable({
  items,
  isLoading,
  emptyKind,
  onViewRequest,
}) {
  if (isLoading) {
    return (
      <section className="pd-card pd-admin-case-requests-table-wrap pd-section-enter" aria-busy="true">
        <table className="pd-admin-case-requests-table">
          <thead>
            <tr>
              <th scope="col">Child</th>
              <th scope="col">Parent</th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
              <th scope="col">Submitted</th>
              <th scope="col">Attachments</th>
              <th scope="col"><span className="pd-sr-only">View</span></th>
            </tr>
          </thead>
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
        <p className="pd-admin-case-requests-empty-copy">No case requests have been submitted yet.</p>
      </section>
    );
  }

  if (emptyKind === "no-matches") {
    return (
      <section className="pd-card pd-card-pad pd-admin-case-requests-empty pd-section-enter">
        <p className="pd-admin-case-requests-empty-copy">No case requests match your search or filters.</p>
      </section>
    );
  }

  return (
    <section className="pd-card pd-admin-case-requests-table-wrap pd-section-enter" aria-label="Case requests list">
      <table className="pd-admin-case-requests-table">
        <thead>
          <tr>
            <th scope="col">Child</th>
            <th scope="col">Parent</th>
            <th scope="col">Category</th>
            <th scope="col">Status</th>
            <th scope="col">Submitted</th>
            <th scope="col">Attachments</th>
            <th scope="col"><span className="pd-sr-only">View</span></th>
          </tr>
        </thead>
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
              <td data-label="Child">
                <strong>{item.childName}</strong>
              </td>
              <td data-label="Parent">{item.parentName}</td>
              <td data-label="Category">{item.categoryName}</td>
              <td data-label="Status">
                <StatusBadge label={item.statusLabel} tone={item.statusTone} />
              </td>
              <td data-label="Submitted">{item.submittedLabel}</td>
              <td data-label="Attachments">
                <AttachmentsCell countLabel={item.attachmentCountLabel} />
              </td>
              <td data-label="View">
                <ViewAction onView={() => onViewRequest(item.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
