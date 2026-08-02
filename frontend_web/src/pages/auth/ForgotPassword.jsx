import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Mail } from "lucide-react";
import { AuthStatusCard } from "../../components/auth/AuthStatusCard";
import { AuthInput } from "../../components/auth/AuthInput";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
import {
  authPageHeadingClassName,
  authPageHeadingStyle,
  authPageSubtitleClassName,
  authPageSubtitleStyle,
} from "../../components/auth/authPageStyles";
import { readAuthApiMessage } from "../../components/auth/authHelpers";
import api from "../../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email?.trim() || "";
  const emailInputRef = useRef(null);
  const didFocusEmailRef = useRef(false);

  const [email, setEmail] = useState(prefilledEmail);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [success, setSuccess] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailState = email ? (emailValid ? "success" : "error") : "idle";

  const showToast = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  useEffect(() => {
    if (success || didFocusEmailRef.current) {
      return;
    }

    didFocusEmailRef.current = true;

    requestAnimationFrame(() => {
      const input = emailInputRef.current;
      if (!input) {
        return;
      }

      input.focus();

      if (email) {
        input.select();
      }
    });
  }, [success, email]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      showToast("Please enter your email address", "error");
      return;
    }

    if (!emailValid) {
      showToast("Invalid email address", "error");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      showToast(data.message, "success");
      setSuccess(true);
    } catch (error) {
      const message = readAuthApiMessage(error, "Failed to send reset link");
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate("/login", {
      state: email.trim() ? { email: email.trim() } : undefined,
    });
  };

  return (
    <>
      <Toast message={toastMessage} visible={toast} variant={toastVariant} />
      {success ? (
        <AuthStatusCard
          title="Reset Email Sent"
          message="If an account exists with this email, a password reset link has been sent."
          actionLabel="Back to Sign In"
          onAction={handleBackToSignIn}
        />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-2">
            <h2 className={authPageHeadingClassName} style={authPageHeadingStyle}>
              Reset Password
            </h2>
            <p className={authPageSubtitleClassName} style={authPageSubtitleStyle}>
              Enter your email address and we&apos;ll send you a secure password reset link.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <AuthInput
              label="Email Address"
              icon={<Mail size={16} />}
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={setEmail}
              state={emailState}
              message={emailState === "error" ? "Invalid email address" : ""}
              inputRef={emailInputRef}
            />

            <PrimaryButton loading={loading} onClick={handleSubmit}>
              {loading ? (
                "Sending Reset Link..."
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ChevronRight size={16} className="auth-btn-arrow" />
                </>
              )}
            </PrimaryButton>

            <p className="auth-footer-text text-center text-[13px] font-medium leading-relaxed">
              Remembered your password?{" "}
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="auth-footer-link font-semibold transition-colors"
              >
                Back to Sign In
              </button>
            </p>
          </div>
        </>
      )}
    </>
  );
}
