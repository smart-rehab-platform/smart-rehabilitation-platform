import { useRef } from "react";
import { FileText, Image as ImageIcon, Paperclip, X } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";
import { SUPPORT_REQUEST_ATTACHMENT_ACCEPT } from "../../utils/supportRequestMappers";

export function SupportRequestAttachmentField({
  attachmentFile,
  disabled = false,
  error = null,
  onSelectFile,
  onClearFile,
}) {
  const { t } = useLocale();
  const inputRef = useRef(null);

  const isPdf = attachmentFile?.name?.toLowerCase().endsWith(".pdf");

  return (
    <div className="pd-support-request-attachment-field">
      <div className="pd-support-request-attachment-head">
        <strong>{t("supportRequests.attachmentOptional")}</strong>
        <p>{t("supportRequests.attachmentHelp")}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={SUPPORT_REQUEST_ATTACHMENT_ACCEPT}
        className="pd-sr-only"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = "";
          if (file) {
            onSelectFile?.(file);
          }
        }}
      />

      {attachmentFile ? (
        <div className="pd-support-request-attachment-selected">
          <span className="pd-support-request-attachment-icon" aria-hidden="true">
            {isPdf ? <FileText size={18} /> : <ImageIcon size={18} />}
          </span>
          <span className="pd-support-request-attachment-name" dir="auto">{attachmentFile.name}</span>
          <button
            type="button"
            className="pd-btn pd-btn-soft pd-btn-compact"
            onClick={onClearFile}
            disabled={disabled}
          >
            <X size={14} aria-hidden="true" />
            {t("common.remove")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="pd-btn pd-btn-soft"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip size={16} aria-hidden="true" />
          {t("supportRequests.addAttachment")}
        </button>
      )}

      {error ? <p className="pd-form-error" role="alert">{error}</p> : null}
    </div>
  );
}
