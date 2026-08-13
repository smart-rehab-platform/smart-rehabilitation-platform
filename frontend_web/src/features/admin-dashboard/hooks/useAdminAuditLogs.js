import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadAdminAuditLogs } from "../../../services/adminAuditLogsService";
import { fetchAdminUsers } from "../../../services/adminUsersService";
import { mapAdminUserRecord } from "../utils/adminUsersMappers";
import {
  buildAuditActionOptions,
  buildAuditDateRangeParams,
  buildAuditEntityOptions,
  buildAuditUserOptions,
  isAuditDateRangeInvalid,
  mapAdminAuditLog,
} from "../utils/adminAuditLogsMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function hasServerSideFilters({
  selectedUserId,
  selectedAction,
  selectedEntity,
  fromDate,
  toDate,
}) {
  return Boolean(
    selectedUserId
    || selectedAction
    || selectedEntity
    || fromDate
    || toDate,
  );
}

export function useAdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [optionSourceLogs, setOptionSourceLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [usersError, setUsersError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const logsLoadTokenRef = useRef(0);
  const usersLoadTokenRef = useRef(0);
  const hasLoadedLogsRef = useRef(false);

  const dateRangeError = useMemo(() => {
    if (!isAuditDateRangeInvalid(fromDate, toDate)) {
      return null;
    }

    return "From date cannot be after To date.";
  }, [fromDate, toDate]);

  const hasActiveFilters = hasServerSideFilters({
    selectedUserId,
    selectedAction,
    selectedEntity,
    fromDate,
    toDate,
  });

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedUserId("");
    setSelectedAction("");
    setSelectedEntity("");
    setFromDate("");
    setToDate("");
  }, []);

  useEffect(() => {
    const loadToken = usersLoadTokenRef.current + 1;
    usersLoadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadUsers() {
      try {
        const rows = await fetchAdminUsers();
        if (cancelled || usersLoadTokenRef.current !== loadToken) {
          return;
        }

        setUsers(rows.map(mapAdminUserRecord).filter((user) => user?.id));
        setUsersError(null);
      } catch (loadError) {
        if (cancelled || usersLoadTokenRef.current !== loadToken) {
          return;
        }

        setUsers([]);
        setUsersError(resolveErrorMessage(loadError, "Failed to load users."));
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  useEffect(() => {
    if (dateRangeError) {
      return undefined;
    }

    const loadToken = logsLoadTokenRef.current + 1;
    logsLoadTokenRef.current = loadToken;
    let cancelled = false;
    const isInitial = !hasLoadedLogsRef.current;

    async function loadLogs() {
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const dateParams = buildAuditDateRangeParams(fromDate, toDate);
        const rows = await loadAdminAuditLogs({
          user_id: selectedUserId,
          action: selectedAction,
          entity_name: selectedEntity,
          date_from: dateParams.date_from,
          date_to: dateParams.date_to,
        });

        if (cancelled || logsLoadTokenRef.current !== loadToken) {
          return;
        }

        const mapped = rows.map(mapAdminAuditLog).filter(Boolean);
        setLogs(mapped);

        if (!hasServerSideFilters({
          selectedUserId,
          selectedAction,
          selectedEntity,
          fromDate,
          toDate,
        })) {
          setOptionSourceLogs(mapped);
        }
      } catch (loadError) {
        if (cancelled || logsLoadTokenRef.current !== loadToken) {
          return;
        }

        setError(resolveErrorMessage(loadError, "Failed to load audit logs."));

        if (!hasLoadedLogsRef.current) {
          setLogs([]);
        }
      } finally {
        if (!cancelled && logsLoadTokenRef.current === loadToken) {
          hasLoadedLogsRef.current = true;
          setIsInitialLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadLogs();

    return () => {
      cancelled = true;
    };
  }, [
    dateRangeError,
    fromDate,
    refreshToken,
    selectedAction,
    selectedEntity,
    selectedUserId,
    toDate,
  ]);

  const userOptions = useMemo(
    () => buildAuditUserOptions(users),
    [users],
  );

  const actionOptions = useMemo(
    () => buildAuditActionOptions(optionSourceLogs),
    [optionSourceLogs],
  );

  const entityOptions = useMemo(
    () => buildAuditEntityOptions(optionSourceLogs),
    [optionSourceLogs],
  );

  return {
    logs,
    users,
    userOptions,
    actionOptions,
    entityOptions,
    selectedUserId,
    setSelectedUserId,
    selectedAction,
    setSelectedAction,
    selectedEntity,
    setSelectedEntity,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    dateRangeError,
    hasActiveFilters,
    clearFilters,
    isInitialLoading,
    isRefreshing,
    isLoading: isInitialLoading,
    error,
    usersError,
    refresh,
  };
}
