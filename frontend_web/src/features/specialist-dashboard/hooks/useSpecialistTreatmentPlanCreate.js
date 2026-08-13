import { useCallback, useEffect, useRef, useState } from "react";
import {
  createTreatmentPlan,
  loadSpecialistAssignedPatients,
  verifyPatientAssignment,
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

export function useSpecialistTreatmentPlanCreate(
  specialistUserId,
  { patientId = "", patientName = "" } = {},
) {
  const scopedPatientId = patientId?.trim() || "";
  const scopedPatientName = patientName?.trim() || "";
  const isPatientLocked = Boolean(scopedPatientId);

  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationMessage, setValidationMessage] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(todayDateOnly());
  const [endDate, setEndDate] = useState("");
  const loadTokenRef = useRef(0);

  const effectivePatientId = isPatientLocked ? scopedPatientId : selectedPatientId;
  const effectivePatientName = isPatientLocked
    ? (scopedPatientName || "Patient")
    : (selectedPatientName || "Patient");

  useEffect(() => {
    if (!specialistUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadPatients() {
      setIsLoadingPatients(true);
      try {
        const rows = await loadSpecialistAssignedPatients(specialistUserId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setPatients(rows);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setError(resolveErrorMessage(loadError, "Failed to load patients."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoadingPatients(false);
        }
      }
    }

    loadPatients();

    return () => {
      cancelled = true;
    };
  }, [specialistUserId]);

  const validate = useCallback(() => {
    if (!effectivePatientId.trim()) {
      return "Patient is required";
    }
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
  }, [effectivePatientId, title, startDate, endDate]);

  const create = useCallback(async () => {
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
      const allowed = await verifyPatientAssignment(specialistUserId, effectivePatientId);
      if (!allowed) {
        throw new Error("You do not have access to this patient.");
      }

      const payload = {
        patient_id: effectivePatientId.trim(),
        title: title.trim(),
        start_date: formatDateOnlyForApi(startDate),
      };
      const formattedEnd = formatDateOnlyForApi(endDate);
      if (formattedEnd) {
        payload.end_date = formattedEnd;
      }

      await createTreatmentPlan(payload);
      notifySpecialistTreatmentPlanRefresh();
      return { ok: true };
    } catch (createError) {
      const message = resolveErrorMessage(createError, "Failed to create treatment plan. Please try again.");
      setError(message);
      return { ok: false, message };
    } finally {
      setIsSaving(false);
    }
  }, [
    validate,
    isSaving,
    specialistUserId,
    effectivePatientId,
    title,
    startDate,
    endDate,
  ]);

  const selectPatient = useCallback((patient) => {
    if (!patient?.id) {
      return;
    }
    setSelectedPatientId(patient.id);
    setSelectedPatientName(patient.name || "Patient");
    setValidationMessage(null);
  }, []);

  if (!specialistUserId) {
    return {
      patients: [],
      isLoadingPatients: false,
      isSaving: false,
      error: "Please sign in to create a treatment plan.",
      validationMessage: null,
      selectedPatientId: effectivePatientId,
      selectedPatientName: effectivePatientName,
      title,
      startDate,
      endDate,
      isPatientLocked,
      setTitle,
      setStartDate,
      setEndDate,
      selectPatient,
      create,
    };
  }

  return {
    patients,
    isLoadingPatients,
    isSaving,
    error,
    validationMessage,
    selectedPatientId: effectivePatientId,
    selectedPatientName: effectivePatientName,
    title,
    startDate,
    endDate,
    isPatientLocked,
    setTitle,
    setStartDate,
    setEndDate,
    selectPatient,
    create,
  };
}
