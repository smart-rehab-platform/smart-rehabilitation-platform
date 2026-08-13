import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildCreateUserPayload,
  buildUpdateUserPayload,
  buildPresenceMap,
  filterAdminUsers,
  mapAdminUserRecord,
} from "../utils/adminUsersMappers";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  fetchAdminUsersPresence,
  updateAdminUser,
  updateAdminUserStatus,
} from "../../../services/adminUsersService";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [presenceById, setPresenceById] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const loadTokenRef = useRef(0);

  const filteredUsers = useMemo(
    () => filterAdminUsers(users, { search: searchQuery, roleFilter }),
    [users, searchQuery, roleFilter],
  );

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadUsersAndPresence() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await fetchAdminUsers();

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setUsers(rows.map(mapAdminUserRecord));

        try {
          const presenceRows = await fetchAdminUsersPresence();
          if (!cancelled && loadTokenRef.current === loadToken) {
            setPresenceById(buildPresenceMap(presenceRows));
          }
        } catch {
          if (!cancelled && loadTokenRef.current === loadToken) {
            setPresenceById({});
          }
        }
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setUsers([]);
        setPresenceById({});
        setError(resolveErrorMessage(loadError, "Failed to load users."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadUsersAndPresence();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const createUser = useCallback(async (form) => {
    setIsCreating(true);
    try {
      await createAdminUser(buildCreateUserPayload(form));
      reload();
      return null;
    } catch (mutationError) {
      return resolveErrorMessage(mutationError, "Failed to create user.");
    } finally {
      setIsCreating(false);
    }
  }, [reload]);

  const updateUser = useCallback(async (id, form) => {
    setIsUpdating(true);
    try {
      await updateAdminUser(id, buildUpdateUserPayload(form));
      reload();
      return null;
    } catch (mutationError) {
      return resolveErrorMessage(mutationError, "Failed to update user.");
    } finally {
      setIsUpdating(false);
    }
  }, [reload]);

  const updateUserStatus = useCallback(async (id, isActive) => {
    setIsUpdatingStatus(true);
    try {
      await updateAdminUserStatus(id, isActive);
      reload();
      return null;
    } catch (mutationError) {
      return resolveErrorMessage(mutationError, "Failed to update user status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [reload]);

  const deleteUser = useCallback(async (id) => {
    setIsDeleting(true);
    try {
      await deleteAdminUser(id);
      reload();
      return null;
    } catch (mutationError) {
      return resolveErrorMessage(mutationError, "Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  }, [reload]);

  return {
    users,
    filteredUsers,
    presenceById,
    isLoading,
    error,
    searchQuery,
    roleFilter,
    setSearchQuery,
    setRoleFilter,
    reload,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    isCreating,
    isUpdating,
    isUpdatingStatus,
    isDeleting,
  };
}
