import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { AiComposer } from "./AiComposer";
import { AiEmptyState } from "./AiEmptyState";
import { AiErrorState } from "./AiErrorState";
import { AiMessageBubble } from "./AiMessageBubble";
import {
  AI_DISCLAIMER_TEXT,
  AI_EMPTY_MESSAGES,
  AI_QUICK_PROMPTS,
} from "../../utils/parentAiAssistantUtils";

export function AiChatPanel({
  conversationId,
  messages,
  isLoadingMessages,
  messagesError,
  isSending,
  sendError,
  composerValue,
  onComposerChange,
  onSend,
  onRetryMessages,
  onBackToList,
  showBackButton = false,
  disabled = false,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, [messages, isSending]);

  const renderMessages = () => {
    if (isLoadingMessages) {
      return (
        <div className="pd-ai-panel-state">
          <p className="pd-inline-loading">Loading message history...</p>
        </div>
      );
    }

    if (messagesError) {
      return <AiErrorState message={messagesError} onRetry={onRetryMessages} />;
    }

    if (!conversationId) {
      return <AiEmptyState message={AI_EMPTY_MESSAGES.noConversationSelected} />;
    }

    if (messages.length === 0 && !isSending) {
      return (
        <AiEmptyState
          message={AI_EMPTY_MESSAGES.noMessages}
          action={(
            <div className="pd-ai-quick-prompts" aria-label="Suggested prompts">
              {AI_QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="pd-btn pd-btn-soft pd-ai-quick-prompt"
                  disabled={disabled || isSending}
                  onClick={() => onComposerChange?.(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        />
      );
    }

    return (
      <div className="pd-ai-message-list">
        {messages.map((message) => (
          <AiMessageBubble key={message.id} message={message} />
        ))}
        {isSending ? (
          <AiMessageBubble
            message={{ role: "assistant", senderLabel: "AI Assistant", content: "" }}
            isWaiting
          />
        ) : null}
      </div>
    );
  };

  return (
    <section className="pd-ai-chat-panel" aria-label="AI chat">
      <div className="pd-ai-chat-panel-header">
        {showBackButton ? (
          <button
            type="button"
            className="pd-btn pd-btn-icon pd-ai-back-button"
            aria-label="Back to conversations"
            onClick={onBackToList}
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
        ) : null}
        <div className="pd-ai-chat-panel-copy">
          <h2 className="pd-ai-panel-title">AI Assistant</h2>
          <p className="pd-ai-disclaimer">{AI_DISCLAIMER_TEXT}</p>
        </div>
      </div>

      <div ref={scrollRef} className="pd-ai-chat-scroll">
        {renderMessages()}
      </div>

      {sendError ? (
        <p className="pd-inline-error pd-ai-send-error" role="alert">
          {sendError}
        </p>
      ) : null}

      <AiComposer
        value={composerValue}
        onChange={onComposerChange}
        onSend={onSend}
        isSending={isSending}
        disabled={disabled || !conversationId}
      />
    </section>
  );
}
