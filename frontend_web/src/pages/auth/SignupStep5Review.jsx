import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CheckCircle2, Lock, Mail } from "lucide-react";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
import { readAuthApiMessage } from "../../components/auth/authHelpers";
import {
  formatAuthExperienceYears,
  getAuthBackLabel,
  getAuthCreateAccountLabel,
  getAuthRoleLabel,
} from "../../components/auth/authLocalization";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import { useSignupWizard } from "../../context/SignupWizardContext";
import {
  buildRegistrationPayload,
  EMPTY_SPECIALIST_PROFILE,
  getClearWizardProfileImagePatch,
  getDisplayProfileImage,
  getDuplicateEmailCopy,
  getSecurityStep,
  isDuplicateEmailError,
  revokeWizardProfileImagePreview,
  validateWizardForSubmission,
} from "./signupWizardHelpers";

function ReviewSection({
  title,
  editLabel,
  editButtonLabel,
  onEdit,
  disabled,
  children,
  isLast = false,
}) {
  return (
    <section className="signup-review-section" aria-labelledby={`review-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h3
          id={`review-${title.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-[11px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: "#5A7390" }}
        >
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="signup-review-edit auth-footer-link rounded px-1 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,166,248,0.35)] disabled:cursor-not-allowed disabled:opacity-45"
          aria-label={editLabel}
        >
          {editButtonLabel}
        </button>
      </div>
      <div className="signup-review-section-body">{children}</div>
      {!isLast && <div className="signup-review-divider" aria-hidden />}
    </section>
  );
}

function ReviewValue({ label, value, clamp = false }) {
  return (
    <div className="signup-review-value">
      {label ? (
        <p className="text-[11px] font-medium leading-none" style={{ color: "#6B849F" }}>
          {label}
        </p>
      ) : null}
      <p
        className={`mt-0.5 text-[13px] font-medium leading-snug ${clamp ? "signup-review-bio-clamp" : ""}`}
        style={{ color: "#0F2342" }}
      >
        {value}
      </p>
    </div>
  );
}

export function SignupStep5Review({ onBack }) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const auth = useAuth();
  const {
    wizardData,
    updateWizardData,
    setWizardStep,
    setWizardNotice,
    setServerErrors,
    isRegistrationSubmitting,
    setIsRegistrationSubmitting,
  } = useSignupWizard();

  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const successHeadingRef = useRef(null);
  const submitLockRef = useRef(false);

  const profile = wizardData.specialist_profile ?? EMPTY_SPECIALIST_PROFILE;
  const validation = useMemo(() => validateWizardForSubmission(wizardData, t), [wizardData, t]);
  const isBusy = isRegistrationSubmitting || resending;
  const canSubmit = validation.valid && !isBusy;
  const emptyDisplay = t("auth.shared.emptyDisplay");

  const displayProfileImage = getDisplayProfileImage(wizardData);
  const roleLabel = getAuthRoleLabel(wizardData.role, t);

  useEffect(() => {
    setAvatarBroken(false);
    setAvatarSrc(displayProfileImage);
  }, [displayProfileImage]);

  const handleAvatarError = () => {
    if (
      wizardData.profileImagePreview &&
      avatarSrc !== wizardData.profileImagePreview
    ) {
      setAvatarSrc(wizardData.profileImagePreview);
      return;
    }

    setAvatarBroken(true);
  };

  const showToast = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const clearSensitiveWizardData = () => {
    revokeWizardProfileImagePreview(wizardData.profileImagePreview);
    updateWizardData({
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
      specialist_profile: null,
      ...getClearWizardProfileImagePatch(),
    });
  };

  const handleEditStep = (step) => {
    if (isBusy) return;
    setWizardStep(step);
  };

  const handleCreateAccount = async () => {
    if (submitLockRef.current || isRegistrationSubmitting) {
      return;
    }

    const result = validateWizardForSubmission(wizardData, t);
    if (!result.valid) {
      if (result.message) {
        showToast(result.message, "error");
      }
      setWizardStep(result.step);
      return;
    }

    submitLockRef.current = true;
    setIsRegistrationSubmitting(true);

    try {
      const payload = buildRegistrationPayload(wizardData);
      await auth.register(payload);

      const email = wizardData.email.trim();
      setRegisteredEmail(email);
      clearSensitiveWizardData();
      setRegistrationComplete(true);
    } catch (error) {
      const message = readAuthApiMessage(error, t("auth.signup.registrationFailed"));

      if (isDuplicateEmailError(message)) {
        const duplicateEmailCopy = getDuplicateEmailCopy(t);
        setServerErrors({
          email: duplicateEmailCopy.inline,
        });
        setWizardNotice({
          step: 2,
          message: duplicateEmailCopy.toast,
          variant: "error",
          focusField: "email",
          duration: 7000,
          toastKey: `duplicate-email-${wizardData.email.trim().toLowerCase()}`,
        });
        setWizardStep(2);
        return;
      }

      showToast(message, "error");
    } finally {
      submitLockRef.current = false;
      setIsRegistrationSubmitting(false);
    }
  };

  const handleGoToSignIn = () => {
    navigate("/login", { state: { prefillEmail: registeredEmail } });
  };

  const handleResendVerification = async () => {
    if (!registeredEmail || resending) {
      return;
    }

    setResending(true);
    try {
      const message = await auth.sendVerification(registeredEmail);
      showToast(message, "success");
    } catch (error) {
      showToast(readAuthApiMessage(error, t("auth.signup.verificationEmailFailed")), "error");
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (registrationComplete && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [registrationComplete]);

  if (registrationComplete) {
    return (
      <>
        <Toast message={toastMessage} visible={toast} variant={toastVariant} />

        <div className="signup-wizard-step flex flex-col">
          <div className="signup-review-success flex flex-col items-center px-1 py-1 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full border"
              style={{
                background: "rgba(34, 197, 94, 0.12)",
                borderColor: "rgba(34, 197, 94, 0.35)",
              }}
            >
              <Mail size={24} style={{ color: "#22c55e" }} aria-hidden />
            </div>

            <h2
              ref={successHeadingRef}
              tabIndex={-1}
              className="mt-4 text-[1.35rem] font-bold leading-tight outline-none sm:text-[1.5rem]"
              style={{ fontFamily: "'Syne', sans-serif", color: "#0F2342" }}
            >
              {t("auth.signup.checkEmailTitle")}
            </h2>

            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "#5A7390" }}>
              {t("auth.signup.checkEmailSentTo")}
            </p>
            <p className="mt-1 text-[14px] font-semibold break-all" style={{ color: "#0F2342" }}>
              {registeredEmail}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "#5A7390" }}>
              {t("auth.signup.checkEmailVerifyBeforeSignIn")}
            </p>

            <div className="mt-5 w-full space-y-2.5">
              <PrimaryButton onClick={handleGoToSignIn}>
                <span>{t("auth.signup.goToSignIn")}</span>
              </PrimaryButton>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="auth-secondary-btn w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resending ? t("auth.signup.resending") : t("auth.signup.resendVerificationEmail")}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toast message={toastMessage} visible={toast} variant={toastVariant} />

      <div className="signup-wizard-step flex flex-col">
        <div
          className="signup-review-scroll mb-2.5 flex flex-col gap-0"
          role="region"
          aria-label={t("auth.signup.reviewRegionAria")}
        >
          <ReviewSection
            title={t("auth.signup.accountType")}
            editLabel={t("auth.signup.editAccountTypeAria")}
            editButtonLabel={t("auth.signup.edit")}
            onEdit={() => handleEditStep(1)}
            disabled={isBusy}
          >
            <ReviewValue value={roleLabel} />
          </ReviewSection>

          <ReviewSection
            title={t("auth.signup.personalDetails")}
            editLabel={t("auth.signup.editPersonalDetailsAria")}
            editButtonLabel={t("auth.signup.edit")}
            onEdit={() => handleEditStep(2)}
            disabled={isBusy}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="signup-review-avatar flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border"
                style={{
                  borderColor: "rgba(79, 166, 248, 0.22)",
                  background: "rgba(255, 255, 255, 0.72)",
                }}
              >
                {avatarSrc && !avatarBroken ? (
                  <img
                    src={avatarSrc}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={handleAvatarError}
                  />
                ) : (
                  <Camera size={16} style={{ color: "#6B849F" }} aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold leading-tight" style={{ color: "#0F2342" }}>
                  {wizardData.full_name.trim() || emptyDisplay}
                </p>
                <p className="mt-0.5 truncate text-[12px] leading-snug" style={{ color: "#5A7390" }}>
                  {wizardData.email.trim() || emptyDisplay}
                </p>
                <p className="mt-0.5 truncate text-[12px] leading-snug" style={{ color: "#5A7390" }}>
                  {wizardData.phone.trim() || emptyDisplay}
                </p>
              </div>
            </div>
          </ReviewSection>

          {wizardData.role === "specialist" && (
            <ReviewSection
              title={t("auth.signup.professionalDetails")}
              editLabel={t("auth.signup.editProfessionalDetailsAria")}
              editButtonLabel={t("auth.signup.edit")}
              onEdit={() => handleEditStep(3)}
              disabled={isBusy}
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <ReviewValue
                  label={t("auth.signup.specializationLabel")}
                  value={profile.specialization.trim() || emptyDisplay}
                />
                <ReviewValue
                  label={t("auth.signup.licenseNumberLabel")}
                  value={profile.license_number.trim() || emptyDisplay}
                />
                <ReviewValue
                  label={t("auth.signup.experienceLabel")}
                  value={formatAuthExperienceYears(profile.years_of_experience, t)}
                />
              </div>
              {profile.bio?.trim() ? (
                <div className="mt-2">
                  <ReviewValue label={t("auth.signup.bioLabel")} value={profile.bio.trim()} clamp />
                </div>
              ) : null}
            </ReviewSection>
          )}

          <ReviewSection
            title={t("auth.signup.securitySection")}
            editLabel={t("auth.signup.editSecurityAria")}
            editButtonLabel={t("auth.signup.edit")}
            onEdit={() => handleEditStep(getSecurityStep())}
            disabled={isBusy}
            isLast
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} style={{ color: "#22c55e" }} aria-hidden />
              <Lock size={14} style={{ color: "#6B849F" }} aria-hidden />
              <p className="text-[13px] font-medium" style={{ color: "#0F2342" }}>
                {t("auth.signup.passwordCreatedSecurely")}
              </p>
            </div>
          </ReviewSection>
        </div>

        <p className="mb-2.5 text-[11px] leading-relaxed" style={{ color: "#6B849F" }}>
          {t("auth.signup.reviewConfirmAccuracy")}
        </p>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onBack}
            disabled={isBusy}
            className="auth-secondary-btn flex-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {getAuthBackLabel(t)}
          </button>
          <div className="flex-1">
            <PrimaryButton
              disabled={!canSubmit}
              loading={isRegistrationSubmitting}
              onClick={handleCreateAccount}
              aria-busy={isRegistrationSubmitting}
            >
              <span>
                {isRegistrationSubmitting
                  ? t("auth.signup.creatingAccount")
                  : getAuthCreateAccountLabel(t)}
              </span>
            </PrimaryButton>
          </div>
        </div>
      </div>

      <style>{`
        .signup-review-scroll {
          max-height: min(280px, 42vh);
          overflow-y: auto;
          padding-right: 2px;
        }

        .signup-review-section + .signup-review-section {
          padding-top: 0.625rem;
        }

        .signup-review-divider {
          margin-top: 0.625rem;
          height: 1px;
          background: rgba(79, 166, 248, 0.14);
        }

        .signup-review-bio-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .signup-review-edit:not(:disabled):hover {
          color: #1f8eb5 !important;
        }

        @media (max-width: 479px) {
          .signup-review-scroll {
            max-height: min(240px, 38vh);
          }
        }
      `}</style>
    </>
  );
}
