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
import {
  getPasswordStrength,
  readAuthApiMessage,
  strongPasswordMessage,
} from "../../components/auth/authHelpers";
import api from "../../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  const passwordStrength = getPasswordStrength(password);
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
      showToast("Passwords do not match.", "error");
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
      const message = readAuthApiMessage(error, "Failed to reset password");

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
        title="Reset link expired"
        message="This password reset link is no longer valid. Please request a new password reset email."
        actionLabel="Request New Link"
        onAction={() => navigate("/forgot-password")}
      />
    );
  }

  return (
    <>
      <Toast message={toastMessage} visible={toast} variant={toastVariant} />
      {success ? (
        <AuthStatusCard
          title="Password Reset Complete"
          message="Your password has been changed successfully."
          actionLabel="Sign In"
          onAction={() => navigate("/login")}
        />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-2">
            <h2 className={authPageHeadingClassName} style={authPageHeadingStyle}>
              Reset Password
            </h2>
            <p className={authPageSubtitleClassName} style={authPageSubtitleStyle}>
              Enter your new password below.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <AuthInput
              label="New Password"
              icon={<Lock size={16} />}
              type={showPw ? "text" : "password"}
              placeholder="Enter your new password"
              value={password}
              onChange={setPassword}
              state={pwState}
              message={pwState === "error" ? strongPasswordMessage : ""}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPw((value) => !value)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  style={{ color: C.iconInteractive, opacity: 0.85 }}
                  className="transition-opacity hover:opacity-100"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <PasswordStrength password={password} />
            <AuthInput
              label="Confirm New Password"
              icon={<Lock size={16} />}
              type={showCf ? "text" : "password"}
              placeholder="Re-enter your new password"
              value={confirm}
              onChange={setConfirm}
              state={cfState}
              message={cfState === "error" ? "Passwords do not match." : ""}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowCf((value) => !value)}
                  aria-label={showCf ? "Hide confirm password" : "Show confirm password"}
                  style={{ color: C.iconInteractive, opacity: 0.85 }}
                  className="transition-opacity hover:opacity-100"
                >
                  {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <PrimaryButton loading={loading} onClick={handleSubmit}>
              {loading ? (
                "Resetting Password..."
              ) : (
                <>
                  <span>Reset Password</span>
                  <ChevronRight size={16} className="auth-btn-arrow" />
                </>
              )}
            </PrimaryButton>

            <p className="auth-footer-text text-center text-[13px] font-medium leading-relaxed">
              Back to{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="auth-footer-link font-semibold transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </>
      )}
    </>
  );
}
