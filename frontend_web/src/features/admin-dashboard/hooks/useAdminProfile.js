import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getCurrentUserProfile } from "../../../services/adminProfileService";
import {
  applyAdminProfileLocalization,
  getAdminProfileErrorMessages,
  localizeProfileErrorMessage,
} from "../utils/adminProfileLocalization.js";
import { mapAdminProfileFromUser } from "../utils/adminProfileUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminProfile(userId) {
  const { t, locale } = useLocale();
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const errorMessages = useMemo(() => getAdminProfileErrorMessages(t), [t]);
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
        const userRow = await getCurrentUserProfile();

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setProfile(mapAdminProfileFromUser(userRow));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setProfile(null);
          setError(
            localizeProfileErrorMessage(
              resolveErrorMessage(loadError, errorMessages.loadFailed),
              t,
            ),
          );
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
  }, [errorMessages.loadFailed, t, userId, refreshToken]);

  const localizedProfile = useMemo(
    () => applyAdminProfileLocalization(profile, mapperContext),
    [profile, mapperContext],
  );

  return {
    profile: localizedProfile,
    isLoading,
    error,
    refetch,
    replaceProfile,
  };
}
