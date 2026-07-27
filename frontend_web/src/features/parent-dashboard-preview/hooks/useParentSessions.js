import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getChildren,
  getChildrenProgress,
  getSessions,
} from "../../../services/parentDashboardService";
import { mergeChildren } from "../utils/parentDashboardMappers";
import { mapSessionRowsToHubItems } from "../utils/parentSessionsUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentSessions(parentUserId) {
  const [children, setChildren] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(parentUserId));
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!parentUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadSessionsHub() {
      setIsLoading(true);
      setError(null);

      try {
        const [childrenRows, progressRows, sessionRows] = await Promise.all([
          getChildren(parentUserId),
          getChildrenProgress(),
          getSessions(parentUserId),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setChildren(mergeChildren(childrenRows, progressRows));
        setSessions(mapSessionRowsToHubItems(sessionRows));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, "Failed to load sessions."));
          setSessions([]);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadSessionsHub();

    return () => {
      cancelled = true;
    };
  }, [parentUserId, refreshToken]);

  const counts = useMemo(() => ({
    upcoming: sessions.filter((session) => session.isUpcoming).length,
    history: sessions.filter((session) => session.isPast).length,
  }), [sessions]);

  if (!parentUserId) {
    return {
      children: [],
      sessions: [],
      counts: { upcoming: 0, history: 0 },
      isLoading: false,
      error: "Please sign in to view sessions.",
      refetch,
    };
  }

  return {
    children,
    sessions,
    counts,
    isLoading,
    error,
    refetch,
  };
}
