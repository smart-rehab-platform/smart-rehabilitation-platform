import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  buildCreateUserPayload,
  buildUpdateUserPayload,
  buildPresenceMap,
  filterAdminUsers,
  mapAdminUserRecord,
} from "../utils/adminUsersMappers";
import {
  applyAdminUsersLocalization,
  getAdminUsersLabels,
} from "../utils/adminUsersLocalization.js";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  fetchAdminUsersPresence,
  updateAdminSpecialistVerification,
  updateAdminUser,
  updateAdminUserStatus,
} from "../../../services/adminUsersService";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminUsers() {
  const { t, locale } = useLocale();
  const labels = useMemo(() => getAdminUsersLabels(t), [t]);

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
  const [isUpdatingVerification, setIsUpdatingVerification] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const loadTokenRef = useRef(0);

  const localizedUsers = useMemo(
    () => applyAdminUsersLocalization(users, { t, locale }),
    [users, t, locale],
  );

  const filteredUsers = useMemo(
    () => filterAdminUsers(localizedUsers, { search: searchQuery, roleFilter }),
    [localizedUsers, searchQuery, roleFilter],
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
        setError(resolveErrorMessage(loadError, labels.loadFailed));
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
  }, [refreshToken, labels.loadFailed]);

  const createUser = useCallback(async (form) => {
    setIsCreating(true);
    try {
      await createAdminUser(buildCreateUserPayload(form));
      reload();
      return null;
    } catch (mutationError) {
      return resolveErrorMessage(mutationError, labels.createFailed);
    } finally {
      setIsCreating(false);
    }
  }, [reload, labels.createFailed]);

  const updateUser = useCallback(async (id, form) => {
    setIsUpdating(true);
    try {
      await updateAdminUser(id, buildUpdateUserPayload(form));
      reload();
      return null;
    } catch (mutationError) {
      return resolveErrorMessage(mutationError, labels.updateFailed);
    } finally {
      setIsUpdating(false);
    }
  }, [reload, labels.updateFailed]);

  const updateUserStatus = useCallback(async (id, isActive) => {
    setIsUpdatingStatus(true);
    try {
      await updateAdminUserStatus(id, isActive);
      reload();
      return null;
    } catch (mutationError) {
      return resolveErrorMessage(mutationError, labels.updateStatusFailed);
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [reload, labels.updateStatusFailed]);

  const updateSpecialistVerification = useCallback(async (id, status) => {
    setIsUpdatingVerification(true);
    try {
      const updated = await updateAdminSpecialistVerification(id, status);
      setUsers((current) => current.map((user) => {
        if (user.id !== id) {
          return user;
        }

        return {
          ...user,
          verificationStatus: updated?.verification_status || status,
          specialization: updated?.specialization ?? user.specialization,
          licenseNumber: updated?.license_number ?? user.licenseNumber,
        };
      }));
      return null;
    } catch (mutationError) {
      return resolveErrorMessage(mutationError, labels.verificationFailed);
    } finally {
      setIsUpdatingVerification(false);
    }
  }, [labels.verificationFailed]);

  const deleteUser = useCallback(async (id) => {
    setIsDeleting(true);
    try {
      await deleteAdminUser(id);
      reload();
      return null;
    } catch (mutationError) {
      return resolveErrorMessage(mutationError, labels.deleteFailed);
    } finally {
      setIsDeleting(false);
    }
  }, [reload, labels.deleteFailed]);

  return {
    users: localizedUsers,
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
    updateSpecialistVerification,
    deleteUser,
    isCreating,
    isUpdating,
    isUpdatingStatus,
    isUpdatingVerification,
    isDeleting,
    labels,
  };
}
