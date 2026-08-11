import { useState } from "react";

export function SpecialistAddNoteDialog({ open, onClose, onSubmit, isSaving }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) {
      setError("Note is required.");
      return;
    }

    const ok = await onSubmit?.(trimmed);
    if (ok) {
      onClose?.();
      return;
    }

    setError("Unable to save note. Please try again.");
  };

  return (
    <div className="pd-modal-backdrop" role="presentation" onClick={() => onClose?.()}>
      <div
        className="pd-modal pd-specialist-add-note-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialist-add-note-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="specialist-add-note-title" className="pd-modal-title">Add Specialist Note</h2>
        <form onSubmit={handleSubmit}>
          <label className="pd-field-label" htmlFor="specialist-note-input">
            Note
          </label>
          <textarea
            id="specialist-note-input"
            className="pd-textarea"
            rows={5}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Enter clinical note..."
            disabled={isSaving}
          />
          {error ? <p className="pd-inline-error">{error}</p> : null}
          <div className="pd-modal-actions">
            <button type="button" className="pd-btn pd-btn-soft" onClick={() => onClose?.()} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="pd-btn pd-btn-primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
