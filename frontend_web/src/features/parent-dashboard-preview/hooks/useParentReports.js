import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getChildren,
  getChildrenProgress,
  getReports,
} from "../../../services/parentDashboardService";
import { mergeChildren } from "../utils/parentDashboardMappers";
import { mapReportRowsToHubItems } from "../utils/parentReportsUtils";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function buildChildNameLookup(children) {
  return Object.fromEntries(
    children
      .filter((child) => child?.id && child?.fullName)
      .map((child) => [child.id, child.fullName]),
  );
}

export function useParentReports(parentUserId) {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);
  const [children, setChildren] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(parentUserId));
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!parentUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadReportsHub() {
      setIsLoading(true);
      setError(null);

      try {
        const [childrenRows, progressRows, reportRows] = await Promise.all([
          getChildren(parentUserId),
          getChildrenProgress(),
          getReports(),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        const mergedChildren = mergeChildren(childrenRows, progressRows);
        setChildren(mergedChildren);

        const childNameByPatientId = buildChildNameLookup(mergedChildren);
        setReports(mapReportRowsToHubItems(reportRows, childNameByPatientId, mapperOptions));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, t("parent.hooks.loadReportsFailed")));
          setReports([]);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadReportsHub();

    return () => {
      cancelled = true;
    };
  }, [parentUserId, refreshToken, mapperOptions, t]);

  const reportCount = useMemo(() => reports.length, [reports]);

  if (!parentUserId) {
    return {
      children: [],
      reports: [],
      reportCount: 0,
      isLoading: false,
      error: t("parent.hooks.signInReports"),
      refetch,
    };
  }

  return {
    children,
    reports,
    reportCount,
    isLoading,
    error,
    refetch,
  };
}
