import { UserProfileAvatar } from "../UserProfileAvatar";

function formatUnreadBadge(unreadCount) {
  if (unreadCount > 99) {
    return "99+";
  }

  return String(unreadCount);
}

export function MessagesConversationListItem({
  conversationId,
  isActive = false,
  onSelect,
  avatarUrl,
  avatarInitials,
  avatarShellClassName = "pd-avatar pd-conversation-avatar",
  primaryName,
  patientName,
  preview,
  activityTime,
  activityDateTime,
  unreadCount = 0,
  unreadAriaLabel,
}) {
  const showBadge = unreadCount > 0;
  const badgeLabel = formatUnreadBadge(unreadCount);

  return (
    <button
      type="button"
      className={`pd-messages-list-item${isActive ? " is-active" : ""}${showBadge ? " has-unread" : ""}`}
      aria-current={isActive ? "true" : undefined}
      onClick={() => onSelect?.(conversationId)}
    >
      <UserProfileAvatar
        imageUrl={avatarUrl}
        initials={avatarInitials}
        alt=""
        shellClassName={avatarShellClassName}
        fallbackClassName={avatarShellClassName}
        className="pd-avatar-photo"
      />
      <span className="pd-messages-conversation-main">
        <strong dir="auto" className="pd-messages-conversation-primary">
          {primaryName}
        </strong>
        {patientName ? (
          <span dir="auto" className="pd-messages-conversation-patient">
            {patientName}
          </span>
        ) : null}
        <span
          dir="auto"
          className={`pd-messages-conversation-preview${preview ? "" : " is-empty"}`}
        >
          {preview || "\u00a0"}
        </span>
      </span>
      <span className="pd-messages-conversation-meta">
        {activityTime ? (
          <time
            className="pd-messages-conversation-time"
            dateTime={activityDateTime || undefined}
          >
            {activityTime}
          </time>
        ) : null}
        {showBadge ? (
          <span
            className={`pd-messages-conversation-unread${
              badgeLabel.length > 1 ? " is-wide" : ""
            }`}
            aria-label={unreadAriaLabel}
          >
            {badgeLabel}
          </span>
        ) : null}
      </span>
    </button>
  );
}
