import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getConversationMessages,
  getUserConversations,
  markConversationMessagesRead,
  sendConversationAttachmentMessage,
  sendConversationMessage,
  uploadMessageAttachment,
} from "../../../services/parentCommunicationService";
import { mapConversations, mapMessage, mapMessages } from "../utils/parentMessagesUtils";

const MESSAGE_POLL_INTERVAL_MS = 5000;

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function mergeMessages(existing, incoming) {
  const byId = new Map(existing.map((message) => [message.id, message]));

  incoming.forEach((message) => {
    const current = byId.get(message.id);
    if (!current) {
      byId.set(message.id, message);
      return;
    }

    byId.set(message.id, {
      ...current,
      ...message,
      isRead: Boolean(current.isRead || message.isRead),
      attachments: message.attachments?.length ? message.attachments : current.attachments,
      senderName: message.senderName || current.senderName,
      senderRole: message.senderRole || current.senderRole,
    });
  });

  return Array.from(byId.values()).sort((a, b) => {
    const aTime = a.sentAt ? new Date(a.sentAt).getTime() : 0;
    const bTime = b.sentAt ? new Date(b.sentAt).getTime() : 0;
    return aTime - bTime;
  });
}

export function useParentMessages(userId) {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const upsertConversation = useCallback((conversation) => {
    if (!conversation?.id) {
      return;
    }

    setConversations((current) => {
      const next = current.filter((item) => item.id !== conversation.id);
      return [conversation, ...next];
    });
  }, []);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadConversations() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await getUserConversations(userId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setConversations(mapConversations(rows, mapperOptions));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, t("parent.hooks.loadConversationsFailed")));
          setConversations([]);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadConversations();

    return () => {
      cancelled = true;
    };
  }, [userId, refreshToken, mapperOptions, t]);

  if (!userId) {
    return {
      conversations: [],
      isLoading: false,
      error: t("parent.hooks.signInMessages"),
      refetch,
      upsertConversation,
    };
  }

  return { conversations, isLoading, error, refetch, upsertConversation };
}

export function useParentConversation(conversationId, currentUserId, options = {}) {
  const { onIncomingMessages } = options;
  const { t } = useLocale();
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(Boolean(conversationId));
  const [messagesError, setMessagesError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);
  const pollInFlightRef = useRef(false);
  const markReadInFlightRef = useRef(false);
  const isSendingRef = useRef(false);

  const refetchMessages = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const appendMessage = useCallback((message) => {
    if (!message?.id) {
      return;
    }

    setMessages((current) => mergeMessages(current, [message]));
  }, []);

  const markIncomingMessagesRead = useCallback(async (mappedMessages) => {
    if (!conversationId || !currentUserId || markReadInFlightRef.current) {
      return;
    }

    const hasUnreadIncoming = mappedMessages.some(
      (message) => !message.isRead && message.senderId && message.senderId !== currentUserId,
    );

    if (!hasUnreadIncoming) {
      return;
    }

    markReadInFlightRef.current = true;
    try {
      await markConversationMessagesRead(conversationId);
      setMessages((current) => current.map((message) => (
        message.senderId && message.senderId !== currentUserId
          ? { ...message, isRead: true }
          : message
      )));
    } catch {
      // Retry on the next load/poll.
    } finally {
      markReadInFlightRef.current = false;
    }
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadMessages() {
      setIsLoadingMessages(true);
      setMessagesError(null);

      try {
        const rows = await getConversationMessages(conversationId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = mapMessages(rows);
        setMessages(mapped);
        await markIncomingMessagesRead(mapped);
        onIncomingMessages?.(mapped);
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setMessagesError(resolveErrorMessage(loadError, t("parent.hooks.loadMessagesFailed")));
          setMessages([]);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoadingMessages(false);
        }
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [conversationId, currentUserId, refreshToken, markIncomingMessagesRead, onIncomingMessages, t]);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    let cancelled = false;

    async function pollMessages() {
      if (pollInFlightRef.current || isSendingRef.current) {
        return;
      }

      pollInFlightRef.current = true;

      try {
        const rows = await getConversationMessages(conversationId);
        if (cancelled) {
          return;
        }

        const mapped = mapMessages(rows);
        setMessages((current) => mergeMessages(current, mapped));
        await markIncomingMessagesRead(mapped);
        onIncomingMessages?.(mapped);
      } catch {
        // Silent poll failures are ignored.
      } finally {
        pollInFlightRef.current = false;
      }
    }

    const timer = window.setInterval(pollMessages, MESSAGE_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [conversationId, markIncomingMessagesRead, onIncomingMessages]);

  const setSendingState = useCallback((value) => {
    isSendingRef.current = value;
  }, []);

  return {
    messages,
    isLoadingMessages,
    messagesError,
    refetchMessages,
    appendMessage,
    setSendingState,
  };
}

export function useParentMessageComposer({ conversationId, onSendSuccess, setSendingState }) {
  const { t } = useLocale();
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [sendError, setSendError] = useState(null);
  const sendGuardRef = useRef(false);

  const sendMessage = useCallback(async (rawContent, pendingAttachment = null) => {
    const content = rawContent?.trim() ?? "";
    const attachmentFile = pendingAttachment?.file;
    const hasAttachment = attachmentFile instanceof File;

    if ((!content && !hasAttachment) || !conversationId || sendGuardRef.current || isSending) {
      return { ok: false };
    }

    sendGuardRef.current = true;
    setIsSending(true);
    setSendingState?.(true);
    setSendError(null);
    setUploadProgress(null);

    try {
      let row;

      if (hasAttachment) {
        const uploaded = await uploadMessageAttachment(
          attachmentFile,
          (progress) => setUploadProgress(progress),
        );
        const fileUrl = uploaded?.url;
        if (!fileUrl) {
          throw new Error(t("parent.common.somethingWrong"));
        }

        row = await sendConversationAttachmentMessage(conversationId, {
          fileUrl,
          fileType: uploaded?.mimetype || pendingAttachment.mimeType,
          content: content || undefined,
        });
      } else {
        row = await sendConversationMessage(conversationId, content);
      }

      const mapped = mapMessage(row);
      onSendSuccess?.(mapped);
      return { ok: true, message: mapped };
    } catch (error) {
      const message = resolveErrorMessage(error, t("parent.hooks.sendMessageFailed"));
      setSendError(message);
      return { ok: false, message };
    } finally {
      sendGuardRef.current = false;
      setIsSending(false);
      setSendingState?.(false);
      setUploadProgress(null);
    }
  }, [conversationId, isSending, onSendSuccess, setSendingState, t]);

  const clearSendError = useCallback(() => {
    setSendError(null);
  }, []);

  return { isSending, uploadProgress, sendError, sendMessage, clearSendError };
}
