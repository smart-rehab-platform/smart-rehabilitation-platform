function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated) {
      return translated;
    }
  }

  return typeof fallback === "function" ? fallback(params) : fallback;
}

export function getAuthSignInLabel(t) {
  return translateKey(t, "auth.shared.signIn", "Sign In");
}

export function getAuthCreateAccountLabel(t) {
  return translateKey(t, "auth.shared.createAccount", "Create Account");
}

export function getAuthContinueLabel(t) {
  return translateKey(t, "auth.shared.continue", "Continue");
}

export function getAuthBackLabel(t) {
  return translateKey(t, "auth.shared.back", "Back");
}

export function getAuthRoleLabel(role, t) {
  if (role === "parent") {
    return translateKey(t, "auth.roles.parent", "Parent");
  }

  if (role === "specialist") {
    return translateKey(t, "auth.roles.specialist", "Specialist");
  }

  return translateKey(t, "auth.shared.emptyDisplay", "—");
}

export function getAuthInvalidEmailMessage(t) {
  return translateKey(t, "auth.validation.invalidEmail", "Invalid email address");
}

export function getAuthPasswordsDoNotMatchMessage(t) {
  return translateKey(t, "auth.validation.passwordsDoNotMatch", "Passwords do not match.");
}

export function getStrongPasswordMessage(t) {
  return translateKey(
    t,
    "auth.validation.passwordRequirements",
    "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
  );
}

export function getPasswordRules(t = null) {
  return [
    {
      key: "minLength",
      label: translateKey(t, "auth.password.ruleMinLength", "At least 8 characters"),
      satisfied: (password) => password.length >= 8,
    },
    {
      key: "uppercase",
      label: translateKey(t, "auth.password.ruleUppercase", "Contains uppercase letter"),
      satisfied: (password) => /[A-Z]/.test(password),
    },
    {
      key: "lowercase",
      label: translateKey(t, "auth.password.ruleLowercase", "Contains lowercase letter"),
      satisfied: (password) => /[a-z]/.test(password),
    },
    {
      key: "number",
      label: translateKey(t, "auth.password.ruleNumber", "Contains number"),
      satisfied: (password) => /\d/.test(password),
    },
    {
      key: "special",
      label: translateKey(t, "auth.password.ruleSpecialCharacter", "Contains special character"),
      satisfied: (password) => /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export function getPasswordStrength(password, t = null) {
  const rules = getPasswordRules(t).map((rule) => ({
    label: rule.label,
    satisfied: rule.satisfied(password),
  }));
  const satisfiedCount = rules.filter((rule) => rule.satisfied).length;
  const level = satisfiedCount >= 5 ? "strong" : satisfiedCount >= 3 ? "medium" : "weak";

  return {
    level,
    satisfiedCount,
    rules,
    isStrong: satisfiedCount === rules.length,
  };
}

export function getPasswordStrengthLabel(level, t) {
  if (level === "strong") {
    return translateKey(t, "auth.password.strengthStrong", "Strong");
  }

  if (level === "medium") {
    return translateKey(t, "auth.password.strengthMedium", "Medium");
  }

  return translateKey(t, "auth.password.strengthWeak", "Weak");
}

export function getAuthShowPasswordLabel(t) {
  return translateKey(t, "auth.shared.showPassword", "Show password");
}

export function getAuthHidePasswordLabel(t) {
  return translateKey(t, "auth.shared.hidePassword", "Hide password");
}

export function getAuthShowConfirmPasswordLabel(t) {
  return translateKey(t, "auth.shared.showConfirmPassword", "Show confirm password");
}

export function getAuthHideConfirmPasswordLabel(t) {
  return translateKey(t, "auth.shared.hideConfirmPassword", "Hide confirm password");
}

export function getDuplicateEmailMessages(t) {
  return {
    toast: translateKey(t, "auth.signup.duplicateEmailToast", "This email is already registered."),
    inline: translateKey(
      t,
      "auth.signup.duplicateEmailInline",
      "This email is already registered. Please use a different email or sign in.",
    ),
  };
}

export function formatAuthExperienceYears(years, t) {
  if (years === null || years === undefined || years === "") {
    return translateKey(t, "auth.shared.emptyDisplay", "—");
  }

  const value = Number(years);

  if (value === 1) {
    return translateKey(t, "auth.signup.experienceOneYear", "1 year");
  }

  const localized = translateKey(t, "auth.signup.experienceYears", "{count} years", { count: value });
  if (localized.includes("{count}")) {
    return `${value} years`;
  }

  return localized;
}

export function validateSpecialization(value, t = null) {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      valid: false,
      message: translateKey(t, "auth.validation.specializationRequired", "Specialization is required."),
    };
  }

  if (trimmed.length > 150) {
    return {
      valid: false,
      message: translateKey(
        t,
        "auth.validation.specializationMax",
        "Specialization must not exceed 150 characters.",
      ),
    };
  }

  return { valid: true, value: trimmed };
}

export function validateLicenseNumber(value, t = null) {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      valid: false,
      message: translateKey(t, "auth.validation.licenseRequired", "License number is required."),
    };
  }

  if (trimmed.length > 100) {
    return {
      valid: false,
      message: translateKey(
        t,
        "auth.validation.licenseMax",
        "License number must not exceed 100 characters.",
      ),
    };
  }

  return { valid: true, value: trimmed };
}

