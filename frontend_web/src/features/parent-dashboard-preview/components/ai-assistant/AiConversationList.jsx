import { useMemo } from "react";
import { Plus } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";
import { AiConversationListItem } from "./AiConversationListItem";
import { AiEmptyState } from "./AiEmptyState";
import { AiErrorState } from "./AiErrorState";
import { getAiEmptyMessages } from "../../utils/parentAiAssistantUtils";

export function AiConversationList({
  conversations,
  selectedConversationId,
  isLoading,
  error,
  isCreating,
  onSelect,
  onCreate,
  onRetry,
}) {
  const { t } = useLocale();
  const emptyMessages = useMemo(() => getAiEmptyMessages(t), [t]);

  return (
    <aside className="pd-ai-conversation-panel" aria-label={t("parent.aiAssistant.conversationsTitle")}>
      <div className="pd-ai-conversation-panel-header">
        <h2 className="pd-ai-panel-title">{t("parent.aiAssistant.conversationsTitle")}</h2>
        <button
          type="button"
          className="pd-btn pd-btn-soft pd-ai-new-conversation"
          disabled={isCreating}
          onClick={onCreate}
        >
          <Plus size={16} aria-hidden="true" />
          {isCreating ? t("parent.aiAssistant.creating") : t("parent.aiAssistant.newShort")}
        </button>
      </div>

      {isLoading ? (
        <div className="pd-ai-panel-state">
          <p className="pd-inline-loading">{t("parent.pages.messages.loading")}</p>
        </div>
      ) : null}

      {!isLoading && error ? (
        <AiErrorState message={error} onRetry={onRetry} />
      ) : null}

      {!isLoading && !error && conversations.length === 0 ? (
        <AiEmptyState message={emptyMessages.noConversations} />
      ) : null}

      {!isLoading && !error && conversations.length > 0 ? (
        <div className="pd-ai-conversation-list" role="list">
          {conversations.map((conversation) => (
            <AiConversationListItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedConversationId}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </aside>
  );
}
