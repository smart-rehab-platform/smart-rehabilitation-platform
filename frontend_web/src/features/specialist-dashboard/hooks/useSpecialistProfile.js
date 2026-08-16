import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getCurrentUserProfile,
  getSpecialistProfiles,
} from "../../../services/specialistProfileService";
import {
  applySpecialistProfileLocalization,
  getSpecialistProfileErrorMessages,
} from "../utils/specialistProfileLocalization.js";
import {
  findSpecialistProfileRow,
  mapSpecialistProfileBundle,
} from "../utils/specialistProfileMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistProfile(userId) {
  const { t } = useLocale();
  const errorMessages = useMemo(() => getSpecialistProfileErrorMessages(t), [t]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
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

    async function loadProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const [userRow, specialistRows] = await Promise.all([
          getCurrentUserProfile(),
          getSpecialistProfiles(),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const specialistRow = findSpecialistProfileRow(specialistRows, userId);
        setProfile(applySpecialistProfileLocalization(
          mapSpecialistProfileBundle(userRow, specialistRow),
          { t },
        ));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setProfile(null);
          setError(resolveErrorMessage(loadError, errorMessages.loadFailed));
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
  }, [userId, refreshToken, t, errorMessages.loadFailed]);

  return {
    profile,
    isLoading,
    error,
    refetch,
    replaceProfile: useCallback((nextProfile) => {
      setProfile(applySpecialistProfileLocalization(nextProfile, { t }));
    }, [t]),
  };
}
