import { SupportRequestAttachmentField } from "./SupportRequestAttachmentField";
import { useLocale } from "../../../../context/useLocale.js";

export function SupportRequestComposer({
  content,
  attachmentFile,
  attachmentError,
  isSubmitting = false,
  submitError = null,
  onContentChange,
  onSelectAttachment,
  onClearAttachment,
  onSubmit,
}) {
  const { t } = useLocale();

  return (
    <div className="pd-support-request-reply" aria-label={t("supportRequests.reply")}>
      <h2 className="pd-support-request-reply-title">{t("supportRequests.reply")}</h2>

      <div className="pd-form-field">
        <label className="pd-form-label" htmlFor="support-request-reply-content">
          {t("supportRequests.message")}
        </label>
        <textarea
          id="support-request-reply-content"
          className="pd-form-input pd-form-textarea"
          rows={4}
          value={content}
          disabled={isSubmitting}
          onChange={(event) => onContentChange?.(event.target.value)}
          placeholder={t("supportRequests.messagePlaceholder")}
        />
      </div>

      <SupportRequestAttachmentField
        attachmentFile={attachmentFile}
        disabled={isSubmitting}
        error={attachmentError}
        onSelectFile={onSelectAttachment}
        onClearFile={onClearAttachment}
      />

      {submitError ? (
        <p className="pd-inline-error pd-support-request-composer-error" role="alert">{submitError}</p>
      ) : null}

      <div className="pd-support-request-composer-actions">
        <button
          type="button"
          className="pd-btn pd-btn-primary"
          disabled={isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? t("supportRequests.sending") : t("supportRequests.sendReply")}
        </button>
      </div>
    </div>
  );
}
