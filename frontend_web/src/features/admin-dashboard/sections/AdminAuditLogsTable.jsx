import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { AdminAuditActionBadge } from "../components/AdminAuditActionBadge";
import { AdminTablePrimaryAction } from "../components/AdminTablePrimaryAction";
import { getAvatarInitial } from "../utils/adminDashboardMappers";
import { isAuditEntityReferenceId } from "../utils/adminAuditLogsConstants.js";

function getDetailsPanelId(logId) {
  return `admin-audit-details-${logId}`;
}

function ActionCell({ log }) {
  return (
    <div className="pd-admin-audit-action-cell">
      <strong className="pd-admin-audit-action-title">{log.actionLabel}</strong>
      <AdminAuditActionBadge
        label={log.badgeLabel}
        category={log.actionCategory}
        tone={log.actionTone}
        action={log.action}
      />
    </div>
  );
}

function UserCell({ log, labels }) {
  const isSystemUser = log.displayUserName === labels.systemUser;
  const initials = isSystemUser
    ? labels.systemUserInitials
    : getAvatarInitial(log.displayUserName);

  return (
    <div className="pd-admin-audit-user-cell">
      <UserProfileAvatar
        imageUrl={log.profileImageUrl}
        initials={initials}
        alt=""
        sizeClassName="pd-admin-audit-avatar"
        shellClassName="pd-admin-audit-avatar-shell"
        fallbackClassName="pd-admin-audit-avatar-fallback"
        className="pd-avatar-photo"
      />
      <span className="pd-admin-audit-user-copy">
        <strong className="pd-admin-audit-user-name" dir="auto">{log.displayUserName}</strong>
        {log.userEmail ? (
          <span className="pd-admin-audit-user-email" dir="auto">{log.userEmail}</span>
        ) : null}
      </span>
    </div>
  );
}

function EntityChip({ label, labels }) {
  return (
    <span className="pd-admin-audit-entity-chip">{label || labels.systemUser}</span>
  );
}

function DetailsPanel({ logId, entityId, labels }) {
  return (
    <div
      id={getDetailsPanelId(logId)}
      className="pd-admin-audit-details-panel"
    >
      <span className="pd-admin-audit-details-label">{labels.details.referenceId}</span>
      <code className="pd-admin-audit-details-value" dir="auto">{entityId}</code>
    </div>
  );
}

function DetailsCell({ log, labels, expanded, onToggle }) {
  if (!isAuditEntityReferenceId(log.entityId)) {
    return <span className="pd-admin-audit-muted">{labels.emptyDisplay}</span>;
  }

  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <AdminTablePrimaryAction
      aria-expanded={expanded}
      aria-controls={getDetailsPanelId(log.id)}
      onClick={() => onToggle(log.id)}
    >
      {labels.details.button}
      <Chevron size={16} aria-hidden="true" />
    </AdminTablePrimaryAction>
  );
}

function SkeletonRows({ labels }) {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <tr key={index} className="pd-admin-audit-row-loading" aria-hidden="true">
          <td data-label={labels.columns.action}>
            <div className="pd-admin-audit-skeleton-action">
              <span className="pd-admin-audit-skeleton-line is-wide" />
              <span className="pd-admin-audit-skeleton-chip" />
            </div>
          </td>
          <td data-label={labels.columns.user}>
            <div className="pd-admin-audit-skeleton-user">
              <span className="pd-admin-audit-skeleton-avatar" />
              <span className="pd-admin-audit-skeleton-line is-wide" />
            </div>
          </td>
          <td data-label={labels.columns.entity}><span className="pd-admin-audit-skeleton-chip" /></td>
          <td data-label={labels.columns.dateTime}><span className="pd-admin-audit-skeleton-line" /></td>
          <td data-label={labels.columns.details}><span className="pd-admin-audit-skeleton-line is-short" /></td>
        </tr>
      ))}
    </>
  );
}

function AuditLogRow({ log, labels, expanded, onToggle }) {
  const canExpand = isAuditEntityReferenceId(log.entityId);

  return (
    <>
      <tr className={`pd-admin-audit-row${expanded ? " is-expanded" : ""}`}>
        <td data-label={labels.columns.action}>
          <ActionCell log={log} />
        </td>
        <td data-label={labels.columns.user}>
          <UserCell log={log} labels={labels} />
        </td>
        <td data-label={labels.columns.entity}>
          <EntityChip label={log.entityLabel} labels={labels} />
        </td>
        <td data-label={labels.columns.dateTime}>{log.createdAtLabel}</td>
        <td data-label={labels.columns.details}>
          <DetailsCell log={log} labels={labels} expanded={expanded} onToggle={onToggle} />
        </td>
      </tr>

      {canExpand && expanded ? (
        <tr className="pd-admin-audit-details-row">
          <td colSpan={5}>
            <DetailsPanel logId={log.id} entityId={log.entityId} labels={labels} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function AdminAuditLogsTable({
  logs = [],
  labels,
  isInitialLoading = false,
  isRefreshing = false,
  emptyKind = null,
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
        aria-label={labels.tableLoadingAriaLabel}
      >
        <div className="pd-admin-audit-table-scroll">
          <table className="pd-admin-audit-table">
            <thead>
              <tr>
                <th scope="col">{labels.columns.action}</th>
                <th scope="col">{labels.columns.user}</th>
                <th scope="col">{labels.columns.entity}</th>
                <th scope="col">{labels.columns.dateTime}</th>
                <th scope="col">{labels.columns.details}</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonRows labels={labels} />
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (emptyKind === "no-logs") {
    return (
      <section className="pd-card pd-card-pad pd-admin-audit-empty pd-section-enter">
        <p className="pd-admin-audit-empty-copy">{labels.empty}</p>
      </section>
    );
  }

  if (emptyKind === "no-matches") {
    return (
      <section className="pd-card pd-card-pad pd-admin-audit-empty pd-section-enter">
        <p className="pd-admin-audit-empty-copy">{labels.emptyFiltered}</p>
      </section>
    );
  }

  return (
    <section
      className={`pd-card pd-admin-audit-table-wrap pd-section-enter${isRefreshing ? " is-refreshing" : ""}`}
      aria-label={labels.tableAriaLabel}
      aria-busy={isRefreshing || undefined}
    >
      <div className="pd-admin-audit-table-scroll">
        <table className="pd-admin-audit-table">
          <thead>
            <tr>
              <th scope="col">{labels.columns.action}</th>
              <th scope="col">{labels.columns.user}</th>
              <th scope="col">{labels.columns.entity}</th>
              <th scope="col">{labels.columns.dateTime}</th>
              <th scope="col">{labels.columns.details}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <AuditLogRow
                key={log.id}
                log={log}
                labels={labels}
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
