import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, Eye, EyeOff, Lock, KeyRound } from "lucide-react";
import { AuthStatusCard } from "../../components/auth/AuthStatusCard";
import { AuthInput } from "../../components/auth/AuthInput";
import { PasswordStrength } from "../../components/auth/PasswordStrength";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
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
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [success, setSuccess] = useState(false);

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
    if (!token.trim()) {
      showToast("Please enter your reset token", "error");
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
        token: token.trim(),
        newPassword: password,
      });

      showToast(data.message, "success");
      setSuccess(true);
    } catch (error) {
      const message = readAuthApiMessage(error, "Failed to reset password");
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif", color: C.white }}>
              Reset Password
            </h2>
            <p className="text-sm" style={{ color: C.light }}>
              Enter your reset token and choose a strong new password.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <AuthInput
              label="Reset Token"
              icon={<KeyRound size={16} />}
              placeholder="Paste your reset token"
              value={token}
              onChange={setToken}
            />
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
                  onClick={() => setShowPw((v) => !v)}
                  style={{ color: C.light, opacity: 0.6 }}
                  className="hover:opacity-100 transition-opacity"
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
                  onClick={() => setShowCf((v) => !v)}
                  style={{ color: C.light, opacity: 0.6 }}
                  className="hover:opacity-100 transition-opacity"
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
                  <ChevronRight size={16} />
                </>
              )}
            </PrimaryButton>

            <p className="text-center text-xs" style={{ color: C.light }}>
              Back to{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-semibold transition-colors hover:text-white"
                style={{ color: C.primary }}
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
