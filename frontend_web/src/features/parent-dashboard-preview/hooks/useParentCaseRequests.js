import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCaseRequest,
  getCaseCategories,
  getCaseRequestById,
  getMyCaseRequests,
  updateCaseRequest,
  uploadCaseRequestChildImage,
} from "../../../services/parentCaseIntakeService";
import {
  buildCaseRequestPayload,
  mapCaseCategory,
  mapCaseRequest,
  mapCaseRequests,
} from "../utils/parentCaseRequestsUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentCaseRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadRequests() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await getMyCaseRequests();
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setRequests(mapCaseRequests(rows));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, "Failed to load case requests."));
          setRequests([]);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  return { requests, isLoading, error, refetch };
}

export function useParentCaseRequestDetail(requestId) {
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(requestId));
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!requestId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadRequest() {
      setIsLoading(true);
      setError(null);

      try {
        const row = await getCaseRequestById(requestId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setRequest(mapCaseRequest(row));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, "Failed to load case request."));
          setRequest(null);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadRequest();

    return () => {
      cancelled = true;
    };
  }, [requestId, refreshToken]);

  return { request, isLoading, error, refetch };
}

export function useParentCaseCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await getCaseCategories();
        if (cancelled) {
          return;
        }
        setCategories(rows.map(mapCaseCategory).filter((item) => item.id && item.isActive));
      } catch (loadError) {
        if (!cancelled) {
          setError(resolveErrorMessage(loadError, "Failed to load case categories."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, isLoading, error };
}

export function useParentCaseRequestForm({ requestId, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const submitGuardRef = useRef(false);

  const submit = useCallback(async (form, { pendingChildImageFile } = {}) => {
    if (submitGuardRef.current || isSubmitting) {
      return { ok: false };
    }

    submitGuardRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let childImageUrl;
      if (pendingChildImageFile) {
        childImageUrl = await uploadCaseRequestChildImage(pendingChildImageFile);
      }

      const payload = buildCaseRequestPayload(form, {
        childImageUrl: childImageUrl !== undefined ? childImageUrl : undefined,
      });

      const row = requestId
        ? await updateCaseRequest(requestId, payload)
        : await createCaseRequest(payload);
      const mapped = mapCaseRequest(row);
      onSuccess?.(mapped);
      return { ok: true, request: mapped };
    } catch (error) {
      const message = resolveErrorMessage(error, "Failed to save case request.");
      setSubmitError(message);
      return { ok: false, message };
    } finally {
      submitGuardRef.current = false;
      setIsSubmitting(false);
    }
  }, [isSubmitting, onSuccess, requestId]);

  return { isSubmitting, submitError, submit, setSubmitError };
}
