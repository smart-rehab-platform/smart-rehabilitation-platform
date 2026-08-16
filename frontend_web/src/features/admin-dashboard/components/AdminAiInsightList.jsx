import { AdminAiStatusBadge } from "./AdminAiStatusBadge";

function LoadingRows({ labels }) {
  return (
    <ul className="pd-admin-ai-record-list" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <li key={index} className="pd-admin-ai-record-row pd-admin-ai-row-loading">
          <span className="pd-admin-ai-row-icon pd-inline-loading" />
          <span className="pd-admin-ai-row-copy">
            <span className="pd-inline-loading">{labels.records.loading}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function RecordRow({
  record,
  icon: Icon,
  iconTone,
  onSelectPatient,
  renderBadge,
  readOnly = false,
}) {
  const badge = renderBadge?.(record);
  const isInteractive = !readOnly && Boolean(record.patientId) && typeof onSelectPatient === "function";

  const handleOpen = () => {
    if (isInteractive) {
      onSelectPatient(record.patientId);
    }
  };

  const className = [
    "pd-admin-ai-record-row",
    isInteractive ? "pd-admin-ai-record-row-clickable" : "pd-admin-ai-record-row-static",
  ].join(" ");

  const sharedProps = isInteractive
    ? {
        tabIndex: 0,
        role: "link",
        onClick: handleOpen,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpen();
          }
        },
      }
    : {};

  return (
    <li className={className} {...sharedProps}>
      <span className={`pd-admin-ai-row-icon pd-admin-ai-row-icon-${iconTone}`} aria-hidden="true">
        <Icon size={18} strokeWidth={2.1} />
      </span>
      <span className="pd-admin-ai-row-copy">
        <strong className="pd-admin-ai-row-title" dir="auto">{record.patientName}</strong>
        <span className="pd-admin-ai-row-detail" dir="auto">{record.detailLabel}</span>
      </span>
      {badge ? (
        <AdminAiStatusBadge label={badge.label} tone={badge.tone} />
      ) : null}
    </li>
  );
}

export function AdminAiInsightList({
  sectionId,
  title,
  records = [],
  labels,
  isLoading = false,
  emptyMessage,
  icon,
  iconTone,
  onSelectPatient,
  renderBadge,
  readOnly = false,
}) {
  return (
    <section
      id={sectionId}
      className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter"
      aria-label={title}
    >
      <div className="pd-admin-section-header">
        <h2 className="pd-section-title">{title}</h2>
      </div>

      {isLoading ? (
        <LoadingRows labels={labels} />
      ) : records.length === 0 ? (
        <p className="pd-admin-empty-copy">{emptyMessage}</p>
      ) : (
        <ul className="pd-admin-ai-record-list" aria-label={labels.records.loadingAriaLabel}>
          {records.map((record) => (
            <RecordRow
              key={record.id ?? `${record.patientId}-${record.detailLabel}`}
              record={record}
              icon={icon}
              iconTone={iconTone}
              onSelectPatient={onSelectPatient}
              renderBadge={renderBadge}
              readOnly={readOnly}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
