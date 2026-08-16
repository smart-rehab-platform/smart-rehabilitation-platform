import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getChildren,
  getChildrenProgress,
} from "../../../services/parentDashboardService";
import {
  createAiConversation,
  getAiConversations,
} from "../../../services/parentAiChatService";
import { mergeChildren } from "../utils/parentDashboardMappers";
import {
  filterConversationsForChild,
  isLinkedChildId,
  mapConversationRowsToHubItems,
  rememberConversationPatient,
} from "../utils/parentAiAssistantUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function buildChildNameLookup(children) {
  return Object.fromEntries(
    children
      .filter((child) => child?.id && child?.fullName)
      .map((child) => [child.id, child.fullName]),
  );
}

export function useParentAiConversations(parentUserId, selectedChildId) {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);
  const [children, setChildren] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(Boolean(parentUserId));
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [childrenError, setChildrenError] = useState(null);
  const [conversationsError, setConversationsError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const createTokenRef = useRef(0);
  const loadTokenRef = useRef(0);

  const refetchConversations = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!parentUserId) {
      return undefined;
    }

    let cancelled = false;

    async function loadChildren() {
      setIsLoadingChildren(true);
      setChildrenError(null);

      try {
        const [childrenRows, progressRows] = await Promise.all([
          getChildren(parentUserId),
          getChildrenProgress(),
        ]);

        if (!cancelled) {
          setChildren(mergeChildren(childrenRows, progressRows));
        }
      } catch (error) {
        if (!cancelled) {
          setChildren([]);
          setChildrenError(resolveErrorMessage(error, t("parent.hooks.loadAiChildrenFailed")));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingChildren(false);
        }
      }
    }

    loadChildren();

    return () => {
      cancelled = true;
    };
  }, [parentUserId, t]);

  useEffect(() => {
    if (!parentUserId || isLoadingChildren) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadConversations() {
      setIsLoadingConversations(true);
      setConversationsError(null);

      try {
        const rows = await getAiConversations();
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const childNameByPatientId = buildChildNameLookup(children);
        setConversations(mapConversationRowsToHubItems(rows, childNameByPatientId, mapperOptions));
      } catch (error) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setConversations([]);
          setConversationsError(resolveErrorMessage(error, t("parent.hooks.loadAiConversationsFailed")));
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoadingConversations(false);
        }
      }
    }

    loadConversations();

    return () => {
      cancelled = true;
    };
  }, [parentUserId, refreshToken, isLoadingChildren, children, mapperOptions, t]);

  const childNameByPatientId = useMemo(
    () => buildChildNameLookup(children),
    [children],
  );

  const validChildId = useMemo(() => {
    if (isLinkedChildId(selectedChildId, children)) {
      return selectedChildId;
    }
    if (children.length === 1) {
      return children[0].id;
    }
    return null;
  }, [selectedChildId, children]);

  const visibleConversations = useMemo(
    () => filterConversationsForChild(conversations, validChildId),
    [conversations, validChildId],
  );

  const upsertConversation = useCallback((conversation) => {
    if (!conversation?.id) {
      return;
    }

    setConversations((current) => {
      const filtered = current.filter((item) => item.id !== conversation.id);
      return [conversation, ...filtered].sort(
        (left, right) => (right.updatedAtMs ?? 0) - (left.updatedAtMs ?? 0),
      );
    });
  }, []);

  const createConversation = useCallback(async () => {
    if (!validChildId || isCreatingConversation) {
      return null;
    }

    const createToken = createTokenRef.current + 1;
    createTokenRef.current = createToken;
    setIsCreatingConversation(true);
    setConversationsError(null);

    try {
      const row = await createAiConversation(validChildId);
      if (createTokenRef.current !== createToken) {
        return null;
      }

      rememberConversationPatient(row?.id, validChildId);
      const mapped = mapConversationRowsToHubItems([row], childNameByPatientId, mapperOptions)[0];
      if (mapped) {
        const enriched = {
          ...mapped,
          patientId: validChildId,
          childName: childNameByPatientId[validChildId] ?? null,
        };
        upsertConversation(enriched);
        return enriched;
      }

      refetchConversations();
      return mapped;
    } catch (error) {
      if (createTokenRef.current === createToken) {
        setConversationsError(resolveErrorMessage(error, t("parent.hooks.createAiConversationFailed")));
      }
      return null;
    } finally {
      if (createTokenRef.current === createToken) {
        setIsCreatingConversation(false);
      }
    }
  }, [
    validChildId,
    isCreatingConversation,
    childNameByPatientId,
    mapperOptions,
    refetchConversations,
    upsertConversation,
    t,
  ]);

  return {
    children,
    conversations: visibleConversations,
    childNameByPatientId,
    validChildId,
    isLoadingChildren,
    isLoadingConversations,
    isCreatingConversation,
    childrenError,
    conversationsError,
    refetchConversations,
    createConversation,
    upsertConversation,
  };
}
