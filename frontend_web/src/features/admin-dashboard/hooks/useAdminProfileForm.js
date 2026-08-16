import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  updateUserProfile,
  uploadAdminProfileImage,
} from "../../../services/adminProfileService";
import {
  getAdminProfileValidationMessages,
  localizeProfileErrorMessage,
  localizeProfileValidationErrors,
} from "../utils/adminProfileLocalization.js";
import {
  buildUserUpdatePayload,
  hasUserFieldChanges,
  isProfileFormDirty,
  mapAdminProfileFromUser,
  mapProfileToFormValues,
  validateProfileForm,
  validateProfileImageFile,
} from "../utils/adminProfileUtils";

function readString(record, keys) {
  if (!record || typeof record !== "object") {
    return "";
  }

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function buildProfileSnapshot(profile) {
  if (!profile) {
    return "";
  }

  return [
    profile.userId,
    profile.fullName,
    profile.phone ?? "",
    profile.profileImageUrl ?? "",
  ].join("|");
}

export function useAdminProfileForm({
  profile,
  onProfileSaved,
  onRefreshSession,
}) {
  const { t } = useLocale();
  const validationMessages = useMemo(() => getAdminProfileValidationMessages(t), [t]);
  const profileSnapshot = buildProfileSnapshot(profile);
  const [syncedSnapshot, setSyncedSnapshot] = useState(profileSnapshot);
  const [formValues, setFormValues] = useState(() => mapProfileToFormValues(profile));
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [avatarError, setAvatarError] = useState(null);
  const saveGuardRef = useRef(false);

  if (profileSnapshot !== syncedSnapshot) {
    setSyncedSnapshot(profileSnapshot);
    setFormValues(mapProfileToFormValues(profile));
    setFieldErrors({});
    setSaveError(null);
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
  }, []);

  const handleAvatarSelect = useCallback((file) => {
    const validationMessage = validateProfileImageFile(file);
    if (validationMessage) {
      setAvatarError(validationMessages.imageRequired);
      return;
    }

    setAvatarError(null);
    setPendingAvatarFile(file);
    setSaveError(null);
  }, [validationMessages.imageRequired]);

  const resetForm = useCallback(() => {
    setSyncedSnapshot(buildProfileSnapshot(profile));
    setFormValues(mapProfileToFormValues(profile));
    setFieldErrors({});
    setSaveError(null);
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

    const validationErrors = validateProfileForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      const localizedErrors = localizeProfileValidationErrors(validationErrors, t);
      setFieldErrors(localizedErrors);
      const firstError = Object.values(localizedErrors)[0];
      return { ok: false, message: firstError };
    }

    saveGuardRef.current = true;
    setIsSaving(true);
    setSaveError(null);
    setFieldErrors({});

    try {
      let latestUser = null;

      if (hasUserFieldChanges(formValues, profile)) {
        latestUser = await updateUserProfile(buildUserUpdatePayload(formValues, profile));
      }

      if (pendingAvatarFile) {
        latestUser = await uploadAdminProfileImage(pendingAvatarFile);
        const savedImageUrl = readString(latestUser, [
          "profile_image_url",
          "profileImageUrl",
        ]);
        if (!savedImageUrl) {
          throw new Error(
            "Profile image upload succeeded but no image URL was returned.",
          );
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
        created_at: profile.createdAt,
      };

      const nextProfile = mapAdminProfileFromUser(mergedUser);
      onProfileSaved?.(nextProfile);

      try {
        const refreshedUser = await onRefreshSession?.();
        if (pendingAvatarFile && !readString(refreshedUser, [
          "profile_image_url",
          "profileImageUrl",
        ])) {
          throw new Error("Session refresh did not return the updated profile image.");
        }
      } catch (refreshError) {
        const message = localizeProfileErrorMessage(
          refreshError instanceof Error
            ? refreshError.message
            : "Profile saved but the session could not be refreshed. Please reload the page.",
          t,
        );
        setSaveError(message);
        setSyncedSnapshot(buildProfileSnapshot(nextProfile));
        setFormValues(mapProfileToFormValues(nextProfile));
        setPendingAvatarFile(null);
        return { ok: false, message };
      }

      setSyncedSnapshot(buildProfileSnapshot(nextProfile));
      setFormValues(mapProfileToFormValues(nextProfile));
      setPendingAvatarFile(null);
      return { ok: true };
    } catch (error) {
      const message = localizeProfileErrorMessage(
        error instanceof Error ? error.message : "Failed to save profile.",
        t,
      );
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
    t,
  ]);

  return {
    formValues,
    fieldErrors,
    saveError,
    isSaving,
    isDirty,
    avatarPreviewUrl,
    avatarError,
    setFieldValue,
    handleAvatarSelect,
    resetForm,
    saveProfile,
  };
}
