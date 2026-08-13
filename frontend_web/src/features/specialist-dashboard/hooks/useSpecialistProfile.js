import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCurrentUserProfile,
  getSpecialistProfiles,
} from "../../../services/specialistProfileService";
import {
  findSpecialistProfileRow,
  mapSpecialistProfileBundle,
} from "../utils/specialistProfileMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistProfile(userId) {
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
        const [userRow, specialistRows] = await Promise.all([
          getCurrentUserProfile(),
          getSpecialistProfiles(),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const specialistRow = findSpecialistProfileRow(specialistRows, userId);
        setProfile(mapSpecialistProfileBundle(userRow, specialistRow));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setProfile(null);
          setError(resolveErrorMessage(loadError, "Failed to load profile."));
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
  }, [userId, refreshToken]);

  return {
    profile,
    isLoading,
    error,
    refetch,
    replaceProfile,
  };
}
