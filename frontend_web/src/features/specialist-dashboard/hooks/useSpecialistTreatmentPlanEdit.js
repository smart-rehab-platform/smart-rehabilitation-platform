import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadEditTreatmentPlanBundle,
  updateTreatmentPlan,
} from "../../../services/specialistTreatmentPlanService";
import { formatDateOnlyForApi } from "../utils/specialistTreatmentPlanMappers";
import { notifySpecialistTreatmentPlanRefresh } from "../utils/specialistTreatmentPlanRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function todayDateOnly() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useSpecialistTreatmentPlanEdit(specialistUserId, planId) {
  const [bundle, setBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [validationMessage, setValidationMessage] = useState(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!specialistUserId || !planId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadBundle() {
      setIsLoading(true);
      setError(null);
      setUnauthorized(false);
      setBundle(null);

      try {
        const result = await loadEditTreatmentPlanBundle(specialistUserId, planId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        if (result.unauthorized) {
          setUnauthorized(true);
          return;
        }

        if (!result.bundle) {
          setError("Treatment plan not found.");
          return;
        }

        const nextBundle = result.bundle;
        setBundle(nextBundle);
        setTitle(nextBundle.plan.title || "");
        setStatus(nextBundle.plan.status || "active");
        setStartDate(formatDateOnlyForApi(nextBundle.plan.startDate) || todayDateOnly());
        setEndDate(formatDateOnlyForApi(nextBundle.plan.endDate) || "");
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setError(resolveErrorMessage(loadError, "Failed to load treatment plan."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadBundle();

    return () => {
      cancelled = true;
    };
  }, [specialistUserId, planId, refreshToken]);

  const validate = useCallback(() => {
    if (!title.trim()) {
      return "Plan title is required";
    }
    if (!startDate) {
      return "Start date is required";
    }
    if (endDate && endDate < startDate) {
      return "End date cannot be before start date";
    }
    return null;
  }, [title, startDate, endDate]);

  const save = useCallback(async () => {
    const validation = validate();
    if (validation) {
      setValidationMessage(validation);
      return { ok: false, message: validation };
    }

    if (isSaving) {
      return { ok: false, message: "Please wait…" };
    }

    setIsSaving(true);
    setError(null);
    setValidationMessage(null);

    try {
      const payload = {
        title: title.trim(),
        status,
        start_date: startDate,
        change_summary: "Updated via specialist web dashboard",
      };
      if (endDate) {
        payload.end_date = endDate;
      } else {
        payload.end_date = null;
      }

      await updateTreatmentPlan(planId, payload);
      notifySpecialistTreatmentPlanRefresh();
      return { ok: true };
    } catch (saveError) {
      const message = resolveErrorMessage(saveError, "Failed to save treatment plan. Please try again.");
      setError(message);
      return { ok: false, message };
    } finally {
      setIsSaving(false);
    }
  }, [validate, isSaving, title, status, startDate, endDate, planId]);

  if (!specialistUserId || !planId) {
    return {
      bundle: null,
      isLoading: false,
      isSaving: false,
      error: null,
      unauthorized: false,
      validationMessage: null,
      title,
      status,
      startDate,
      endDate,
      setTitle,
      setStatus,
      setStartDate,
      setEndDate,
      reload,
      save,
    };
  }

  return {
    bundle,
    isLoading,
    isSaving,
    error,
    unauthorized,
    validationMessage,
    title,
    status,
    startDate,
    endDate,
    setTitle,
    setStatus,
    setStartDate,
    setEndDate,
    reload,
    save,
  };
}
