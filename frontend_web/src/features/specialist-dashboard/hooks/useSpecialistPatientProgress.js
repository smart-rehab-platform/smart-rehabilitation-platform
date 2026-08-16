import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { loadSpecialistPatientProgress } from "../../../services/specialistDashboardService";
import {
  applySpecialistPatientProgressListLocalization,
  getSpecialistProgressErrorMessages,
} from "../utils/specialistProgressLocalization.js";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistPatientProgress(specialistUserId) {
  const { t, locale } = useLocale();
  const errorMessages = getSpecialistProgressErrorMessages(t);
  const [progressItems, setProgressItems] = useState([]);
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

    async function loadProgress() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await loadSpecialistPatientProgress(specialistUserId);
        const nextItems = applySpecialistPatientProgressListLocalization(rows, { t, locale });

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setProgressItems(nextItems);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setProgressItems([]);
        setError(resolveErrorMessage(loadError, errorMessages.loadFailed));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [specialistUserId, refreshToken, t, locale, errorMessages.loadFailed]);

  if (!specialistUserId) {
    return {
      progressItems: [],
      isLoading: false,
      error: errorMessages.signInRequired,
      reload,
    };
  }

  return {
    progressItems,
    isLoading,
    error,
    reload,
  };
}
