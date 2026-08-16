import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminPatientDetailsLabels } from "../utils/adminPatientsLocalization.js";

export function AdminPatientNotes({ notes }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminPatientDetailsLabels(t), [t]);

  return (
    <section className="pd-admin-patient-section pd-section-enter" aria-label={labels.latestNotes}>
      <h2 className="pd-admin-patient-section-title">{labels.latestNotes}</h2>

      {notes.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-patient-empty-copy">{labels.noNotes}</p>
        </div>
      ) : (
        <ul className="pd-admin-patient-item-list">
          {notes.map((note) => (
            <li key={note.id} className="pd-card pd-card-pad pd-admin-patient-note-card">
              <div className="pd-admin-patient-note-head">
                <strong>{note.specialistName}</strong>
                <span className="pd-admin-patient-note-date">{note.createdAtLabel || labels.emptyDisplay}</span>
              </div>
              <p className="pd-admin-patient-note-body">{note.note}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
