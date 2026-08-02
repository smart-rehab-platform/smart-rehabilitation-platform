import { useState } from "react";
import { Lock, Eye, EyeOff, ChevronRight, Check } from "lucide-react";
import { AuthInput } from "../../components/auth/AuthInput";
import { PasswordRequirementsChecklist } from "../../components/auth/PasswordRequirementsChecklist";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
import { C } from "../../components/auth/tokens";
import {
  getReviewStep,
  isPasswordValid,
  passwordsMatch,
} from "./signupWizardHelpers";
import { useSignupWizard } from "../../context/SignupWizardContext";

export function SignupStep4AccountSecurity({ onBack }) {
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
      showToast("Password is required.", "error");
      return;
    }

    if (!passwordValid) {
      showToast(
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
        "error",
      );
      return;
    }

    if (!confirmPassword) {
      showToast("Confirm password is required.", "error");
      return;
    }

    if (!confirmValid) {
      showToast("Passwords do not match.", "error");
      return;
    }

    if (!acceptedTerms) {
      showToast("You must accept the Terms of Service and Privacy Policy.", "error");
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
            label="Password"
            icon={<Lock size={16} />}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(value) => updateWizardData({ password: value })}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ color: C.iconInteractive, opacity: 0.85 }}
                className="transition-opacity hover:opacity-100"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <AuthInput
            label="Confirm Password"
            icon={<Lock size={16} />}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(value) => updateWizardData({ confirmPassword: value })}
            state={confirmState}
            message={confirmState === "error" ? "Passwords do not match." : ""}
            onBlur={() => setConfirmTouched(true)}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
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
                aria-label="Accept Terms of Service and Privacy Policy"
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
                I agree to the{" "}
                <button
                  type="button"
                  className="auth-footer-link font-semibold transition-colors"
                  onClick={(event) => event.preventDefault()}
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="auth-footer-link font-semibold transition-colors"
                  onClick={(event) => event.preventDefault()}
                >
                  Privacy Policy
                </button>
                .
              </span>
            </label>

            {termsTouched && !acceptedTerms && (
              <p className="mt-1.5 pl-1 text-xs" style={{ color: "#ef4444" }}>
                You must accept the Terms of Service and Privacy Policy.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="auth-secondary-btn flex-1">
            Back
          </button>
          <div className="flex-1">
            <PrimaryButton disabled={!canContinue} onClick={handleContinue}>
              <span>Continue</span>
              <ChevronRight size={16} className="auth-btn-arrow" />
            </PrimaryButton>
          </div>
        </div>
      </div>
    </>
  );
}
