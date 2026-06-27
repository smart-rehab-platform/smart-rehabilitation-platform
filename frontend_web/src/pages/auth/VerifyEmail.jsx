import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthStatusCard } from "../../components/auth/AuthStatusCard";
import { Toast } from "../../components/auth/Toast";
import { readAuthApiMessage } from "../../components/auth/authHelpers";
import api from "../../services/api";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [status, setStatus] = useState("loading");

  const showToast = useCallback((message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }, []);

  useEffect(() => {
    const token = searchParams.get("token")?.trim();

    if (!token) {
      setStatus("error");
      showToast("Verification link is missing or invalid.", "error");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const { data } = await api.get("/auth/verify-email", {
          params: { token },
        });

        if (cancelled) return;
        setStatus("success");
        showToast(data.message || "Email verified successfully.", "success");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        showToast(
          readAuthApiMessage(error, "Unable to verify your email right now."),
          "error"
        );
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [searchParams, showToast]);

  return (
    <>
      <Toast message={toastMessage} visible={toast} variant={toastVariant} />
      {status === "loading" ? (
        <AuthStatusCard
          variant="loading"
          title="Verifying Email"
          message="Please wait while we confirm your email address."
        />
      ) : status === "success" ? (
        <AuthStatusCard
          title="Email Verified"
          message="Your email has been verified successfully. You can now sign in."
          actionLabel="Go to Login"
          onAction={() => navigate("/login")}
        />
      ) : (
        <AuthStatusCard
          variant="error"
          title="Verification Failed"
          message="We could not verify your email with this link. Please request a new verification email if needed."
          actionLabel="Go to Login"
          onAction={() => navigate("/login")}
        />
      )}
    </>
  );
}