export function validateYearsOfExperience(value, t = null) {
  const requiredMessage = translateKey(
    t,
    "auth.validation.experienceRequired",
    "Years of experience is required.",
  );

  if (value === null || value === undefined || value === "") {
    return { valid: false, message: requiredMessage };
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(numericValue)) {
    return { valid: false, message: requiredMessage };
  }

  if (numericValue < 0) {
    return {
      valid: false,
      message: translateKey(
        t,
        "auth.validation.experienceMin",
        "Years of experience must be at least 0.",
      ),
    };
  }

  return { valid: true, value: numericValue };
}

export function validateBio(value, t = null) {
  if (!value) {
    return { valid: true, value: "" };
  }

  if (value.length > 500) {
    return {
      valid: false,
      message: translateKey(t, "auth.validation.bioMax", "Bio must not exceed 500 characters."),
    };
  }

  return { valid: true, value };
}

export function validateWizardForSubmission(wizardData, t = null) {
  if (!wizardData.role) {
    return {
      valid: false,
      step: 1,
      message: translateKey(t, "auth.validation.selectAccountType", "Please select an account type."),
    };
  }

  if (!wizardData.full_name?.trim()) {
    return {
      valid: false,
      step: 2,
      message: translateKey(t, "auth.validation.fullNameRequired", "Please enter your full name."),
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(wizardData.email ?? "")) {
    return {
      valid: false,
      step: 2,
      message: translateKey(t, "auth.validation.invalidEmail", "Invalid email address"),
    };
  }

  if (!wizardData.phone?.trim()) {
    return {
      valid: false,
      step: 2,
      message: translateKey(t, "auth.validation.phoneRequired", "Please enter your phone number."),
    };
  }

  if (wizardData.role === "specialist") {
    const profile = wizardData.specialist_profile ?? {
      specialization: "",
      license_number: "",
      years_of_experience: null,
      bio: "",
    };

    const specializationResult = validateSpecialization(profile.specialization, t);
    if (!specializationResult.valid) {
      return { valid: false, step: 3, message: specializationResult.message };
    }

    const licenseResult = validateLicenseNumber(profile.license_number, t);
    if (!licenseResult.valid) {
      return { valid: false, step: 3, message: licenseResult.message };
    }

    const yearsResult = validateYearsOfExperience(profile.years_of_experience, t);
    if (!yearsResult.valid) {
      return { valid: false, step: 3, message: yearsResult.message };
    }

    const bioResult = validateBio(profile.bio, t);
    if (!bioResult.valid) {
      return { valid: false, step: 3, message: bioResult.message };
    }
  }

  if (!getPasswordStrength(wizardData.password ?? "", t).isStrong) {
    return {
      valid: false,
      step: 4,
      message: translateKey(t, "auth.validation.validPasswordRequired", "Please create a valid password."),
    };
  }

  if (!(wizardData.confirmPassword?.length > 0 && wizardData.password === wizardData.confirmPassword)) {
    return {
      valid: false,
      step: 4,
      message: getAuthPasswordsDoNotMatchMessage(t),
    };
  }

  if (!wizardData.acceptedTerms) {
    return {
      valid: false,
      step: 4,
      message: translateKey(
        t,
        "auth.validation.termsRequired",
        "You must accept the Terms of Service and Privacy Policy.",
      ),
    };
  }

  return { valid: true };
}
