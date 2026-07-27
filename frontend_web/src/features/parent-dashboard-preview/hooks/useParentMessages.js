import { useCallback, useEffect, useRef, useState } from "react";
import {
  getConversationMessages,
  getUserConversations,
  markMessageRead,
  sendConversationAttachmentMessage,
  sendConversationMessage,
  uploadMessageAttachment,
} from "../../../services/parentCommunicationService";
import { mapConversations, mapMessage, mapMessages } from "../utils/parentMessagesUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentMessages(userId) {
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
        setConversations(mapConversations(rows));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, "Failed to load conversations."));
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
  }, [userId, refreshToken]);

  if (!userId) {
    return {
      conversations: [],
      isLoading: false,
      error: "Please sign in to view messages.",
      refetch,
      upsertConversation,
    };
  }

  return { conversations, isLoading, error, refetch, upsertConversation };
}

export function useParentConversation(conversationId, currentUserId) {
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(Boolean(conversationId));
  const [messagesError, setMessagesError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetchMessages = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const appendMessage = useCallback((message) => {
    if (!message?.id) {
      return;
    }

    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) {
        return current;
      }
      return [...current, message];
    });
  }, []);

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

        const unreadFromOthers = mapped.filter(
          (message) => !message.isRead && message.senderId !== currentUserId,
        );

        await Promise.all(
          unreadFromOthers.map((message) => markMessageRead(message.id).catch(() => null)),
        );
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setMessagesError(resolveErrorMessage(loadError, "Failed to load messages."));
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
  }, [conversationId, currentUserId, refreshToken]);

  return {
    messages,
    isLoadingMessages,
    messagesError,
    refetchMessages,
    appendMessage,
  };
}

export function useParentMessageComposer({ conversationId, onSendSuccess }) {
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
          throw new Error("Attachment upload did not return a file URL.");
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
      const message = resolveErrorMessage(error, "Failed to send message.");
      setSendError(message);
      return { ok: false, message };
    } finally {
      sendGuardRef.current = false;
      setIsSending(false);
      setUploadProgress(null);
    }
  }, [conversationId, isSending, onSendSuccess]);

  const clearSendError = useCallback(() => {
    setSendError(null);
  }, []);

  return { isSending, uploadProgress, sendError, sendMessage, clearSendError };
}
