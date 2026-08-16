import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  assignSpecialistToCaseRequest,
  fetchMatchingSpecialists,
} from "../../../services/adminCaseRequestsService";
import {
  applyAdminMatchingSpecialistsLocalization,
  friendlyCaseAssignmentErrorLocalized,
  getAdminCaseRequestsLabels,
} from "../utils/adminCaseRequestsLocalization.js";
import {
  isStalePendingAssignmentError,
  mapMatchingSpecialist,
} from "../utils/adminCaseRequestsMappers.js";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminCaseRequestSpecialists(requestId) {
  const { t, locale } = useLocale();
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const labels = useMemo(() => getAdminCaseRequestsLabels(t), [t]);
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [assignmentError, setAssignmentError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const localizedSpecialists = useMemo(
    () => applyAdminMatchingSpecialistsLocalization(specialists, mapperContext),
    [mapperContext, specialists],
  );

  const selectedSpecialist = useMemo(
    () => localizedSpecialists.find((specialist) => specialist.id === selectedSpecialistId) ?? null,
    [localizedSpecialists, selectedSpecialistId],
  );

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const normalizedId = typeof requestId === "string" ? requestId.trim() : "";
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadSpecialists() {
      if (!normalizedId) {
        setSpecialists([]);
        setSelectedSpecialistId(null);
        setError(labels.notFound);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setAssignmentError(null);

      try {
        const rows = await fetchMatchingSpecialists(normalizedId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = rows.map(mapMatchingSpecialist).filter(Boolean);
        setSpecialists(mapped);
        setSelectedSpecialistId((current) => (
          current && mapped.some((specialist) => specialist.id === current) ? current : null
        ));
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setSpecialists([]);
        setSelectedSpecialistId(null);
        setError(resolveErrorMessage(loadError, labels.toast.loadSpecialistsFailed));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadSpecialists();

    return () => {
      cancelled = true;
    };
  }, [labels, requestId, refreshToken]);

  const selectSpecialist = useCallback((specialistId) => {
    if (isAssigning) {
      return;
    }

    const normalized = typeof specialistId === "string" ? specialistId.trim() : "";
    if (!normalized || !specialists.some((specialist) => specialist.id === normalized)) {
      return;
    }

    setSelectedSpecialistId(normalized);
    setAssignmentError(null);
  }, [isAssigning, specialists]);

  const assignSelectedSpecialist = useCallback(async () => {
    const normalizedId = typeof requestId === "string" ? requestId.trim() : "";
    const specialistId = selectedSpecialistId?.trim();

    if (!normalizedId) {
      return { ok: false, message: labels.notFound };
    }

    if (!specialistId) {
      return { ok: false, message: labels.specialistsPage.subtitle };
    }

    if (isAssigning) {
      return { ok: false, message: labels.dialogs.assigning };
    }

    setIsAssigning(true);
    setAssignmentError(null);

    try {
      await assignSpecialistToCaseRequest(normalizedId, specialistId);
      return { ok: true, message: labels.toast.assignSuccess };
    } catch (assignError) {
      const rawMessage = resolveErrorMessage(assignError, labels.toast.assignFailed);
      const message = friendlyCaseAssignmentErrorLocalized(rawMessage, mapperContext);
      setAssignmentError(message);

      if (isStalePendingAssignmentError(rawMessage)) {
        return { ok: false, stale: true, message };
      }

      return { ok: false, message };
    } finally {
      setIsAssigning(false);
    }
  }, [isAssigning, labels, mapperContext, requestId, selectedSpecialistId]);

  return {
    specialists: localizedSpecialists,
    selectedSpecialist,
    selectedSpecialistId,
    isLoading,
    isAssigning,
    error,
    assignmentError,
    reload,
    selectSpecialist,
    assignSelectedSpecialist,
    clearAssignmentError: () => setAssignmentError(null),
    labels,
  };
}
