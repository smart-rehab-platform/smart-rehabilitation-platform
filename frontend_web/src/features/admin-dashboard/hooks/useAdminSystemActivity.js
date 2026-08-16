import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchWeeklySystemActivity } from "../../../services/adminDashboardService";
import { useLocale } from "../../../context/useLocale.js";
import {
  clampWeekOffset,
  SYSTEM_ACTIVITY_PRESET_OFFSETS,
} from "../utils/adminDashboardMappers";
import {
  formatAdminSystemActivityPeriodLabel,
  getAdminAnalyticsLabels,
  localizeSystemActivityDays,
} from "../utils/adminDashboardLocalization.js";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

const EMPTY_ACTIVITY = {
  days: [],
  weekOffset: 0,
  weekStart: null,
  weekEnd: null,
};

export function useAdminSystemActivity(adminUserId) {
  const { t, locale } = useLocale();
  const analyticsLabels = useMemo(() => getAdminAnalyticsLabels(t), [t]);
  const [weekOffset, setWeekOffsetState] = useState(0);
  const [activity, setActivity] = useState(EMPTY_ACTIVITY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const periodLabel = formatAdminSystemActivityPeriodLabel({
    weekOffset,
    weekStart: activity.weekStart,
    weekEnd: activity.weekEnd,
  }, { t, locale });

  const localizedActivity = useMemo(() => ({
    ...activity,
    days: localizeSystemActivityDays(activity.days, locale),
  }), [activity, locale]);

  const setWeekOffset = useCallback((nextOffset) => {
    setWeekOffsetState(clampWeekOffset(nextOffset));
  }, []);

  useEffect(() => {
    if (!adminUserId) {
      return undefined;
    }

    const normalizedOffset = clampWeekOffset(weekOffset);
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadActivityData() {
      setIsLoading(true);
      setError(null);

      try {
        const nextActivity = await fetchWeeklySystemActivity({
          weekOffset: normalizedOffset,
        });

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setActivity(nextActivity);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setError(
          resolveErrorMessage(
            loadError,
            analyticsLabels.loadFailed,
          ),
        );
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadActivityData();

    return () => {
      cancelled = true;
    };
  }, [adminUserId, weekOffset, refreshToken, analyticsLabels.loadFailed]);

  const showPreviousWeek = useCallback(() => {
    setWeekOffsetState((current) => clampWeekOffset(current + 1));
  }, []);

  const showNextWeek = useCallback(() => {
    setWeekOffsetState((current) => {
      if (current <= 0) {
        return 0;
      }

      return clampWeekOffset(current - 1);
    });
  }, []);

  const selectPreset = useCallback((presetOffset) => {
    setWeekOffsetState(clampWeekOffset(presetOffset));
  }, []);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  return {
    activity: localizedActivity,
    weekOffset,
    periodLabel,
    isLoading,
    error,
    canGoForward: weekOffset > 0,
    presets: SYSTEM_ACTIVITY_PRESET_OFFSETS,
    setWeekOffset,
    showPreviousWeek,
    showNextWeek,
    selectPreset,
    reload,
  };
}
