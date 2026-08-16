import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  loadSpecialistSupportRequestDetails,
  replyToSpecialistSupportRequest,
  uploadSupportRequestAttachment,
} from "../../../services/specialistSupportRequestsService";
import {
  mapSupportRequestDetails,
  validateSupportRequestAttachmentFile,
} from "../../shared-dashboard/utils/supportRequestMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistSupportRequestDetails(requestId, specialistUserId) {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(
    () => ({ currentUserId: specialistUserId, t, locale }),
    [specialistUserId, t, locale],
  );
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(requestId));
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const [replyContent, setReplyContent] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentError, setAttachmentError] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState(null);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!requestId) {
      setRequest(null);
      setIsLoading(false);
      setError("Support request not found.");
      setErrorStatus(404);
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setErrorStatus(null);

      try {
        const row = await loadSpecialistSupportRequestDetails(requestId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = mapSupportRequestDetails(row, mapperOptions);
        if (!mapped) {
          setRequest(null);
          setError("Support request not found.");
          setErrorStatus(404);
          return;
        }

        setRequest(mapped);
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setRequest(null);
          setError(resolveErrorMessage(loadError, "Failed to load support request."));
          setErrorStatus(loadError?.status ?? null);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [requestId, mapperOptions, refreshToken]);

  const handleSelectAttachment = useCallback((file) => {
    const validationMessage = validateSupportRequestAttachmentFile(file);
    if (validationMessage) {
      setAttachmentError(validationMessage);
      return;
    }

    setAttachmentError(null);
    setAttachmentFile(file);
    setReplyError(null);
  }, []);

  const clearAttachment = useCallback(() => {
    setAttachmentFile(null);
    setAttachmentError(null);
  }, []);

  const sendReply = useCallback(async () => {
    if (!requestId || !request || request.isResolved || isReplying) {
      return { ok: false };
    }

    const trimmedContent = replyContent.trim();
    if (!trimmedContent && !attachmentFile) {
      setReplyError("Message content or attachment is required.");
      return { ok: false, message: "Message content or attachment is required." };
    }

    setIsReplying(true);
    setReplyError(null);

    try {
      let attachmentUrl = null;
      if (attachmentFile) {
        const uploaded = await uploadSupportRequestAttachment(attachmentFile);
        attachmentUrl = uploaded?.url ?? null;
        if (!attachmentUrl) {
          throw new Error("Attachment upload succeeded but no URL was returned.");
        }
      }

      const updated = await replyToSpecialistSupportRequest(requestId, {
        content: trimmedContent,
        attachment_url: attachmentUrl,
      });

      const mapped = mapSupportRequestDetails(updated, mapperOptions);
      setRequest(mapped);
      setReplyContent("");
      setAttachmentFile(null);
      setAttachmentError(null);
      return { ok: true };
    } catch (sendError) {
      const message = resolveErrorMessage(sendError, "Failed to send reply.");
      setReplyError(message);
      return { ok: false, message };
    } finally {
      setIsReplying(false);
    }
  }, [
    requestId,
    request,
    isReplying,
    replyContent,
    attachmentFile,
    mapperOptions,
  ]);

  return {
    request,
    isLoading,
    error,
    errorStatus,
    refetch,
    replyContent,
    setReplyContent,
    attachmentFile,
    attachmentError,
    handleSelectAttachment,
    clearAttachment,
    isReplying,
    replyError,
    sendReply,
  };
}
