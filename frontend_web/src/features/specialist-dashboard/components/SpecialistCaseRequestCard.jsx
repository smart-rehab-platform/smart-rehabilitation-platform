import { Paperclip, MessagesSquare } from "lucide-react";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

export function SpecialistCaseRequestCard({ item, onClick }) {
  return (
    <button
      type="button"
      className="pd-card pd-card-pad pd-specialist-case-request-card"
      onClick={() => onClick?.(item)}
    >
      <div className="pd-specialist-case-request-card-top">
        <strong className="pd-specialist-case-request-card-title">{item.childName}</strong>
        <StatusBadge label={item.statusLabel} tone={item.statusTone} />
      </div>

      {item.parentName ? (
        <span className="pd-specialist-case-request-card-parent">{item.parentName}</span>
      ) : null}

      {item.categoryName ? (
        <span className="pd-specialist-case-request-card-category">{item.categoryName}</span>
      ) : null}

      <div className="pd-specialist-case-request-card-meta">
        <span>{item.dateLabel}</span>
        <span className="pd-specialist-case-request-card-meta-item">
          <Paperclip size={14} aria-hidden="true" />
          {item.attachmentCountLabel}
        </span>
        {item.conversationAvailable ? (
          <span className="pd-specialist-case-request-card-meta-item">
            <MessagesSquare size={14} aria-hidden="true" />
            Conversation available
          </span>
        ) : null}
      </div>
    </button>
  );
}
