import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    const validationMessage = validateProfileImageFile(file);
    if (validationMessage) {
      setAvatarError(validationMessage);
      return;
    }

    setAvatarError(null);
    setPendingAvatarFile(file);
    setSaveError(null);
    setSuccessMessage(null);
  }, []);

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
    if (!profile || isSaving || saveGuardRef.current || !isDirty) {
      return false;
    }

    const validationErrors = validateProfileForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return false;
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
      );

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
        const message = refreshError instanceof Error
          ? refreshError.message
          : "Profile saved but the session could not be refreshed. Please reload the page.";
        setSaveError(message);
        setSyncedSnapshot(buildProfileSnapshot(nextProfile));
        setFormValues(mapProfileToFormValues(nextProfile));
        setPendingAvatarFile(null);
        return false;
      }

      setSyncedSnapshot(buildProfileSnapshot(nextProfile));
      setFormValues(mapProfileToFormValues(nextProfile));
      setPendingAvatarFile(null);
      setSuccessMessage("Profile updated successfully.");
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save profile.");
      return false;
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
