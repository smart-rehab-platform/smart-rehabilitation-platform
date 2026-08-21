import { UserRound } from "lucide-react";

function AttentionRow({ patient, onSelectPatient }) {
  const handleOpen = () => onSelectPatient?.(patient.id);

  return (
    <li
      className="pd-admin-ai-attention-row"
      tabIndex={0}
      role="link"
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
    >
      <span className="pd-admin-ai-row-icon pd-admin-ai-row-icon-attention" aria-hidden="true">
        <UserRound size={18} strokeWidth={2.1} />
      </span>
      <span className="pd-admin-ai-row-copy">
        <strong className="pd-admin-ai-row-title">{patient.fullName}</strong>
      </span>
    </li>
  );
}

function LoadingRows({ labels }) {
  return (
    <ul className="pd-admin-ai-attention-list" aria-label={labels.attention.loadingAriaLabel}>
      {[0, 1, 2].map((index) => (
        <li key={index} className="pd-admin-ai-attention-row pd-admin-ai-row-loading">
          <span className="pd-admin-ai-row-icon pd-inline-loading" aria-hidden="true" />
          <span className="pd-admin-ai-row-copy">
            <span className="pd-inline-loading">{labels.attention.loadingPatient}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AdminPatientsNeedingAttention({
  patients = [],
  labels,
  isLoading = false,
  onSelectPatient,
}) {
  return (
    <section
      id="admin-ai-patients-attention"
      className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter"
      aria-label={labels.attention.ariaLabel}
    >
      <div className="pd-admin-section-header">
        <h2 className="pd-section-title">{labels.attention.title}</h2>
      </div>

      {isLoading ? (
        <LoadingRows labels={labels} />
      ) : patients.length === 0 ? (
        <p className="pd-admin-empty-copy">{labels.attention.empty}</p>
      ) : (
        <ul className="pd-admin-ai-attention-list">
          {patients.map((patient) => (
            <AttentionRow
              key={patient.id}
              patient={patient}
              onSelectPatient={onSelectPatient}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
