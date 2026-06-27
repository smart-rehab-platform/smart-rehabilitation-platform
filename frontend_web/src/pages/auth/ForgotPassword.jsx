import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Mail } from "lucide-react";
import { AuthStatusCard } from "../../components/auth/AuthStatusCard";
import { AuthInput } from "../../components/auth/AuthInput";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
import { C } from "../../components/auth/tokens";
import { readAuthApiMessage } from "../../components/auth/authHelpers";
import api from "../../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
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

  return (
    <>
      <Toast message={toastMessage} visible={toast} variant={toastVariant} />
      {success ? (
        <AuthStatusCard
          title="Reset Email Sent"
          message="If an account exists with this email, a password reset link has been sent."
          actionLabel="Back to Sign In"
          onAction={() => navigate("/login")}
        />
      ) : (
        <>
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif", color: C.white }}>
              Forgot Password
            </h2>
            <p className="text-sm" style={{ color: C.light }}>
              Enter your email and we will send you a password reset link.
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
            />

            <PrimaryButton loading={loading} onClick={handleSubmit}>
              {loading ? (
                "Sending Reset Link..."
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ChevronRight size={16} />
                </>
              )}
            </PrimaryButton>

            <p className="text-center text-xs" style={{ color: C.light }}>
              Remembered your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-semibold transition-colors hover:text-white"
                style={{ color: C.primary }}
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
