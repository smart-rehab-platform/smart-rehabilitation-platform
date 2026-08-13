import { useCallback, useEffect, useRef, useState } from "react";
import { loadSpecialistPatients } from "../../../services/specialistPatientService";
import { createSpecialistSession } from "../../../services/specialistSessionService";
import { mapSpecialistPatientList } from "../utils/specialistPatientMappers";
import {
  DEFAULT_DURATION_MINUTES,
  DEFAULT_SESSION_TITLE,
  DEFAULT_TIME_VALUE,
  buildCreateSessionPayload,
  getDefaultScheduleDateValue,
  validateScheduleSessionForm,
} from "../utils/specialistScheduleSessionMappers";
import { notifySpecialistSessionRefresh } from "../utils/specialistSessionRefresh";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistScheduleSessionCreate(
  specialistUserId,
  { patientId = "", notes = "" } = {},
) {
  const scopedPatientId = patientId?.trim() || "";
  const initialNotes = notes?.trim() || "";

  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [title, setTitle] = useState(DEFAULT_SESSION_TITLE);
  const [scheduledDate, setScheduledDate] = useState(getDefaultScheduleDateValue);
  const [scheduledTime, setScheduledTime] = useState(DEFAULT_TIME_VALUE);
  const [duration, setDuration] = useState(DEFAULT_DURATION_MINUTES);
  const [locationOrLink, setLocationOrLink] = useState("");
  const [sessionNotes, setSessionNotes] = useState(initialNotes);
  const loadTokenRef = useRef(0);

  const effectivePatientId = scopedPatientId || selectedPatientId;

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
        const rows = await loadSpecialistPatients(specialistUserId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        const nextPatients = mapSpecialistPatientList(rows);
        setPatients(nextPatients);
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

  const selectedPatient = patients.find((patient) => patient.id === effectivePatientId) || null;

  const clearFieldError = useCallback((key) => {
    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const selectPatient = useCallback((patient) => {
    if (!patient?.id) {
      return;
    }
    setSelectedPatientId(patient.id);
    clearFieldError("patientId");
  }, [clearFieldError]);

  const validate = useCallback(() => {
    const result = validateScheduleSessionForm({
      title,
      patientId: effectivePatientId,
      dateValue: scheduledDate,
      timeValue: scheduledTime,
      durationValue: duration,
    });
    setFieldErrors(result.errors);
    return result;
  }, [title, effectivePatientId, scheduledDate, scheduledTime, duration]);

  const create = useCallback(async () => {
    const validation = validate();
    if (!validation.isValid) {
      return { ok: false };
    }

    if (!specialistUserId?.trim()) {
      const message = "Please sign in to continue.";
      setError(message);
      return { ok: false, message };
    }

    if (isSaving) {
      return { ok: false, message: "Please wait…" };
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = buildCreateSessionPayload({
        patientId: effectivePatientId,
        specialistId: specialistUserId,
        scheduledAt: validation.scheduledAt,
        durationMinutes: validation.duration,
        locationOrLink,
      });

      await createSpecialistSession(payload);
      notifySpecialistSessionRefresh();
      return { ok: true };
    } catch (createError) {
      const message = resolveErrorMessage(createError, "Failed to create session. Please try again.");
      setError(message);
      return { ok: false, message };
    } finally {
      setIsSaving(false);
    }
  }, [
    validate,
    specialistUserId,
    isSaving,
    effectivePatientId,
    locationOrLink,
  ]);

  if (!specialistUserId) {
    return {
      patients: [],
      selectedPatient: null,
      isLoadingPatients: false,
      isSaving: false,
      error: "Please sign in to schedule a session.",
      fieldErrors: {},
      title,
      scheduledDate,
      scheduledTime,
      duration,
      locationOrLink,
      sessionNotes,
      setTitle,
      setScheduledDate,
      setScheduledTime,
      setDuration,
      setLocationOrLink,
      setSessionNotes,
      selectPatient,
      create,
    };
  }

  return {
    patients,
    selectedPatient,
    isLoadingPatients,
    isSaving,
    error,
    fieldErrors,
    title,
    scheduledDate,
    scheduledTime,
    duration,
    locationOrLink,
    sessionNotes,
    setTitle: (value) => {
      setTitle(value);
      clearFieldError("title");
    },
    setScheduledDate: (value) => {
      setScheduledDate(value);
      clearFieldError("dateTime");
    },
    setScheduledTime: (value) => {
      setScheduledTime(value);
      clearFieldError("dateTime");
    },
    setDuration: (value) => {
      setDuration(value);
      clearFieldError("duration");
    },
    setLocationOrLink,
    setSessionNotes,
    selectPatient,
    create,
  };
}
