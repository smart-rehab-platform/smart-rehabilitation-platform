import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, Clock3, Loader2, LogOut, RefreshCw } from "lucide-react";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
import { C } from "../../components/auth/tokens";
import {
  authPageHeadingClassName,
  authPageHeadingStyle,
  authPageSubtitleClassName,
  authPageSubtitleStyle,
} from "../../components/auth/authPageStyles";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  SPECIALIST_VERIFICATION_PENDING_PATH,
  SPECIALIST_VERIFICATION_REJECTED_PATH,
  getSpecialistVerificationStatus,
  homeForUser,
} from "../../routes/roleRouting";

function SpecialistStatusCard({
  icon: Icon,
  accent,
  title,
  message,
  children,
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full border"
        style={{
          background: `${accent}1f`,
          borderColor: `${accent}4d`,
          boxShadow: `0 0 24px ${accent}26`,
        }}
      >
        <Icon size={30} color={accent} />
      </div>
      <h2
        className={`${authPageHeadingClassName} mt-5`}
        style={authPageHeadingStyle}
      >
        {title}
      </h2>
      <p
        className={`${authPageSubtitleClassName} mt-2 max-w-sm`}
        style={authPageSubtitleStyle}
      >
        {message}
      </p>
      {children ? <div className="mt-6 flex w-full flex-col gap-3">{children}</div> : null}
    </div>
  );
}

function SoftButton({ children, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-60"
      style={{
        borderColor: "rgba(143,197,255,0.28)",
        color: "#F6FAFD",
        background: "rgba(15,35,66,0.65)",
      }}
    >
      {children}
    </button>
  );
}

export default function SpecialistVerificationPage({ mode }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useLocale();
  const [checking, setChecking] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  const status = getSpecialistVerificationStatus(auth.user);
  const expectedPath =
    mode === "rejected"
      ? SPECIALIST_VERIFICATION_REJECTED_PATH
      : SPECIALIST_VERIFICATION_PENDING_PATH;

  useEffect(() => {
    if (auth.isInitializing) {
      return;
    }

    if (!auth.isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (auth.user?.role !== "specialist") {
      navigate(homeForUser(auth.user) || "/login", { replace: true });
      return;
    }

    const destination = homeForUser(auth.user);
    if (destination && destination !== expectedPath) {
      navigate(destination, { replace: true });
    }
  }, [
    auth.isInitializing,
    auth.isAuthenticated,
    auth.user,
    expectedPath,
    navigate,
  ]);

  const showToast = useCallback((message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToast(true);
    window.setTimeout(() => setToast(false), 2800);
  }, []);

  const handleCheckStatus = useCallback(async () => {
    setChecking(true);
    try {
      const refreshed = await auth.refreshSession();
      const destination = homeForUser(refreshed || auth.user);
      if (destination && destination !== expectedPath) {
        navigate(destination, { replace: true });
        return;
      }
      showToast(t("auth.specialistVerification.stillPendingToast"), "success");
    } catch {
      showToast(t("auth.specialistVerification.refreshFailed"), "error");
    } finally {
      setChecking(false);
    }
  }, [auth, expectedPath, navigate, showToast, t]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await auth.logout();
      navigate("/login", { replace: true });
    } catch {
      showToast(t("auth.specialistVerification.logoutFailed"), "error");
      setLoggingOut(false);
    }
  }, [auth, navigate, showToast, t]);

  if (auth.isInitializing) {
    return null;
  }

  if (!auth.isAuthenticated || auth.user?.role !== "specialist") {
    return <Navigate to="/login" replace />;
  }

  if (status === "approved") {
    return <Navigate to="/dashboard/specialist" replace />;
  }

  if (mode === "pending" && status === "rejected") {
    return <Navigate to={SPECIALIST_VERIFICATION_REJECTED_PATH} replace />;
  }

  if (mode === "rejected" && status !== "rejected") {
    return <Navigate to={homeForUser(auth.user) || SPECIALIST_VERIFICATION_PENDING_PATH} replace />;
  }

  const isRejected = mode === "rejected";

  return (
    <>
      <Toast message={toastMessage} visible={toast} variant={toastVariant} />
      <SpecialistStatusCard
        icon={isRejected ? AlertCircle : checking ? Loader2 : Clock3}
        accent={isRejected ? "#ef4444" : C.primary}
        title={
          isRejected
            ? t("auth.specialistVerification.rejectedTitle")
            : t("auth.specialistVerification.pendingTitle")
        }
        message={
          isRejected
            ? t("auth.specialistVerification.rejectedMessage")
            : t("auth.specialistVerification.pendingMessage")
        }
      >
        {!isRejected ? (
          <PrimaryButton onClick={handleCheckStatus} loading={checking} disabled={checking || loggingOut}>
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={16} />
              {t("auth.specialistVerification.checkStatus")}
            </span>
          </PrimaryButton>
        ) : null}
        <SoftButton onClick={handleLogout} disabled={checking || loggingOut}>
          <LogOut size={16} />
          {loggingOut
            ? t("auth.specialistVerification.loggingOut")
            : t("auth.specialistVerification.logout")}
        </SoftButton>
      </SpecialistStatusCard>
    </>
  );
}
