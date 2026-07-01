import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "lucide-react";
import { AuthInput } from "../../components/auth/AuthInput";
import { AuthStatusCard } from "../../components/auth/AuthStatusCard";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
import { C } from "../../components/auth/tokens";
import { readAuthApiMessage } from "../../components/auth/authHelpers";
import { useAuth } from "../../context/useAuth";
import { dashboardForRole } from "../../routes/roleRouting";

function extractVerificationToken(rawValue) {
  const trimmed = rawValue?.trim() || "";
  if (!trimmed) {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmed);
    return parsedUrl.searchParams.get("token")?.trim() || trimmed;
  } catch {
    return trimmed;
  }
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email")?.trim() || "";
  const queryToken = extractVerificationToken(searchParams.get("token"));
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [status, setStatus] = useState(queryToken ? "loading" : "pending");
  const [manualToken, setManualToken] = useState("");
  const [showManualVerify, setShowManualVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [successTarget, setSuccessTarget] = useState("/login");
  const [successActionLabel, setSuccessActionLabel] = useState("Go to Login");
  const [successMessage, setSuccessMessage] = useState("Email verified successfully.");
  const verifiedTokenRef = useRef(new Set());

  const showToast = useCallback((message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }, []);

  const syncAuthAfterVerification = useCallback(async () => {
    const refreshedUser = await auth.refreshSession();

    if (refreshedUser?.is_email_verified) {
      const destination = dashboardForRole(refreshedUser.role) || "/login";
      setSuccessTarget(destination);
      setSuccessActionLabel(destination === "/login" ? "Go to Login" : "Go to Dashboard");
      return refreshedUser;
    }

    setSuccessTarget("/login");
    setSuccessActionLabel("Go to Login");
    return null;
  }, [auth]);

  const verifyWithToken = useCallback(
    async (token) => {
      if (verifiedTokenRef.current.has(token)) {
        return;
      }

      verifiedTokenRef.current.add(token);
      setLoading(true);
      setStatus("loading");

      try {
        await auth.verifyEmail(token);
        await syncAuthAfterVerification();
        setStatus("success");
        setSuccessMessage("Email verified successfully.");
        showToast("Email verified successfully", "success");
      } catch (error) {
        const refreshedUser = await syncAuthAfterVerification();
        if (refreshedUser?.is_email_verified) {
          setStatus("success");
          setSuccessMessage("Email verified successfully.");
          showToast("Email verified successfully", "success");
          return;
        }

        setStatus("error");
        showToast(
          readAuthApiMessage(error, "Unable to verify your email right now."),
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [auth, showToast, syncAuthAfterVerification]
  );

  useEffect(() => {
    if (!queryToken) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void verifyWithToken(queryToken);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [queryToken, verifyWithToken]);

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate(successTarget, { replace: true });
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, status, successTarget]);

  const handleManualVerify = async () => {
    const token = extractVerificationToken(manualToken);

    if (!token) {
      showToast("Enter the verification token or paste the full verification link.", "error");
      return;
    }

    await verifyWithToken(token);
  };

  const handleResend = async () => {
    if (!email) {
      showToast("Email address is missing. Please sign up again or contact support.", "error");
      return;
    }

    setResending(true);

    try {
      const message = await auth.sendVerification(email);
      showToast(message, "success");
    } catch (error) {
      showToast(
        readAuthApiMessage(error, "Unable to resend the verification email right now."),
        "error"
      );
    } finally {
      setResending(false);
    }
  };

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
          message={successMessage}
          actionLabel={successActionLabel}
          onAction={() => navigate(successTarget, { replace: true })}
        />
      ) : status === "pending" ? (
        <div className="flex flex-col gap-4">
          <AuthStatusCard
            title="Check Your Email"
            message="We sent a verification link to your email address. Open the link on this device to activate your account."
          />
          {email && (
            <p
              className="text-center text-sm font-semibold -mt-1"
              style={{ color: C.white, fontFamily: "'Inter', sans-serif" }}
            >
              {email}
            </p>
          )}
          <PrimaryButton loading={resending} onClick={handleResend}>
            {resending ? "Sending..." : "Resend Verification Email"}
          </PrimaryButton>
          <button
            type="button"
            onClick={() => setShowManualVerify((current) => !current)}
            className="text-xs font-semibold transition-colors hover:text-white"
            style={{ color: C.primary }}
          >
            {showManualVerify
              ? "Hide manual verification"
              : "Already have a verification link?"}
          </button>
          {showManualVerify && (
            <div className="flex flex-col gap-3">
              <AuthInput
                label="Verification link or token"
                icon={<Link size={16} />}
                placeholder="Paste the link or token from your email"
                value={manualToken}
                onChange={setManualToken}
              />
              <PrimaryButton loading={loading} onClick={handleManualVerify}>
                {loading ? "Verifying..." : "Verify Email"}
              </PrimaryButton>
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-xs font-semibold transition-colors hover:text-white"
            style={{ color: C.primary }}
          >
            Back to Sign In
          </button>
        </div>
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
