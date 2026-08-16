function sentAtTime(message) {
  if (!message?.sentAt) {
    return 0;
  }

  const time = new Date(message.sentAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function getLatestReadOutgoingMessageId(messages, currentUserId) {
  if (!currentUserId || !Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  const ordered = [...messages].sort((a, b) => sentAtTime(a) - sentAtTime(b));
  const lastMessage = ordered[ordered.length - 1];

  if (
    lastMessage?.id
    && lastMessage.senderId === currentUserId
    && lastMessage.isRead
  ) {
    return lastMessage.id;
  }

  return null;
}
