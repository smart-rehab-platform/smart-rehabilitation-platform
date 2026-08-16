import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getUserConversations } from "../../../services/specialistCommunicationService";
import {
  applySpecialistConversationLocalization,
  getSpecialistMessagesErrorMessages,
} from "../utils/specialistMessagesLocalization.js";
import { mapSpecialistConversations } from "../utils/specialistMessagesUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistConversations(userId) {
  const { t, locale } = useLocale();
  const errorMessages = useMemo(() => getSpecialistMessagesErrorMessages(t), [t]);
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
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

        setConversations(mapSpecialistConversations(rows));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setConversations([]);
          setError(resolveErrorMessage(loadError, errorMessages.loadConversationsFailed));
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
  }, [userId, refreshToken, errorMessages.loadConversationsFailed]);

  const localizedConversations = useMemo(
    () => conversations.map((conversation) => applySpecialistConversationLocalization(
      conversation,
      mapperContext,
    )),
    [conversations, mapperContext],
  );

  if (!userId) {
    return {
      conversations: [],
      isLoading: false,
      error: errorMessages.signInRequired,
      refetch,
    };
  }

  return { conversations: localizedConversations, isLoading, error, refetch };
}
