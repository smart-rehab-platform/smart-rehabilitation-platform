import { Plus } from "lucide-react";
import { AiConversationListItem } from "./AiConversationListItem";
import { AiEmptyState } from "./AiEmptyState";
import { AiErrorState } from "./AiErrorState";
import { AI_EMPTY_MESSAGES } from "../../utils/parentAiAssistantUtils";

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
  return (
    <aside className="pd-ai-conversation-panel" aria-label="AI conversations">
      <div className="pd-ai-conversation-panel-header">
        <h2 className="pd-ai-panel-title">Conversations</h2>
        <button
          type="button"
          className="pd-btn pd-btn-soft pd-ai-new-conversation"
          disabled={isCreating}
          onClick={onCreate}
        >
          <Plus size={16} aria-hidden="true" />
          {isCreating ? "Creating..." : "New"}
        </button>
      </div>

      {isLoading ? (
        <div className="pd-ai-panel-state">
          <p className="pd-inline-loading">Loading conversations...</p>
        </div>
      ) : null}

      {!isLoading && error ? (
        <AiErrorState message={error} onRetry={onRetry} />
      ) : null}

      {!isLoading && !error && conversations.length === 0 ? (
        <AiEmptyState message={AI_EMPTY_MESSAGES.noConversations} />
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
