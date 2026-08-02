import {
  CASE_REQUEST_CHILD_IMAGE_ACCEPT,
  CASE_REQUEST_CHILD_IMAGE_HINT,
  getCaseRequestChildInitials,
} from "../../utils/parentCaseRequestImageUtils";

export function CaseRequestChildPhoto({
  childName,
  persistedImageUrl = null,
  previewUrl = null,
  onSelectFile,
  onClearPreview,
  disabled = false,
  error = null,
  inputId = "case-request-child-photo",
}) {
  const displayUrl = previewUrl || persistedImageUrl || null;
  const initials = getCaseRequestChildInitials(childName);
  const showClear = Boolean(previewUrl);

  return (
    <div className="pd-case-child-photo">
      <div className="pd-case-child-photo-preview" aria-hidden="true">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt=""
            className="pd-avatar-photo pd-case-child-photo-img"
          />
        ) : (
          <span className="pd-avatar pd-case-child-photo-fallback">{initials}</span>
        )}
      </div>

      <div className="pd-case-child-photo-actions">
        <p className="pd-section-title">Child Photo</p>
        <p className="pd-section-sub">Optional</p>
        <label className="pd-btn pd-btn-soft" htmlFor={inputId}>
          {displayUrl && !previewUrl ? "Replace photo" : "Select photo"}
        </label>
        <input
          id={inputId}
          type="file"
          accept={CASE_REQUEST_CHILD_IMAGE_ACCEPT}
          className="pd-visually-hidden"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            event.target.value = "";
            if (file) {
              onSelectFile?.(file);
            }
          }}
        />
        {showClear ? (
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            disabled={disabled}
            onClick={() => onClearPreview?.()}
          >
            Remove selected photo
          </button>
        ) : null}
        <p className="pd-case-child-photo-hint">{CASE_REQUEST_CHILD_IMAGE_HINT}</p>
        {error ? <p className="pd-form-error" role="alert">{error}</p> : null}
      </div>
    </div>
  );
}
