import { useCallback, useEffect, useRef, useState } from "react";
import { getUserConversations } from "../../../services/specialistCommunicationService";
import { mapSpecialistConversations } from "../utils/specialistMessagesUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistConversations(userId) {
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
          setError(resolveErrorMessage(loadError, "Failed to load conversations."));
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
    };
  }

  return { conversations, isLoading, error, refetch };
}
