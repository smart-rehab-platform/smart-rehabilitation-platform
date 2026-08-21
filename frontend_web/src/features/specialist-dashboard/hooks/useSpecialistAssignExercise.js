import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../../context/useLocale";
import { createAssignedExercise } from "../../../services/specialistAssignedExerciseService";
import { getPatientById } from "../../../services/specialistPatientService";
import { useSpecialistExercises } from "./useSpecialistExercises";
import { notifySpecialistAssignedExerciseRefresh } from "../utils/specialistAssignedExerciseRefresh";
import {
  ASSIGN_EXERCISE_VALIDATION_KEYS,
  EXERCISE_ASSIGNMENT_FREQUENCIES,
  buildAssignedExerciseCreatePayload,
  getTodayAssignmentDate,
  validateAssignExerciseForm,
} from "../utils/specialistAssignExerciseMappers";
import {
  getAssignExerciseValidationMessage,
  mapAssignExerciseErrorMessage,
  resolveAssignExerciseFieldErrors,
} from "../utils/specialistAssignExerciseLocalization";
import { applyExerciseListItemLocalization } from "../utils/specialistExercisesLocalization";
import { buildSpecialistPatientDetailPath } from "../../../routes/specialistDashboardRoutes";
import { mapPatientProfile } from "../utils/specialistPatientMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistAssignExercise(patientId, planId, enabled = true) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [patient, setPatient] = useState(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [patientError, setPatientError] = useState(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [frequency, setFrequency] = useState(EXERCISE_ASSIGNMENT_FREQUENCIES.DAILY);
  const [startDate, setStartDate] = useState(() => getTodayAssignmentDate());
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [validationKey, setValidationKey] = useState(null);

  const {
    exercises,
    visibleExercises,
    categoryFilters,
    isLoading: isLoadingExercises,
    error: exercisesError,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    emptyMessage,
    reload: reloadExercises,
  } = useSpecialistExercises(enabled);

  const normalizedPlanId = planId?.trim() ?? "";
  const normalizedPatientId = patientId?.trim() ?? "";

  useEffect(() => {
    if (!enabled || !normalizedPatientId) {
      return undefined;
    }

    let cancelled = false;

    async function loadPatient() {
      setIsLoadingPatient(true);
      setPatientError(null);
      try {
        const row = await getPatientById(normalizedPatientId);
        if (cancelled) {
          return;
        }
        setPatient(mapPatientProfile(row));
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        setPatient(null);
        setPatientError(resolveErrorMessage(loadError, t("specialist.patientDetails.notFound")));
      } finally {
        if (!cancelled) {
          setIsLoadingPatient(false);
        }
      }
    }

    loadPatient();

    return () => {
      cancelled = true;
    };
  }, [enabled, normalizedPatientId, t]);

  const selectedExercise = useMemo(() => {
    const match = exercises.find((exercise) => exercise.id === selectedExerciseId) ?? null;
    return match ? applyExerciseListItemLocalization(match, { t }) : null;
  }, [exercises, selectedExerciseId, t]);

  const fieldErrors = useMemo(
    () => resolveAssignExerciseFieldErrors(validationKey, t),
    [validationKey, t],
  );

  const selectExercise = useCallback((exercise) => {
    setSelectedExerciseId(exercise?.id ?? "");
    setValidationKey(null);
    setSubmitError(null);
  }, []);

  const handleStartDateChange = useCallback((value) => {
    setStartDate(value);
    if (dueDate && value && dueDate < value) {
      setDueDate("");
    }
  }, [dueDate]);

  const clearDueDate = useCallback(() => {
    setDueDate("");
  }, []);

  const handleCancel = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    if (normalizedPatientId) {
      navigate(buildSpecialistPatientDetailPath(normalizedPatientId));
      return;
    }
    navigate(-1);
  }, [isSubmitting, navigate, normalizedPatientId]);

  const assign = useCallback(async () => {
    const validation = validateAssignExerciseForm({
      patientId: normalizedPatientId,
      planId: normalizedPlanId,
      exerciseId: selectedExerciseId,
      startDate,
      dueDate: dueDate || null,
    });

    if (validation) {
      setValidationKey(validation);
      return {
        ok: false,
        message: getAssignExerciseValidationMessage(validation, t),
      };
    }

    if (isSubmitting) {
      return { ok: false, message: t("specialist.assignExercise.pleaseWait") };
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setValidationKey(null);

    try {
      const payload = buildAssignedExerciseCreatePayload({
        exerciseId: selectedExerciseId,
        planId: normalizedPlanId,
        patientId: normalizedPatientId,
        frequency,
        startDate,
        dueDate: dueDate || null,
      });

      await createAssignedExercise(payload);
      notifySpecialistAssignedExerciseRefresh();
      return { ok: true };
    } catch (assignError) {
      const message = mapAssignExerciseErrorMessage(resolveErrorMessage(assignError, ""), t);
      setSubmitError(message);
      return { ok: false, message };
    } finally {
      setIsSubmitting(false);
    }
  }, [
    normalizedPatientId,
    normalizedPlanId,
    selectedExerciseId,
    startDate,
    dueDate,
    frequency,
    isSubmitting,
    t,
  ]);

  const hasActivePlan = Boolean(normalizedPlanId);

  return {
    patient,
    isLoadingPatient,
    patientError,
    hasActivePlan,
    exercises,
    visibleExercises,
    categoryFilters,
    isLoadingExercises,
    exercisesError,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    emptyMessage,
    reloadExercises,
    selectedExercise,
    selectedExerciseId,
    selectExercise,
    frequency,
    setFrequency,
    startDate,
    setStartDate: handleStartDateChange,
    dueDate,
    setDueDate,
    clearDueDate,
    isSubmitting,
    submitError,
    fieldErrors,
    validationKey,
    assign,
    handleCancel,
    isBusy: isSubmitting,
  };
}

export { ASSIGN_EXERCISE_VALIDATION_KEYS, EXERCISE_ASSIGNMENT_FREQUENCIES };
