import { SupportRequestAttachmentPreview } from "./SupportRequestAttachmentPreview";
import { useLocale } from "../../../../context/useLocale.js";

export function SupportRequestThread({ messages = [] }) {
  const { t } = useLocale();

  if (!Array.isArray(messages) || messages.length === 0) {
    return (
      <div className="pd-support-request-thread pd-support-request-thread-empty">
        <h2 className="pd-support-request-section-title">{t("supportRequests.conversation")}</h2>
        <p className="pd-support-request-thread-empty-copy">{t("supportRequests.conversationEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="pd-support-request-thread" aria-label={t("supportRequests.conversation")}>
      <h2 className="pd-support-request-section-title">{t("supportRequests.conversation")}</h2>
      <div className="pd-support-request-thread-list">
        {messages.map((message) => {
          const variant = message.bubbleVariant === "admin" ? "is-admin" : "is-specialist";
          const alignment = message.isOwn ? "is-own" : "is-other";

          return (
            <article
              key={message.id}
              className={`pd-support-request-message ${variant} ${alignment}`}
            >
              <div className="pd-support-request-message-meta">
                <strong dir="auto">{message.senderName}</strong>
                <span>{message.createdAtLabel}</span>
              </div>
              <div className="pd-support-request-message-body">
                {message.content ? <p dir="auto">{message.content}</p> : null}
                {message.attachmentUrl ? (
                  <SupportRequestAttachmentPreview
                    attachmentUrl={message.attachmentUrl}
                    fileName={t("supportRequests.viewAttachment")}
                  />
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
