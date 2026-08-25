import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ChevronRight, Check } from "lucide-react";
import { AuthInput } from "../../components/auth/AuthInput";
import { PasswordRequirementsChecklist } from "../../components/auth/PasswordRequirementsChecklist";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
import { C } from "../../components/auth/tokens";
import {
  getAuthBackLabel,
  getAuthContinueLabel,
  getAuthHideConfirmPasswordLabel,
  getAuthHidePasswordLabel,
  getAuthPasswordsDoNotMatchMessage,
  getAuthShowConfirmPasswordLabel,
  getAuthShowPasswordLabel,
  getStrongPasswordMessage,
} from "../../components/auth/authLocalization";
import {
  getReviewStep,
  isPasswordValid,
  passwordsMatch,
} from "./signupWizardHelpers";
import { useLocale } from "../../context/useLocale.js";
import { useSignupWizard } from "../../context/SignupWizardContext";

export function SignupStep4AccountSecurity({ onBack }) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { wizardData, updateWizardData, setWizardStep } = useSignupWizard();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [termsTouched, setTermsTouched] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  const password = wizardData.password ?? "";
  const confirmPassword = wizardData.confirmPassword ?? "";
  const acceptedTerms = Boolean(wizardData.acceptedTerms);

  const passwordValid = isPasswordValid(password);
  const confirmValid = passwordsMatch(password, confirmPassword);
  const passwordsDoNotMatchMessage = getAuthPasswordsDoNotMatchMessage(t);
  const strongPasswordMessage = getStrongPasswordMessage(t);

  const confirmState =
    confirmTouched && confirmPassword && !confirmValid ? "error" : "idle";

  const canContinue = passwordValid && confirmValid && acceptedTerms;

  const showToast = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handleContinue = () => {
    setConfirmTouched(true);
    setTermsTouched(true);

    if (!password) {
      showToast(t("auth.signup.passwordRequired"), "error");
      return;
    }

    if (!passwordValid) {
      showToast(strongPasswordMessage, "error");
      return;
    }

    if (!confirmPassword) {
      showToast(t("auth.signup.confirmPasswordRequired"), "error");
      return;
    }

    if (!confirmValid) {
      showToast(passwordsDoNotMatchMessage, "error");
      return;
    }

    if (!acceptedTerms) {
      showToast(t("auth.validation.termsRequired"), "error");
      return;
    }

    setWizardStep(getReviewStep());
  };

  return (
    <>
      <Toast message={toastMessage} visible={toast} variant={toastVariant} />

      <div className="signup-wizard-step flex flex-col">
        <div className="mb-3 flex flex-col gap-2.5">
          <AuthInput
            label={t("auth.signup.passwordLabel")}
            icon={<Lock size={16} />}
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.signup.passwordPlaceholder")}
            value={password}
            onChange={(value) => updateWizardData({ password: value })}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? getAuthHidePasswordLabel(t) : getAuthShowPasswordLabel(t)
                }
                style={{ color: C.iconInteractive, opacity: 0.85 }}
                className="transition-opacity hover:opacity-100"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <AuthInput
            label={t("auth.signup.confirmPasswordLabel")}
            icon={<Lock size={16} />}
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("auth.signup.confirmPasswordPlaceholder")}
            value={confirmPassword}
            onChange={(value) => updateWizardData({ confirmPassword: value })}
            state={confirmState}
            message={confirmState === "error" ? passwordsDoNotMatchMessage : ""}
            onBlur={() => setConfirmTouched(true)}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={
                  showConfirmPassword
                    ? getAuthHideConfirmPasswordLabel(t)
                    : getAuthShowConfirmPasswordLabel(t)
                }
                style={{ color: C.iconInteractive, opacity: 0.85 }}
                className="transition-opacity hover:opacity-100"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <PasswordRequirementsChecklist password={password} />

          <div className="pt-0.5">
            <label className="flex cursor-pointer items-start gap-2.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={acceptedTerms}
                aria-label={t("auth.signup.termsAcceptAria")}
                onClick={() => updateWizardData({ acceptedTerms: !acceptedTerms })}
                className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(79,166,248,0.35)]"
                style={{
                  borderColor: acceptedTerms ? C.primary : "rgba(79, 166, 248, 0.35)",
                  background: acceptedTerms ? C.primary : "rgba(255, 255, 255, 0.7)",
                  boxShadow: acceptedTerms ? "0 0 12px rgba(79, 166, 248, 0.25)" : "none",
                }}
              >
                {acceptedTerms && <Check size={11} color={C.white} strokeWidth={3} />}
              </button>

              <span
                className="text-[12px] leading-relaxed"
                style={{ color: "#5A7390", fontFamily: "'Inter', sans-serif" }}
              >
                {t("auth.signup.termsAgreementPrefix")}{" "}
                <button
                  type="button"
                  className="auth-footer-link font-semibold transition-colors"
                  onClick={(event) => event.preventDefault()}
                >
                  {t("auth.signup.termsOfService")}
                </button>{" "}
                {t("auth.signup.termsAnd")}{" "}
                <button
                  type="button"
                  className="auth-footer-link font-semibold transition-colors"
                  onClick={() => navigate("/privacy-policy")}
                >
                  {t("auth.signup.privacyPolicy")}
                </button>
                .
              </span>
            </label>

            {termsTouched && !acceptedTerms && (
              <p className="mt-1.5 pl-1 text-xs" style={{ color: "#ef4444" }}>
                {t("auth.validation.termsRequired")}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="auth-secondary-btn flex-1">
            {getAuthBackLabel(t)}
          </button>
          <div className="flex-1">
            <PrimaryButton disabled={!canContinue} onClick={handleContinue}>
              <span>{getAuthContinueLabel(t)}</span>
              <ChevronRight size={16} className="auth-btn-arrow" />
            </PrimaryButton>
          </div>
        </div>
      </div>
    </>
  );
}
