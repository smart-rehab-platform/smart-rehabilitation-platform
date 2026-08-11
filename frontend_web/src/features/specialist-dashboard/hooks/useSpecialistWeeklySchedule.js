import { useCallback, useEffect, useRef, useState } from "react";
import { loadSpecialistScheduleSessions } from "../../../services/specialistDashboardService";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

const SIGNED_OUT_ERROR = "Please sign in to view the specialist schedule.";

export function useSpecialistWeeklySchedule(specialistUserId) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!specialistUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadSchedule() {
      setIsLoading(true);
      setError(null);

      try {
        const nextSessions = await loadSpecialistScheduleSessions(specialistUserId);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setSessions(nextSessions);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setSessions([]);
        setError(resolveErrorMessage(loadError, "Failed to load weekly schedule."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [specialistUserId, refreshToken]);

  if (!specialistUserId) {
    return {
      sessions: [],
      isLoading: false,
      error: SIGNED_OUT_ERROR,
      reload,
    };
  }

  return {
    sessions,
    isLoading,
    error,
    reload,
  };
}
