import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { AdminAuditActionBadge } from "../components/AdminAuditActionBadge";
import { getAvatarInitial } from "../utils/adminDashboardMappers";
import { formatAdminDateTimeLabel } from "../utils/adminCaseRequestsMappers";
import { isAuditEntityReferenceId } from "../utils/adminAuditLogsMappers";

function formatAuditDateTime(createdAt) {
  return formatAdminDateTimeLabel(createdAt) || "—";
}

function getDetailsPanelId(logId) {
  return `admin-audit-details-${logId}`;
}

function ActionCell({ log }) {
  return (
    <div className="pd-admin-audit-action-cell">
      <strong className="pd-admin-audit-action-title">{log.actionLabel}</strong>
      <AdminAuditActionBadge
        category={log.actionCategory}
        tone={log.actionTone}
        action={log.action}
      />
    </div>
  );
}

function UserCell({ log }) {
  const initials = log.displayUserName === "System"
    ? "SY"
    : getAvatarInitial(log.displayUserName);

  return (
    <div className="pd-admin-audit-user-cell">
      <UserProfileAvatar
        initials={initials}
        alt=""
        sizeClassName="pd-admin-audit-avatar"
        shellClassName="pd-admin-audit-avatar-shell"
        fallbackClassName="pd-admin-audit-avatar-fallback"
        className="pd-avatar-photo"
      />
      <span className="pd-admin-audit-user-copy">
        <strong className="pd-admin-audit-user-name">{log.displayUserName}</strong>
        {log.userEmail ? (
          <span className="pd-admin-audit-user-email">{log.userEmail}</span>
        ) : null}
      </span>
    </div>
  );
}

function EntityChip({ label }) {
  return <span className="pd-admin-audit-entity-chip">{label || "System"}</span>;
}

function DetailsPanel({ logId, entityId }) {
  return (
    <div
      id={getDetailsPanelId(logId)}
      className="pd-admin-audit-details-panel"
    >
      <span className="pd-admin-audit-details-label">Reference ID</span>
      <code className="pd-admin-audit-details-value">{entityId}</code>
    </div>
  );
}

function DetailsCell({ log, expanded, onToggle }) {
  if (!isAuditEntityReferenceId(log.entityId)) {
    return <span className="pd-admin-audit-muted">—</span>;
  }

  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      className={`pd-admin-audit-details-btn${expanded ? " is-expanded" : ""}`}
      aria-expanded={expanded}
      aria-controls={getDetailsPanelId(log.id)}
      onClick={() => onToggle(log.id)}
    >
      Details
      <Chevron size={16} aria-hidden="true" />
    </button>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <tr key={index} className="pd-admin-audit-row-loading" aria-hidden="true">
          <td data-label="Action">
            <div className="pd-admin-audit-skeleton-action">
              <span className="pd-admin-audit-skeleton-line is-wide" />
              <span className="pd-admin-audit-skeleton-chip" />
            </div>
          </td>
          <td data-label="User">
            <div className="pd-admin-audit-skeleton-user">
              <span className="pd-admin-audit-skeleton-avatar" />
              <span className="pd-admin-audit-skeleton-line is-wide" />
            </div>
          </td>
          <td data-label="Entity"><span className="pd-admin-audit-skeleton-chip" /></td>
          <td data-label="Date & Time"><span className="pd-admin-audit-skeleton-line" /></td>
          <td data-label="Details"><span className="pd-admin-audit-skeleton-line is-short" /></td>
        </tr>
      ))}
    </>
  );
}

function AuditLogRow({ log, expanded, onToggle }) {
  const canExpand = isAuditEntityReferenceId(log.entityId);

  return (
    <>
      <tr className={`pd-admin-audit-row${expanded ? " is-expanded" : ""}`}>
        <td data-label="Action">
          <ActionCell log={log} />
        </td>
        <td data-label="User">
          <UserCell log={log} />
        </td>
        <td data-label="Entity">
          <EntityChip label={log.entityLabel} />
        </td>
        <td data-label="Date & Time">{formatAuditDateTime(log.createdAt)}</td>
        <td data-label="Details">
          <DetailsCell log={log} expanded={expanded} onToggle={onToggle} />
        </td>
      </tr>

      {canExpand && expanded ? (
        <tr className="pd-admin-audit-details-row">
          <td colSpan={5}>
            <DetailsPanel logId={log.id} entityId={log.entityId} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function AdminAuditLogsTable({
  logs = [],
  isInitialLoading = false,
  isRefreshing = false,
  emptyKind = null,
  onClearFilters,
}) {
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const activeExpandedIds = useMemo(() => {
    const validIds = new Set(logs.map((log) => log.id).filter(Boolean));
    const next = new Set();

    for (const id of expandedIds) {
      if (validIds.has(id)) {
        next.add(id);
      }
    }

    return next;
  }, [expandedIds, logs]);

  const handleToggleDetails = (logId) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  if (isInitialLoading) {
    return (
      <section
        className="pd-card pd-admin-audit-table-wrap pd-section-enter"
        aria-busy="true"
        aria-label="Audit logs loading"
      >
        <div className="pd-admin-audit-table-scroll">
          <table className="pd-admin-audit-table">
            <thead>
              <tr>
                <th scope="col">Action</th>
                <th scope="col">User</th>
                <th scope="col">Entity</th>
                <th scope="col">Date &amp; Time</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRows />
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (emptyKind === "no-logs") {
    return (
      <section className="pd-card pd-card-pad pd-admin-audit-empty pd-section-enter">
        <p className="pd-admin-audit-empty-copy">No audit logs found.</p>
      </section>
    );
  }

  if (emptyKind === "no-matches") {
    return (
      <section className="pd-card pd-card-pad pd-admin-audit-empty pd-section-enter">
        <p className="pd-admin-audit-empty-copy">No audit logs match your filters.</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={onClearFilters}>
          Clear filters
        </button>
      </section>
    );
  }

  return (
    <section
      className={`pd-card pd-admin-audit-table-wrap pd-section-enter${isRefreshing ? " is-refreshing" : ""}`}
      aria-label="Audit logs list"
      aria-busy={isRefreshing || undefined}
    >
      <div className="pd-admin-audit-table-scroll">
        <table className="pd-admin-audit-table">
          <thead>
            <tr>
              <th scope="col">Action</th>
              <th scope="col">User</th>
              <th scope="col">Entity</th>
              <th scope="col">Date &amp; Time</th>
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <AuditLogRow
                key={log.id}
                log={log}
                expanded={activeExpandedIds.has(log.id)}
                onToggle={handleToggleDetails}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
