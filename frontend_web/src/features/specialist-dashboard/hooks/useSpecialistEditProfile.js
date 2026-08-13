import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createSpecialistProfile,
  updateSpecialistProfile,
  updateUserProfile,
  uploadProfileImage,
} from "../../../services/specialistProfileService";
import {
  buildProfessionalUpdatePayload,
  buildUserUpdatePayload,
  isProfileFormDirty,
  mapProfileToFormValues,
  mapSpecialistProfileBundle,
  readString,
  validateProfileImageFile,
  validateSpecialistProfileForm,
} from "../utils/specialistProfileMappers";

function buildProfileSnapshot(profile) {
  if (!profile) {
    return "";
  }

  return [
    profile.userId,
    profile.profileId ?? "",
    profile.fullName,
    profile.phone ?? "",
    profile.specialization ?? "",
    profile.licenseNumber ?? "",
    profile.yearsOfExperience ?? "",
    profile.bio ?? "",
    profile.profileImageUrl ?? "",
  ].join("|");
}

export function useSpecialistEditProfile({
  profile,
  onProfileSaved,
  onRefreshSession,
}) {
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
      setAvatarError(validationMessage);
      return;
    }

    setAvatarError(null);
    setPendingAvatarFile(file);
    setSaveError(null);
  }, []);

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

    const validationErrors = validateSpecialistProfileForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      return { ok: false, message: firstError };
    }

    saveGuardRef.current = true;
    setIsSaving(true);
    setSaveError(null);
    setFieldErrors({});

    let latestUser;
    let latestSpecialistRow;
    let nextProfileId = profile.profileId;

    try {
      latestUser = await updateUserProfile(buildUserUpdatePayload(formValues));

      const professionalPayload = buildProfessionalUpdatePayload(formValues);
      if (nextProfileId) {
        latestSpecialistRow = await updateSpecialistProfile(
          nextProfileId,
          professionalPayload,
        );
      } else {
        latestSpecialistRow = await createSpecialistProfile(professionalPayload);
        nextProfileId = readString(latestSpecialistRow, ["id", "_id"]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save profile.";
      setSaveError(message);
      saveGuardRef.current = false;
      setIsSaving(false);
      return { ok: false, message };
    }

    if (pendingAvatarFile) {
      try {
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
      } catch (error) {
        const message = error instanceof Error
          ? `Profile details were saved, but the image upload failed: ${error.message}`
          : "Profile details were saved, but the image upload failed.";
        setSaveError(message);
        saveGuardRef.current = false;
        setIsSaving(false);
        return { ok: false, message };
      }
    }

    const mergedUser = latestUser ?? {
      id: profile.userId,
      full_name: formValues.fullName.trim(),
      email: profile.email,
      phone: formValues.phone.trim() || profile.phone,
      role: profile.role,
      profile_image_url: profile.profileImageUrl,
    };

    const nextProfile = mapSpecialistProfileBundle(
      mergedUser,
      latestSpecialistRow ?? {
        id: nextProfileId,
        user_id: profile.userId,
        specialization: formValues.specialization.trim() || null,
        license_number: formValues.licenseNumber.trim() || null,
        bio: formValues.bio.trim() || null,
        years_of_experience: formValues.yearsOfExperience.trim()
          ? Number.parseInt(formValues.yearsOfExperience.trim(), 10)
          : null,
      },
    );

    onProfileSaved?.(nextProfile);

    try {
      await onRefreshSession?.();
    } catch (refreshError) {
      const message = refreshError instanceof Error
        ? refreshError.message
        : "Profile saved but the session could not be refreshed. Please reload the page.";
      setSaveError(message);
      setSyncedSnapshot(buildProfileSnapshot(nextProfile));
      setFormValues(mapProfileToFormValues(nextProfile));
      setPendingAvatarFile(null);
      saveGuardRef.current = false;
      setIsSaving(false);
      return { ok: false, message };
    }

    setSyncedSnapshot(buildProfileSnapshot(nextProfile));
    setFormValues(mapProfileToFormValues(nextProfile));
    setPendingAvatarFile(null);
    saveGuardRef.current = false;
    setIsSaving(false);
    return { ok: true };
  }, [
    profile,
    isSaving,
    formValues,
    pendingAvatarFile,
    onProfileSaved,
    onRefreshSession,
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
