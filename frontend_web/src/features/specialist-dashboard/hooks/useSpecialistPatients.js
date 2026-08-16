import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { loadSpecialistPatients } from "../../../services/specialistPatientService";
import { mapSpecialistPatientList } from "../utils/specialistPatientMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistPatients(specialistUserId) {
  const { t } = useLocale();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const loadFailedMessage = t("specialist.patients.errors.loadFailed");

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!specialistUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadPatients() {
      setIsLoading(true);
      setError(null);
      setPatients([]);

      try {
        const rows = await loadSpecialistPatients(specialistUserId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setPatients(mapSpecialistPatientList(rows));
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setPatients([]);
        setError(resolveErrorMessage(loadError, loadFailedMessage));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadPatients();

    return () => {
      cancelled = true;
    };
  }, [specialistUserId, refreshToken, loadFailedMessage]);

  if (!specialistUserId) {
    return {
      patients: [],
      isLoading: false,
      error: null,
      refetch,
    };
  }

  return {
    patients,
    isLoading,
    error,
    refetch,
  };
}
