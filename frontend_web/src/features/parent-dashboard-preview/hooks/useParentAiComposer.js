import { useCallback, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  askAiAssistant,
  sendAiMessage,
} from "../../../services/parentAiChatService";
import {
  mapSendMessageResponse,
  rememberConversationPatient,
} from "../utils/parentAiAssistantUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function readHttpStatus(error) {
  return error?.statusCode ?? error?.response?.status ?? error?.status ?? null;
}

async function sendWithFallback(conversationId, content, patientId) {
  if (!conversationId) {
    return askAiAssistant(content, { patientId });
  }

  try {
    return await sendAiMessage(conversationId, content, patientId);
  } catch (error) {
    if (readHttpStatus(error) === 404) {
      return askAiAssistant(content, { conversationId, patientId });
    }
    throw error;
  }
}

export function useParentAiComposer({
  conversationId,
  patientId,
  childNameByPatientId,
  onSendSuccess,
}) {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const sendGuardRef = useRef(false);

  const sendMessage = useCallback(async (rawContent) => {
    const content = rawContent?.trim() ?? "";
    if (!content || sendGuardRef.current || isSending) {
      return { ok: false, reason: "invalid" };
    }

    sendGuardRef.current = true;
    setIsSending(true);
    setSendError(null);

    try {
      const data = await sendWithFallback(conversationId, content, patientId);
      const mapped = mapSendMessageResponse(data, childNameByPatientId, mapperOptions);

      if (mapped.conversation?.id) {
        rememberConversationPatient(mapped.conversation.id, patientId);
      }

      onSendSuccess?.(mapped);
      return { ok: true, mapped };
    } catch (error) {
      const message = resolveErrorMessage(error, t("parent.hooks.sendAiMessageFailed"));
      setSendError(message);
      return { ok: false, reason: "error", message, content };
    } finally {
      sendGuardRef.current = false;
      setIsSending(false);
    }
  }, [
    conversationId,
    patientId,
    childNameByPatientId,
    isSending,
    onSendSuccess,
    mapperOptions,
    t,
  ]);

  const clearSendError = useCallback(() => {
    setSendError(null);
  }, []);

  return {
    isSending,
    sendError,
    sendMessage,
    clearSendError,
  };
}
