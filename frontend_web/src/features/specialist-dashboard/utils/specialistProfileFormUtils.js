export const EMPTY_VALUE = "—";

export function formatOptionalProfileValue(value) {
  if (value == null || value === "") {
    return EMPTY_VALUE;
  }
  return String(value);
}

export function mapProfileToFormValues(bundle) {
  return {
    fullName: bundle?.fullName ?? "",
    phone: bundle?.phone ?? "",
    specialization: bundle?.specialization ?? "",
    licenseNumber: bundle?.licenseNumber ?? "",
    yearsOfExperience:
      bundle?.yearsOfExperience == null ? "" : String(bundle.yearsOfExperience),
    bio: bundle?.bio ?? "",
  };
}

export function validateProfileImageFile(file) {
  if (!file) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    return "Please choose an image file.";
  }

  return null;
}

export function validateSpecialistProfileForm(formValues) {
  const errors = {};
  const fullName = String(formValues?.fullName ?? "").trim();

  if (!fullName) {
    errors.fullName = "Full name is required";
  }

  const yearsText = String(formValues?.yearsOfExperience ?? "").trim();
  if (yearsText) {
    const years = Number.parseInt(yearsText, 10);
    if (!Number.isFinite(years) || years < 0) {
      errors.yearsOfExperience = "Years of experience must be a valid number";
    }
  }

  return errors;
}

export function buildUserUpdatePayload(formValues) {
  const phone = String(formValues?.phone ?? "").trim();
  return {
    full_name: String(formValues?.fullName ?? "").trim(),
    phone: phone || null,
  };
}

export function buildProfessionalUpdatePayload(formValues) {
  const yearsText = String(formValues?.yearsOfExperience ?? "").trim();
  const years = yearsText ? Number.parseInt(yearsText, 10) : null;

  const nullableTrim = (value) => {
    const trimmed = String(value ?? "").trim();
    return trimmed || null;
  };

  return {
    specialization: nullableTrim(formValues?.specialization),
    license_number: nullableTrim(formValues?.licenseNumber),
    bio: nullableTrim(formValues?.bio),
    years_of_experience: years,
  };
}

export function isProfileFormDirty(formValues, bundle, pendingAvatarFile) {
  if (pendingAvatarFile) {
    return true;
  }

  if (!bundle) {
    return false;
  }

  const baseline = mapProfileToFormValues(bundle);
  return (
    baseline.fullName !== String(formValues?.fullName ?? "")
    || baseline.phone !== String(formValues?.phone ?? "")
    || baseline.specialization !== String(formValues?.specialization ?? "")
    || baseline.licenseNumber !== String(formValues?.licenseNumber ?? "")
    || baseline.yearsOfExperience !== String(formValues?.yearsOfExperience ?? "")
    || baseline.bio !== String(formValues?.bio ?? "")
  );
}

export function findSpecialistProfileRow(rows, userId) {
  if (!userId || !Array.isArray(rows)) {
    return null;
  }

  return rows.find((row) => {
    const rowUserId = readString(row, ["user_id", "userId"]);
    return rowUserId === userId;
  }) ?? null;
}

function readString(source, keys) {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}
