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

function LoadingRows() {
  return (
    <ul className="pd-admin-ai-attention-list" aria-label="Patients needing attention loading">
      {[0, 1, 2].map((index) => (
        <li key={index} className="pd-admin-ai-attention-row pd-admin-ai-row-loading">
          <span className="pd-admin-ai-row-icon pd-inline-loading" aria-hidden="true" />
          <span className="pd-admin-ai-row-copy">
            <span className="pd-inline-loading">Loading patient...</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AdminPatientsNeedingAttention({
  patients = [],
  isLoading = false,
  onSelectPatient,
}) {
  return (
    <section
      id="admin-ai-patients-attention"
      className="pd-card pd-card-pad pd-admin-ai-section pd-section-enter"
      aria-label="Patients needing attention"
    >
      <div className="pd-admin-section-header">
        <h2 className="pd-section-title">Patients Needing Attention</h2>
      </div>

      {isLoading ? (
        <LoadingRows />
      ) : patients.length === 0 ? (
        <p className="pd-admin-empty-copy">No patients currently need attention.</p>
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
