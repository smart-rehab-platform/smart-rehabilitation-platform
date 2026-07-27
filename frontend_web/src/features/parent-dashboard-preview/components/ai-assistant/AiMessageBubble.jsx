import { SuggestedHomePracticeCard } from "./SuggestedHomePracticeCard";

export function AiMessageBubble({ message, isWaiting = false }) {
  const isUser = message?.role === "user";
  const label = message?.senderLabel || (isUser ? "You" : "AI Assistant");

  return (
    <article
      className={`pd-ai-message${isUser ? " is-user" : " is-assistant"}${isWaiting ? " is-waiting" : ""}`}
      aria-label={`${label} message`}
    >
      <header className="pd-ai-message-header">
        <span className="pd-ai-message-role">{label}</span>
        {message?.createdDate ? (
          <time className="pd-ai-message-time" dateTime={message.createdAtIso}>
            {message.createdDate}
          </time>
        ) : null}
      </header>

      <div className="pd-ai-message-body">
        {isWaiting ? (
          <p className="pd-inline-loading" aria-live="polite">
            AI Assistant is thinking...
          </p>
        ) : (
          <p className="pd-ai-message-text">{message?.content}</p>
        )}
      </div>

      {!isWaiting && message?.suggestedPractice ? (
        <SuggestedHomePracticeCard practice={message.suggestedPractice} />
      ) : null}
    </article>
  );
}
