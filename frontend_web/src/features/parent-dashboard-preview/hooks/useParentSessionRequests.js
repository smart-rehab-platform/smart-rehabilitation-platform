import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSessionRequest,
  getMySessionRequests,
  getPatientSpecialists,
  getSessionById,
} from "../../../services/parentDashboardService";
import { readString } from "../utils/parentDashboardMappers";
import {
  getTodayDateInputValue,
  mapSessionRequestRowToHubItem,
  validateSessionRequestForm,
} from "../utils/parentSessionsUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

const EMPTY_FORM = {
  patientId: "",
  specialistId: "",
  reason: "",
  reasonOtherText: "",
  preferredDate: getTodayDateInputValue(),
  preferredTimePeriod: "flexible",
  notes: "",
};

async function enrichApprovedRequests(requestRows) {
  const enriched = await Promise.all(
    requestRows.map(async (row) => {
      const approvedSessionId = readString(row, ["approved_session_id", "approvedSessionId"]);
      const status = readString(row, ["status"])?.toLowerCase();

      if (status !== "approved" || !approvedSessionId) {
        return mapSessionRequestRowToHubItem(row);
      }

      try {
        const sessionRow = await getSessionById(approvedSessionId);
        return mapSessionRequestRowToHubItem(row, sessionRow);
      } catch {
        return mapSessionRequestRowToHubItem(row);
      }
    }),
  );

  return enriched.filter(Boolean);
}

export function useParentSessionRequests(parentUserId) {
  const [requests, setRequests] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(Boolean(parentUserId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSpecialists, setIsLoadingSpecialists] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);
  const specialistsTokenRef = useRef(0);
  const submittingRef = useRef(false);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const resetForm = useCallback((patientId = "") => {
    setForm({
      ...EMPTY_FORM,
      patientId,
      preferredDate: getTodayDateInputValue(),
    });
    setFormErrors({});
    setSubmitError(null);
  }, []);

  const updateFormField = useCallback((field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "patientId") {
        next.specialistId = "";
      }
      return next;
    });
    setFormErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitError(null);
  }, []);

  useEffect(() => {
    if (!parentUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadRequests() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await getMySessionRequests();
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = await enrichApprovedRequests(rows);
        if (!cancelled && loadTokenRef.current === loadToken) {
          setRequests(mapped);
        }
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, "Failed to load session requests."));
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
  }, [parentUserId, refreshToken]);

  useEffect(() => {
    if (!form.patientId) {
      return undefined;
    }

    const loadToken = specialistsTokenRef.current + 1;
    specialistsTokenRef.current = loadToken;
    let cancelled = false;

    async function loadSpecialists() {
      setIsLoadingSpecialists(true);

      try {
        const rows = await getPatientSpecialists(form.patientId);
        if (cancelled || specialistsTokenRef.current !== loadToken) {
          return;
        }

        setSpecialists(rows);

        if (rows.length === 1) {
          const specialistId = readString(rows[0], ["specialist_id", "specialistId", "id"]);
          if (specialistId) {
            setForm((current) => (
              current.specialistId ? current : { ...current, specialistId }
            ));
          }
        }
      } catch {
        if (!cancelled && specialistsTokenRef.current === loadToken) {
          setSpecialists([]);
        }
      } finally {
        if (!cancelled && specialistsTokenRef.current === loadToken) {
          setIsLoadingSpecialists(false);
        }
      }
    }

    loadSpecialists();

    return () => {
      cancelled = true;
    };
  }, [form.patientId]);

  const submitRequest = useCallback(async () => {
    if (submittingRef.current) {
      return { ok: false };
    }

    const validationErrors = validateSessionRequestForm(form);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return { ok: false };
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        patient_id: form.patientId,
        specialist_id: form.specialistId,
        reason: form.reason,
        preferred_date: form.preferredDate,
        preferred_time_period: form.preferredTimePeriod,
      };

      if (form.reason === "other") {
        payload.reason_other_text = form.reasonOtherText.trim();
      }

      const notes = form.notes?.trim();
      if (notes) {
        payload.notes = notes;
      }

      await createSessionRequest(payload);
      resetForm(form.patientId);
      refetch();
      return { ok: true };
    } catch (submitFailure) {
      setSubmitError(resolveErrorMessage(submitFailure, "Unable to submit session request."));
      return { ok: false };
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [form, refetch, resetForm]);

  if (!parentUserId) {
    return {
      requests: [],
      specialists: [],
      form,
      formErrors,
      isLoading: false,
      isSubmitting: false,
      isLoadingSpecialists: false,
      error: "Please sign in to view session requests.",
      submitError: null,
      updateFormField,
      resetForm,
      submitRequest,
      refetch,
    };
  }

  return {
    requests,
    specialists,
    form,
    formErrors,
    isLoading,
    isSubmitting,
    isLoadingSpecialists,
    error,
    submitError,
    updateFormField,
    resetForm,
    submitRequest,
    refetch,
  };
}
