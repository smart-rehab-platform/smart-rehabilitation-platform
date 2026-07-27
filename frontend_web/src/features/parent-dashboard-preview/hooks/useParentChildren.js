import { useCallback, useEffect, useRef, useState } from "react";
import { getChildren, getChildrenProgress } from "../../../services/parentDashboardService";
import { mergeChildren } from "../utils/parentDashboardMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useParentChildren(parentUserId) {
  const [children, setChildren] = useState([]);
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

    async function loadChildren() {
      setIsLoading(true);
      setError(null);

      try {
        const [childrenRows, progressRows] = await Promise.all([
          getChildren(parentUserId),
          getChildrenProgress(),
        ]);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setChildren(mergeChildren(childrenRows, progressRows));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setError(resolveErrorMessage(loadError, "Failed to load linked children."));
          setChildren([]);
        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadChildren();

    return () => {
      cancelled = true;
    };
  }, [parentUserId, refreshToken]);

  if (!parentUserId) {
    return {
      children: [],
      isLoading: false,
      error: "Please sign in to view your children.",
      refetch,
    };
  }

  return { children, isLoading, error, refetch };
}
