export function AiConversationListItem({
  conversation,
  isSelected,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={`pd-ai-conversation-item${isSelected ? " is-selected" : ""}`}
      aria-current={isSelected ? "true" : undefined}
      onClick={() => onSelect?.(conversation.id)}
    >
      <span className="pd-ai-conversation-item-title">{conversation.title}</span>
      {conversation.preview ? (
        <span className="pd-ai-conversation-item-preview">{conversation.preview}</span>
      ) : null}
      {conversation.updatedDate ? (
        <span className="pd-ai-conversation-item-date">{conversation.updatedDate}</span>
      ) : null}
    </button>
  );
}
