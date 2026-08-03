import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAiConversation,
  getAiConversationMessages,
} from "../../../services/parentAiChatService";
import {
  getConversationPatientId,
  mapMessageRowsToHubItems,
  rememberConversationPatient,
} from "../utils/parentAiAssistantUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentAiConversation(conversationId, patientId = null) {
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(Boolean(conversationId));
  const [messagesError, setMessagesError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetchMessages = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const appendMessages = useCallback((incoming) => {
    const items = Array.isArray(incoming) ? incoming : [incoming];
    setMessages((current) => {
      const knownIds = new Set(current.map((message) => message.id));
      const merged = [...current];
      items.forEach((item) => {
        if (item?.id && !knownIds.has(item.id)) {
          merged.push(item);
          knownIds.add(item.id);
        }
      });
      return merged.sort((left, right) => (left.createdAtMs ?? 0) - (right.createdAtMs ?? 0));
    });
  }, []);

  const replaceMessages = useCallback((incoming) => {
    setMessages(Array.isArray(incoming) ? incoming : []);
  }, []);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadConversation() {
      setIsLoadingMessages(true);
      setMessagesError(null);

      try {
        await getAiConversation(conversationId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const storedPatientId = getConversationPatientId(conversationId);
        if (storedPatientId && patientId && storedPatientId !== patientId) {
          setMessages([]);
          setMessagesError("This conversation belongs to another child.");
          return;
        }

        if (patientId && !storedPatientId) {
          rememberConversationPatient(conversationId, patientId);
        }

        const rows = await getAiConversationMessages(conversationId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setMessages(mapMessageRowsToHubItems(rows));
      } catch (error) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setMessages([]);
          setMessagesError(resolveErrorMessage(error, "Failed to load message history."));
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoadingMessages(false);
        }
      }
    }

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [conversationId, patientId, refreshToken]);

  return {
    messages: conversationId ? messages : [],
    isLoadingMessages: Boolean(conversationId) && isLoadingMessages,
    messagesError: conversationId ? messagesError : null,
    refetchMessages,
    appendMessages,
    replaceMessages,
  };
}
