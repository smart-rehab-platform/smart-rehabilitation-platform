import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, Eye, EyeOff, Lock } from "lucide-react";
import { AuthStatusCard } from "../../components/auth/AuthStatusCard";
import { AuthInput } from "../../components/auth/AuthInput";
import { PasswordStrength } from "../../components/auth/PasswordStrength";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
import {
  authPageHeadingClassName,
  authPageHeadingStyle,
  authPageSubtitleClassName,
  authPageSubtitleStyle,
  isInvalidResetTokenMessage,
} from "../../components/auth/authPageStyles";
import { C } from "../../components/auth/tokens";
import { readAuthApiMessage } from "../../components/auth/authHelpers";
import {
  getAuthHideConfirmPasswordLabel,
  getAuthHidePasswordLabel,
  getAuthPasswordsDoNotMatchMessage,
  getAuthShowConfirmPasswordLabel,
  getAuthShowPasswordLabel,
  getPasswordStrength,
  getStrongPasswordMessage,
} from "../../components/auth/authLocalization";
import { useLocale } from "../../context/useLocale.js";
import api from "../../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLocale();
  const resetToken = searchParams.get("token")?.trim() || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [success, setSuccess] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(!resetToken);

  const strongPasswordMessage = getStrongPasswordMessage(t);
  const passwordsDoNotMatchMessage = getAuthPasswordsDoNotMatchMessage(t);
  const passwordStrength = getPasswordStrength(password, t);
  const pwValid = passwordStrength.isStrong;
  const cfValid = confirm === password && confirm.length > 0;

  const pwState = password ? (pwValid ? "success" : "error") : "idle";
  const cfState = confirm ? (cfValid ? "success" : "error") : "idle";

  const showToast = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handleSubmit = async () => {
    if (!resetToken) {
      setLinkInvalid(true);
      return;
    }

    if (!pwValid) {
      showToast(strongPasswordMessage, "error");
      return;
    }

    if (!cfValid) {
      showToast(passwordsDoNotMatchMessage, "error");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/reset-password", {
        token: resetToken,
        newPassword: password,
      });

      showToast(data.message, "success");
      setSuccess(true);
    } catch (error) {
      const message = readAuthApiMessage(error, t("auth.resetPassword.failed"));

      if (isInvalidResetTokenMessage(message)) {
        setLinkInvalid(true);
        return;
      }

      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (linkInvalid) {
    return (
      <AuthStatusCard
        variant="error"
        title={t("auth.resetPassword.linkExpiredTitle")}
        message={t("auth.resetPassword.linkExpiredMessage")}
        actionLabel={t("auth.resetPassword.requestNewLink")}
        onAction={() => navigate("/forgot-password")}
      />
    );
  }

  return (
    <>
      <Toast message={toastMessage} visible={toast} variant={toastVariant} />
      {success ? (
        <AuthStatusCard
          title={t("auth.resetPassword.completeTitle")}
          message={t("auth.resetPassword.completeMessage")}
          actionLabel={t("auth.shared.signIn")}
          onAction={() => navigate("/login")}
        />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-2">
            <h2 className={authPageHeadingClassName} style={authPageHeadingStyle}>
              {t("auth.resetPassword.title")}
            </h2>
            <p className={authPageSubtitleClassName} style={authPageSubtitleStyle}>
              {t("auth.resetPassword.subtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <AuthInput
              label={t("auth.resetPassword.newPasswordLabel")}
              icon={<Lock size={16} />}
              type={showPw ? "text" : "password"}
              placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
              value={password}
              onChange={setPassword}
              state={pwState}
              message={pwState === "error" ? strongPasswordMessage : ""}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPw((value) => !value)}
                  aria-label={showPw ? getAuthHidePasswordLabel(t) : getAuthShowPasswordLabel(t)}
                  style={{ color: C.iconInteractive, opacity: 0.85 }}
                  className="transition-opacity hover:opacity-100"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <PasswordStrength password={password} />
            <AuthInput
              label={t("auth.resetPassword.confirmPasswordLabel")}
              icon={<Lock size={16} />}
              type={showCf ? "text" : "password"}
              placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
              value={confirm}
              onChange={setConfirm}
              state={cfState}
              message={cfState === "error" ? passwordsDoNotMatchMessage : ""}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowCf((value) => !value)}
                  aria-label={
                    showCf ? getAuthHideConfirmPasswordLabel(t) : getAuthShowConfirmPasswordLabel(t)
                  }
                  style={{ color: C.iconInteractive, opacity: 0.85 }}
                  className="transition-opacity hover:opacity-100"
                >
                  {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <PrimaryButton loading={loading} onClick={handleSubmit}>
              {loading ? (
                t("auth.resetPassword.resetting")
              ) : (
                <>
                  <span>{t("auth.resetPassword.title")}</span>
                  <ChevronRight size={16} className="auth-btn-arrow" />
                </>
              )}
            </PrimaryButton>

            <p className="auth-footer-text text-center text-[13px] font-medium leading-relaxed">
              {t("auth.resetPassword.backToPrefix")}{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="auth-footer-link font-semibold transition-colors"
              >
                {t("auth.shared.signIn")}
              </button>
            </p>
          </div>
        </>
      )}
    </>
  );
}
