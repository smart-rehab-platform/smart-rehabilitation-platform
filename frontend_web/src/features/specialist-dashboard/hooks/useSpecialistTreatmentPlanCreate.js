import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  createTreatmentPlan,
  loadSpecialistAssignedPatients,
  verifyPatientAssignment,
} from "../../../services/specialistTreatmentPlanService";
import { formatDateOnlyForApi } from "../utils/specialistTreatmentPlanMappers";
import {
  getTreatmentPlanValidationMessage,
  validateTreatmentPlanForm,
} from "../utils/specialistTreatmentPlansLocalization";
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
  const { t } = useLocale();
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

  const loadPatientsFailedMessage = t("specialist.treatmentPlans.errors.loadPatientsFailed");
  const pleaseWaitMessage = t("specialist.treatmentPlans.pleaseWait");
  const createFailedMessage = t("specialist.treatmentPlans.errors.createFailed");
  const patientAccessDeniedMessage = t("specialist.treatmentPlans.errors.patientAccessDenied");
  const signInRequiredMessage = t("specialist.treatmentPlans.errors.signInRequiredCreate");

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
        setError(resolveErrorMessage(loadError, loadPatientsFailedMessage));
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
  }, [specialistUserId, loadPatientsFailedMessage]);

  const validate = useCallback(() => validateTreatmentPlanForm({
    patientId: effectivePatientId,
    title,
    startDate,
    endDate,
  }), [effectivePatientId, title, startDate, endDate]);

  const create = useCallback(async () => {
    const validation = validate();
    if (validation) {
      setValidationMessage(validation);
      return { ok: false, message: getTreatmentPlanValidationMessage(validation, t) };
    }

    if (isSaving) {
      return { ok: false, message: pleaseWaitMessage };
    }

    setIsSaving(true);
    setError(null);
    setValidationMessage(null);

    try {
      const allowed = await verifyPatientAssignment(specialistUserId, effectivePatientId);
      if (!allowed) {
        throw new Error(patientAccessDeniedMessage);
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
      const message = resolveErrorMessage(createError, createFailedMessage);
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
    t,
    pleaseWaitMessage,
    createFailedMessage,
    patientAccessDeniedMessage,
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
      error: signInRequiredMessage,
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
