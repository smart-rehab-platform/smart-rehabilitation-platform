export function AdminPatientNotes({ notes }) {
  return (
    <section className="pd-admin-patient-section pd-section-enter" aria-label="Latest specialist notes">
      <h2 className="pd-admin-patient-section-title">Latest Specialist Notes</h2>

      {notes.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-admin-patient-empty-copy">No specialist notes yet.</p>
        </div>
      ) : (
        <ul className="pd-admin-patient-item-list">
          {notes.map((note) => (
            <li key={note.id} className="pd-card pd-card-pad pd-admin-patient-note-card">
              <div className="pd-admin-patient-note-head">
                <strong>{note.specialistName}</strong>
                <span className="pd-admin-patient-note-date">{note.createdAtLabel || "—"}</span>
              </div>
              <p className="pd-admin-patient-note-body">{note.note}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
