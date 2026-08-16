import { useMemo, useState } from "react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

export function AdminPatientAssignmentsPatientSelector({
  patients,
  selectedPatientId,
  onSelectPatient,
  labels,
  disabled = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return patients;
    }

    return patients.filter((patient) => (
      patient.fullName.toLowerCase().includes(query)
      || patient.conditionLabel.toLowerCase().includes(query)
    ));
  }, [patients, searchQuery]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  if (patients.length === 0) {
    return (
      <section className="pd-card pd-card-pad pd-admin-assignments-patient-panel" aria-label={labels.patientLabel}>
        <h2 className="pd-admin-assignments-patient-panel-title">{labels.patientLabel}</h2>
        <p className="pd-admin-assignments-empty-copy">{labels.noPatients}</p>
      </section>
    );
  }

  return (
    <section className="pd-card pd-card-pad pd-admin-assignments-patient-panel" aria-label={labels.patientLabel}>
      <h2 className="pd-admin-assignments-patient-panel-title">{labels.patientLabel}</h2>

      <div className="pd-admin-assignments-patient-panel-body">
        <label className="pd-admin-field pd-admin-assignments-patient-search-field">
          <span className="pd-sr-only">{labels.searchPatients}</span>
          <input
            type="search"
            className="pd-admin-input pd-admin-assignments-patient-search"
            placeholder={labels.searchPatientsPlaceholder}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            disabled={disabled}
          />
        </label>

        {selectedPatient ? (
          <div className="pd-admin-assignments-selected-patient" aria-live="polite">
            <UserProfileAvatar
              imageUrl={selectedPatient.profileImageUrl}
              initials={selectedPatient.initials}
              alt=""
              sizeClassName="pd-admin-assignments-patient-avatar"
              shellClassName="pd-admin-assignments-patient-avatar-shell"
              fallbackClassName="pd-admin-assignments-patient-avatar-fallback"
              className="pd-avatar-photo"
            />
            <div className="pd-admin-assignments-selected-patient-copy">
              <strong>{selectedPatient.fullName}</strong>
              <span>{selectedPatient.conditionLabel}</span>
            </div>
          </div>
        ) : null}

        <label className="pd-admin-field pd-admin-assignments-patient-select-field">
          <span className="pd-sr-only">{labels.selectPatient}</span>
          <select
            className="pd-admin-select"
            value={selectedPatientId ?? ""}
            onChange={(event) => onSelectPatient(event.target.value || null)}
            disabled={disabled}
          >
            <option value="">{labels.selectPatient}</option>
            {filteredPatients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName}
                {" · "}
                {patient.conditionLabel}
              </option>
            ))}
          </select>
        </label>

        {searchQuery && filteredPatients.length === 0 ? (
          <p className="pd-admin-assignments-empty-copy pd-admin-assignments-patient-no-match">
            {labels.noPatientsMatch}
          </p>
        ) : null}
      </div>
    </section>
  );
}
