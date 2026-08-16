import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getUserPresence } from "../../../services/specialistPresenceService";
import { formatSpecialistPresenceLabel } from "../utils/specialistMessagesLocalization.js";

function readPresenceField(record, keys) {
  if (!record || typeof record !== "object") {
    return null;
  }

  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  return null;
}

export function formatPresenceLabel(presence, locale = "en", t = null) {
  return formatSpecialistPresenceLabel(presence, locale, t);
}

export function useSpecialistPresence(userId) {
  const { t, locale } = useLocale();
  const [presence, setPresence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadPresence() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getUserPresence(userId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setPresence(data);
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setPresence(null);
          setError(loadError instanceof Error ? loadError.message : "Failed to load presence.");
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadPresence();
    const timer = window.setInterval(loadPresence, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [userId, refreshToken]);

  const label = useMemo(
    () => formatSpecialistPresenceLabel(presence, locale, t),
    [presence, locale, t],
  );

  const isOnline = Boolean(
    readPresenceField(presence, ["is_online", "isOnline"]),
  );

  if (!userId) {
    return {
      presence: null,
      label: formatSpecialistPresenceLabel(null, locale, t),
      isOnline: false,
      isLoading: false,
      error: null,
      refresh,
    };
  }

  return {
    presence,
    label,
    isOnline,
    isLoading,
    error,
    refresh,
  };
}
