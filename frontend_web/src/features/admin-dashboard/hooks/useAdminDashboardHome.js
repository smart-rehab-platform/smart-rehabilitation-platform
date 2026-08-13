import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchAdminOverviewKpis,
  fetchRecentUsers,
} from "../../../services/adminDashboardService";

const SIGNED_OUT_ERROR =
  "Please sign in as an admin to view this dashboard.";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminDashboardHome(adminUserId) {
  const [overview, setOverview] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!adminUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadHomeData() {
      setIsLoading(true);
      setError(null);

      try {
        const [nextOverview, nextRecentUsers] = await Promise.all([
          fetchAdminOverviewKpis(),
          fetchRecentUsers({ limit: 5 }),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setOverview(nextOverview);
        setRecentUsers(nextRecentUsers);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setOverview(null);
        setRecentUsers([]);
        setError(
          resolveErrorMessage(
            loadError,
            "Failed to load admin dashboard.",
          ),
        );
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, [adminUserId, refreshToken]);

  if (!adminUserId) {
    return {
      overview: null,
      recentUsers: [],
      isLoading: false,
      error: SIGNED_OUT_ERROR,
      reload,
    };
  }

  return {
    overview,
    recentUsers,
    isLoading,
    error,
    reload,
  };
}
