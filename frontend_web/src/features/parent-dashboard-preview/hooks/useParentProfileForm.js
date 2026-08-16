import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  createParentProfile,
  updateParentProfile,
  updateUserProfile,
  uploadProfileImage,
} from "../../../services/parentProfileService";
import {
  buildParentUpdatePayload,
  buildUserUpdatePayload,
  hasParentFieldChanges,
  hasUserFieldChanges,
  isProfileFormDirty,
  mapProfileBundle,
  mapProfileToFormValues,
  validateProfileForm,
  validateProfileImageFile,
} from "../utils/parentProfileUtils";
import { readString } from "../utils/parentDashboardMappers";

function buildProfileSnapshot(profile) {
  if (!profile) {
    return "";
  }

  return [
    profile.userId,
    profile.profileId ?? "",
    profile.fullName,
    profile.phone ?? "",
    profile.address ?? "",
    profile.relationshipNotes ?? "",
    profile.profileImageUrl ?? "",
  ].join("|");
}

export function useParentProfileForm({
  profile,
  onProfileSaved,
  onRefreshSession,
}) {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);
  const profileSnapshot = buildProfileSnapshot(profile);
  const [syncedSnapshot, setSyncedSnapshot] = useState(profileSnapshot);
  const [formValues, setFormValues] = useState(() => mapProfileToFormValues(profile));
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [avatarError, setAvatarError] = useState(null);
  const saveGuardRef = useRef(false);

  if (profileSnapshot !== syncedSnapshot) {
    setSyncedSnapshot(profileSnapshot);
    setFormValues(mapProfileToFormValues(profile));
    setFieldErrors({});
    setSaveError(null);
    setSuccessMessage(null);
    setPendingAvatarFile(null);
    setAvatarError(null);
  }

  const avatarPreviewUrl = useMemo(() => {
    if (!pendingAvatarFile) {
      return null;
    }
    return URL.createObjectURL(pendingAvatarFile);
  }, [pendingAvatarFile]);

  useEffect(() => {
    if (!avatarPreviewUrl) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const isDirty = useMemo(
    () => isProfileFormDirty(formValues, profile, pendingAvatarFile),
    [formValues, profile, pendingAvatarFile],
  );

  const setFieldValue = useCallback((field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError(null);
    setSuccessMessage(null);
  }, []);

  const handleAvatarSelect = useCallback((file) => {
    const validationMessage = validateProfileImageFile(file, mapperOptions);
    if (validationMessage) {
      setAvatarError(validationMessage);
      return;
    }

    setAvatarError(null);
    setPendingAvatarFile(file);
    setSaveError(null);
    setSuccessMessage(null);
  }, [mapperOptions]);

  const resetForm = useCallback(() => {
    setSyncedSnapshot(buildProfileSnapshot(profile));
    setFormValues(mapProfileToFormValues(profile));
    setFieldErrors({});
    setSaveError(null);
    setSuccessMessage(null);
    setPendingAvatarFile(null);
    setAvatarError(null);
  }, [profile]);

  const saveProfile = useCallback(async () => {
    if (!profile || isSaving || saveGuardRef.current) {
      return { ok: false };
    }

    if (!isDirty) {
      return { ok: false };
    }

    const validationErrors = validateProfileForm(formValues, mapperOptions);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      return { ok: false, message: firstError };
    }

    saveGuardRef.current = true;
    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    try {
      let latestUser = null;
      let latestParentRow = null;

      if (hasUserFieldChanges(formValues, profile)) {
        latestUser = await updateUserProfile(buildUserUpdatePayload(formValues, profile));
      }

      if (hasParentFieldChanges(formValues, profile)) {
        const parentPayload = buildParentUpdatePayload(formValues);
        if (profile.profileId) {
          latestParentRow = await updateParentProfile(profile.profileId, parentPayload);
        } else {
          latestParentRow = await createParentProfile(parentPayload);
        }
      }

      if (pendingAvatarFile) {
        latestUser = await uploadProfileImage(pendingAvatarFile);
        const savedImageUrl = readString(latestUser, [
          "profile_image_url",
          "profileImageUrl",
        ]);
        if (!savedImageUrl) {
          throw new Error(t("parent.hooks.profileImageNoUrl"));
        }
      }

      const mergedUser = latestUser ?? {
        id: profile.userId,
        full_name: formValues.fullName.trim(),
        email: profile.email,
        phone: formValues.phone.trim() || profile.phone,
        role: profile.role,
        is_email_verified: profile.isEmailVerified,
        profile_image_url: profile.profileImageUrl,
      };

      const nextProfile = mapProfileBundle(
        mergedUser,
        latestParentRow ?? {
          id: profile.profileId,
          user_id: profile.userId,
          address: formValues.address.trim() || null,
          relationship_notes: formValues.relationshipNotes.trim() || null,
          created_at: profile.createdAt,
        },
        mapperOptions,
      );

      onProfileSaved?.(nextProfile);

      try {
        const refreshedUser = await onRefreshSession?.();
        if (pendingAvatarFile && !readString(refreshedUser, [
          "profile_image_url",
          "profileImageUrl",
        ])) {
          throw new Error(t("parent.hooks.profileSessionRefreshFailed"));
        }
      } catch (refreshError) {
        const message = refreshError instanceof Error
          ? refreshError.message
          : t("parent.hooks.profileSessionRefreshFailed");
        setSaveError(message);
        setSyncedSnapshot(buildProfileSnapshot(nextProfile));
        setFormValues(mapProfileToFormValues(nextProfile));
        setPendingAvatarFile(null);
        return { ok: false, message };
      }

      setSyncedSnapshot(buildProfileSnapshot(nextProfile));
      setFormValues(mapProfileToFormValues(nextProfile));
      setPendingAvatarFile(null);
      setSuccessMessage(t("parent.hooks.profileUpdated"));
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : t("parent.hooks.profileSaveFailed");
      setSaveError(message);
      return { ok: false, message };
    } finally {
      saveGuardRef.current = false;
      setIsSaving(false);
    }
  }, [
    profile,
    isSaving,
    isDirty,
    formValues,
    pendingAvatarFile,
    onProfileSaved,
    onRefreshSession,
    mapperOptions,
    t,
  ]);

  return {
    formValues,
    fieldErrors,
    saveError,
    successMessage,
    isSaving,
    isDirty,
    pendingAvatarFile,
    avatarPreviewUrl,
    avatarError,
    setFieldValue,
    handleAvatarSelect,
    resetForm,
    saveProfile,
  };
}
