import { useState } from "react";
import { useLocale } from "../../../context/useLocale";

export function SpecialistAddNoteDialog({ open, onClose, onSubmit, isSaving }) {
  const { t } = useLocale();
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) {
      setError(t("specialist.patientDetails.noteRequired"));
      return;
    }

    const ok = await onSubmit?.(trimmed);
    if (ok) {
      onClose?.();
      return;
    }

    setError(t("specialist.patientDetails.saveNoteFailed"));
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
        <h2 id="specialist-add-note-title" className="pd-modal-title">
          {t("specialist.patientDetails.addNoteTitle")}
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="pd-field-label" htmlFor="specialist-note-input">
            {t("specialist.patientDetails.noteLabel")}
          </label>
          <textarea
            id="specialist-note-input"
            className="pd-textarea"
            rows={5}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("specialist.patientDetails.notePlaceholder")}
            disabled={isSaving}
          />
          {error ? <p className="pd-inline-error">{error}</p> : null}
          <div className="pd-modal-actions">
            <button type="button" className="pd-btn pd-btn-soft" onClick={() => onClose?.()} disabled={isSaving}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="pd-btn pd-btn-primary" disabled={isSaving}>
              {isSaving ? t("specialist.patientDetails.savingNote") : t("specialist.patientDetails.saveNote")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
