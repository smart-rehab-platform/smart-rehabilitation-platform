import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  createGoalProgress,
  createTreatmentPlanGoal,
  getGoalProgress,
  getPatientById,
  getPatientTreatmentPlans,
  getTreatmentPlanGoals,
  updateGoal,
} from "../../../services/specialistPatientService";
import {
  buildCreateGoalPayload,
  buildGoalProgressPayload,
  buildUpdateGoalPayload,
  parseGoalProgressInput,
  parseGoalTargetValueInput,
  validateCreateGoalForm,
  validateGoalProgressForm,
  validateUpdateGoalForm,
} from "../utils/specialistGoalsMappers";
import {
  getGoalsValidationMessage,
  mapGoalsActionErrorMessage,
} from "../utils/specialistGoalsLocalization";
import { notifySpecialistGoalsRefresh } from "../utils/specialistGoalsRefresh";
import {
  fetchGoalsWithProgress,
  mapPatientProfile,
  selectActiveTreatmentPlan,
} from "../utils/specialistPatientMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistManageGoals(patientId, enabled = true) {
  const { t, locale } = useLocale();
  const [bundle, setBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const normalizedPatientId = patientId?.trim() ?? "";

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !normalizedPatientId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadBundle() {
      setIsLoading(true);
      setError(null);

      try {
        const patientMap = await getPatientById(normalizedPatientId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        if (!patientMap) {
          throw new Error(t("specialist.patientDetails.notFound"));
        }

        const patient = mapPatientProfile(patientMap);
        const planRows = await getPatientTreatmentPlans(normalizedPatientId);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const plan = selectActiveTreatmentPlan(planRows, mapperContext);
        if (!plan?.id) {
          setBundle({
            patient,
            plan: null,
            planId: "",
            goals: [],
          });
          return;
        }

        const goals = await fetchGoalsWithProgress(
          plan.id,
          getTreatmentPlanGoals,
          getGoalProgress,
          mapperContext,
        );

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setBundle({
          patient,
          plan,
          planId: plan.id,
          goals,
        });
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setBundle(null);
        setError(resolveErrorMessage(loadError, t("specialist.goals.loadFailed")));
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
  }, [enabled, normalizedPatientId, refreshToken, mapperContext, t]);

  const refreshAfterMutation = useCallback(async () => {
    reload();
    notifySpecialistGoalsRefresh();
  }, [reload]);

  const createGoal = useCallback(async (form) => {
    const planId = bundle?.planId ?? "";
    const validationKey = validateCreateGoalForm({
      title: form.title,
      targetValueText: form.targetValueText,
      planId,
    });
    if (validationKey) {
      return {
        ok: false,
        message: getGoalsValidationMessage(validationKey, t),
      };
    }

    const { value: targetValue, error: targetError } = parseGoalTargetValueInput(form.targetValueText);
    if (targetError) {
      return {
        ok: false,
        message: getGoalsValidationMessage(targetError, t),
      };
    }

    setIsSaving(true);
    try {
      const payload = buildCreateGoalPayload({
        term: form.term,
        title: form.title,
        description: form.description,
        targetDate: form.targetDate,
        targetValue,
      });
      await createTreatmentPlanGoal(planId, payload);
      await refreshAfterMutation();
      return { ok: true, message: t("specialist.goals.createdSuccess") };
    } catch (saveError) {
      return {
        ok: false,
        message: mapGoalsActionErrorMessage(saveError, t),
      };
    } finally {
      setIsSaving(false);
    }
  }, [bundle?.planId, refreshAfterMutation, t]);

  const editGoal = useCallback(async (goalId, form) => {
    const validationKey = validateUpdateGoalForm({
      title: form.title,
      targetValueText: form.targetValueText,
    });
    if (validationKey) {
      return {
        ok: false,
        message: getGoalsValidationMessage(validationKey, t),
      };
    }

    const { value: targetValue, error: targetError } = parseGoalTargetValueInput(form.targetValueText);
    if (targetError) {
      return {
        ok: false,
        message: getGoalsValidationMessage(targetError, t),
      };
    }

    setIsSaving(true);
    try {
      const payload = buildUpdateGoalPayload({
        title: form.title,
        targetDate: form.targetDate,
        targetValue,
        isAchieved: form.isAchieved,
      });
      await updateGoal(goalId, payload);
      await refreshAfterMutation();
      return { ok: true, message: t("specialist.goals.updatedSuccess") };
    } catch (saveError) {
      return {
        ok: false,
        message: mapGoalsActionErrorMessage(saveError, t),
      };
    } finally {
      setIsSaving(false);
    }
  }, [refreshAfterMutation, t]);

  const updateProgress = useCallback(async (goalId, form) => {
    const validationKey = validateGoalProgressForm({ progressText: form.progressText });
    if (validationKey) {
      return {
        ok: false,
        message: getGoalsValidationMessage(validationKey, t),
      };
    }

    const { value: completionPercentage, error: progressError } = parseGoalProgressInput(form.progressText);
    if (progressError) {
      return {
        ok: false,
        message: getGoalsValidationMessage(progressError, t),
      };
    }

    setIsSaving(true);
    try {
      const payload = buildGoalProgressPayload({
        completionPercentage,
        notes: form.notes,
      });
      await createGoalProgress(goalId, payload);
      await refreshAfterMutation();
      return { ok: true, message: t("specialist.goals.progressUpdatedSuccess") };
    } catch (saveError) {
      return {
        ok: false,
        message: mapGoalsActionErrorMessage(saveError, t),
      };
    } finally {
      setIsSaving(false);
    }
  }, [refreshAfterMutation, t]);

  const hasActivePlan = Boolean(bundle?.planId);

  return {
    bundle,
    goals: bundle?.goals ?? [],
    hasActivePlan,
    isLoading,
    isSaving,
    error,
    reload,
    createGoal,
    editGoal,
    updateProgress,
  };
}
