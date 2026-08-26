import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "lucide-react";
import { AuthInput } from "../../components/auth/AuthInput";
import { AuthStatusCard } from "../../components/auth/AuthStatusCard";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
import { C } from "../../components/auth/tokens";
import { readAuthApiMessage } from "../../components/auth/authHelpers";
import { useLocale } from "../../context/useLocale.js";
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
  const { t } = useLocale();
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
  const [successActionLabel, setSuccessActionLabel] = useState(() => t("auth.verifyEmail.goToLogin"));
  const [successMessage, setSuccessMessage] = useState(() => t("auth.verifyEmail.successDefault"));
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
      setSuccessActionLabel(
        destination === "/login"
          ? t("auth.verifyEmail.goToLogin")
          : t("auth.verifyEmail.goToDashboard"),
      );
      return refreshedUser;
    }

    setSuccessTarget("/login");
    setSuccessActionLabel(t("auth.verifyEmail.goToLogin"));
    return null;
  }, [auth, t]);

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
        setSuccessMessage(t("auth.verifyEmail.successDefault"));
        showToast(t("auth.verifyEmail.successMessage"), "success");
      } catch (error) {
        const refreshedUser = await syncAuthAfterVerification();
        if (refreshedUser?.is_email_verified) {
          setStatus("success");
          setSuccessMessage(t("auth.verifyEmail.successDefault"));
          showToast(t("auth.verifyEmail.successMessage"), "success");
          return;
        }

        setStatus("error");
        showToast(readAuthApiMessage(error, t("auth.verifyEmail.verifyFailed")), "error");
      } finally {
        setLoading(false);
      }
    },
    [auth, showToast, syncAuthAfterVerification, t],
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
      showToast(t("auth.verifyEmail.enterToken"), "error");
      return;
    }

    await verifyWithToken(token);
  };

  const handleResend = async () => {
    if (!email) {
      showToast(t("auth.verifyEmail.emailMissing"), "error");
      return;
    }

    setResending(true);

    try {
      const message = await auth.sendVerification(email);
      showToast(message, "success");
    } catch (error) {
      showToast(readAuthApiMessage(error, t("auth.verifyEmail.resendFailed")), "error");
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
          title={t("auth.verifyEmail.verifyingTitle")}
          message={t("auth.verifyEmail.verifyingMessage")}
        />
      ) : status === "success" ? (
        <AuthStatusCard
          title={t("auth.verifyEmail.successTitle")}
          message={successMessage}
          actionLabel={successActionLabel}
          onAction={() => navigate(successTarget, { replace: true })}
        />
      ) : status === "pending" ? (
        <div className="flex flex-col gap-4">
          <AuthStatusCard
            title={t("auth.verifyEmail.checkTitle")}
            message={t("auth.verifyEmail.checkMessage")}
          />
          {email && (
            <p
              className="text-center text-sm font-semibold -mt-1"
              style={{ color: C.navy, fontFamily: "'Inter', sans-serif" }}
            >
              {email}
            </p>
          )}
          <PrimaryButton loading={resending} onClick={handleResend}>
            {resending ? t("auth.verifyEmail.resending") : t("auth.verifyEmail.resend")}
          </PrimaryButton>
          <button
            type="button"
            onClick={() => setShowManualVerify((current) => !current)}
            className="text-xs font-semibold transition-colors hover:text-white"
            style={{ color: C.primary }}
          >
            {showManualVerify
              ? t("auth.verifyEmail.hideManual")
              : t("auth.verifyEmail.showManual")}
          </button>
          {showManualVerify && (
            <div className="flex flex-col gap-3">
              <AuthInput
                label={t("auth.verifyEmail.tokenLabel")}
                icon={<Link size={16} />}
                placeholder={t("auth.verifyEmail.tokenPlaceholder")}
                value={manualToken}
                onChange={setManualToken}
              />
              <PrimaryButton loading={loading} onClick={handleManualVerify}>
                {loading ? t("auth.verifyEmail.verifyingButton") : t("auth.verifyEmail.verifyButton")}
              </PrimaryButton>
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-xs font-semibold transition-colors hover:text-white"
            style={{ color: C.primary }}
          >
            {t("auth.verifyEmail.backToSignIn")}
          </button>
        </div>
      ) : (
        <AuthStatusCard
          variant="error"
          title={t("auth.verifyEmail.failedTitle")}
          message={t("auth.verifyEmail.failedMessage")}
          actionLabel={t("auth.verifyEmail.goToLogin")}
          onAction={() => navigate("/login")}
        />
      )}
    </>
  );
}
