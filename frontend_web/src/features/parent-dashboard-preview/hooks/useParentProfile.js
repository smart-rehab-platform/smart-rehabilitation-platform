import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getCurrentUserProfile,
  getParentProfiles,
} from "../../../services/parentProfileService";
import {
  findParentProfileRow,
  mapProfileBundle,
} from "../utils/parentProfileUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentProfile(userId) {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const replaceProfile = useCallback((nextProfile) => {
    setProfile(nextProfile);
  }, []);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const [userRow, parentRows] = await Promise.all([
          getCurrentUserProfile(),
          getParentProfiles(),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const parentRow = findParentProfileRow(parentRows, userId);
        setProfile(mapProfileBundle(userRow, parentRow, mapperOptions));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setProfile(null);
          setError(resolveErrorMessage(loadError, t("parent.hooks.loadProfileFailed")));
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [userId, refreshToken, mapperOptions, t]);

  return {
    profile,
    isLoading,
    error,
    refetch,
    replaceProfile,
  };
}
