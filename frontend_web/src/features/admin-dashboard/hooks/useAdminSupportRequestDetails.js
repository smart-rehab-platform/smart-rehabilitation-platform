import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  loadAdminSupportRequestDetails,
  replyToAdminSupportRequest,
  updateAdminSupportRequestStatus,
  uploadSupportRequestAttachment,
} from "../../../services/adminSupportRequestsService";
import { getAdminSupportRequestsLabels } from "../utils/adminSupportRequestsLocalization.js";
import {
  mapSupportRequestDetails,
  validateSupportRequestAttachmentFile,
} from "../../shared-dashboard/utils/supportRequestMappers";
import { translateSupportRequestKey } from "../../shared-dashboard/utils/supportRequestLocalization.js";

function resolveSupportRequestErrorMessage(error, fallback, t = null) {
  const message = error instanceof Error ? error.message : fallback;

  if (message === "Attachment upload succeeded but no URL was returned.") {
    return translateSupportRequestKey(
      t,
      "supportRequests.errors.attachmentUrlMissing",
      "Attachment upload did not return a file URL.",
    );
  }

  return message;
}

export function useAdminSupportRequestDetails(requestId, adminUserId) {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(
    () => ({ currentUserId: adminUserId, t, locale }),
    [adminUserId, t, locale],
  );
  const labels = useMemo(() => getAdminSupportRequestsLabels(t), [t]);
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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!requestId) {
      setRequest(null);
      setIsLoading(false);
      setError(labels.notFound);
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
        const row = await loadAdminSupportRequestDetails(requestId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = mapSupportRequestDetails(row, mapperOptions);
        if (!mapped) {
          setRequest(null);
          setError(labels.notFound);
          setErrorStatus(404);
          return;
        }

        setRequest(mapped);
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setRequest(null);
          setError(resolveSupportRequestErrorMessage(loadError, labels.loadFailed, t));
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
  }, [labels, mapperOptions, requestId, refreshToken]);

  const handleSelectAttachment = useCallback((file) => {
    const validationMessage = validateSupportRequestAttachmentFile(file, t);
    if (validationMessage) {
      setAttachmentError(validationMessage);
      return;
    }

    setAttachmentError(null);
    setAttachmentFile(file);
    setReplyError(null);
  }, [t]);

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
      setReplyError(labels.toast.replyFailed);
      return { ok: false, message: labels.toast.replyFailed };
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

      const updated = await replyToAdminSupportRequest(requestId, {
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
      const message = resolveSupportRequestErrorMessage(sendError, labels.toast.replyFailed, t);
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
    labels,
    mapperOptions,
    t,
  ]);

  const updateStatus = useCallback(async (status) => {
    if (!requestId || !request || isUpdatingStatus) {
      return { ok: false };
    }

    setIsUpdatingStatus(true);
    setStatusError(null);

    try {
      const updated = await updateAdminSupportRequestStatus(requestId, status);
      const mapped = mapSupportRequestDetails(updated, mapperOptions);
      setRequest(mapped);
      return { ok: true };
    } catch (updateError) {
      const message = updateError instanceof Error
        ? updateError.message
        : labels.toast.statusUpdateFailed;
      setStatusError(message);
      return { ok: false, message };
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [requestId, request, isUpdatingStatus, mapperOptions, labels]);

  return {
    labels,
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
    isUpdatingStatus,
    statusError,
    updateStatus,
  };
}
