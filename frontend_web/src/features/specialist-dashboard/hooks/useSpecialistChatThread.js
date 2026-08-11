import { useCallback, useEffect, useRef, useState } from "react";
import {
  getConversationMessages,
  markMessageRead,
  sendConversationAttachmentMessage,
  sendConversationMessage,
  uploadMessageAttachment,
} from "../../../services/specialistCommunicationService";
import { mapSpecialistMessage, mapSpecialistMessages } from "../utils/specialistMessagesUtils";

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

export function useSpecialistChatThread(conversationId, currentUserId, options = {}) {
  const { enabled = true, onIncomingMessages } = options;
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(Boolean(conversationId));
  const [messagesError, setMessagesError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);
  const pollInFlightRef = useRef(false);
  const markedReadIdsRef = useRef(new Set());
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
    if (!currentUserId) {
      return;
    }

    const unreadFromOthers = mappedMessages.filter(
      (message) => !message.isRead
        && message.senderId
        && message.senderId !== currentUserId
        && !markedReadIdsRef.current.has(message.id),
    );

    if (unreadFromOthers.length === 0) {
      return;
    }

    await Promise.all(unreadFromOthers.map(async (message) => {
      markedReadIdsRef.current.add(message.id);
      try {
        await markMessageRead(message.id);
      } catch {
        markedReadIdsRef.current.delete(message.id);
      }
    }));

    setMessages((current) => current.map((message) => (
      unreadFromOthers.some((item) => item.id === message.id)
        ? { ...message, isRead: true }
        : message
    )));
  }, [currentUserId]);

  useEffect(() => {
    markedReadIdsRef.current = new Set();

    if (!conversationId || !enabled) {
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

        const mapped = mapSpecialistMessages(rows);
        setMessages(mapped);
        await markIncomingMessagesRead(mapped);
        onIncomingMessages?.(mapped);
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setMessages([]);
          setMessagesError(resolveErrorMessage(loadError, "Failed to load messages."));
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
  }, [conversationId, enabled, refreshToken, markIncomingMessagesRead, onIncomingMessages]);

  useEffect(() => {
    if (!conversationId || !enabled) {
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

        const mapped = mapSpecialistMessages(rows);
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
  }, [conversationId, enabled, markIncomingMessagesRead, onIncomingMessages]);

  const setSendingState = useCallback((value) => {
    isSendingRef.current = value;
  }, []);

  return {
    messages: conversationId && enabled ? messages : [],
    isLoadingMessages: conversationId && enabled ? isLoadingMessages : false,
    messagesError: conversationId && enabled ? messagesError : null,
    refetchMessages,
    appendMessage,
    setSendingState,
  };
}

export function useSpecialistMessageComposer({ conversationId, onSendSuccess, setSendingState }) {
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

      const mapped = mapSpecialistMessage(row);
      onSendSuccess?.(mapped);
      return { ok: true, message: mapped };
    } catch (error) {
      const message = resolveErrorMessage(error, "Failed to send message.");
      setSendError(message);
      return { ok: false, message };
    } finally {
      sendGuardRef.current = false;
      setIsSending(false);
      setSendingState?.(false);
      setUploadProgress(null);
    }
  }, [conversationId, isSending, onSendSuccess, setSendingState]);

  const clearSendError = useCallback(() => {
    setSendError(null);
  }, []);

  return { isSending, uploadProgress, sendError, sendMessage, clearSendError };
}
