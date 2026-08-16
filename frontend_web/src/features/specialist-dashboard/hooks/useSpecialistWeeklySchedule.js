import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { loadSpecialistScheduleSessions } from "../../../services/specialistDashboardService";
import { subscribeSpecialistSessionRefresh } from "../utils/specialistSessionRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistWeeklySchedule(specialistUserId) {
  const { t, locale } = useLocale();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => subscribeSpecialistSessionRefresh(reload), [reload]);

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
        const nextSessions = await loadSpecialistScheduleSessions(specialistUserId, { locale });

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setSessions(nextSessions);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setSessions([]);
        setError(resolveErrorMessage(loadError, t("specialist.dashboard.errors.scheduleLoadFailed")));
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
  }, [specialistUserId, refreshToken, locale, t]);

  if (!specialistUserId) {
    return {
      sessions: [],
      isLoading: false,
      error: t("specialist.dashboard.errors.scheduleSignInRequired"),
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
