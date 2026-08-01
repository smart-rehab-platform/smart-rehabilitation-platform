import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Check,
} from "lucide-react";
import { AuthInput } from "../../components/auth/AuthInput";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
import { C, G } from "../../components/auth/tokens";
import { readAuthApiMessage } from "../../components/auth/authHelpers";
import { useAuth } from "../../context/useAuth";
import { dashboardForRole } from "../../routes/roleRouting";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = useAuth();
  const rememberedLogin = auth.loadRememberedLogin();
  const [email, setEmail] = useState(rememberedLogin.email || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(rememberedLogin.rememberMe);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [emailState, setEmailState] = useState(rememberedLogin.email ? "success" : "idle");
  const [emailMsg, setEmailMsg] = useState("");
  const [showVerifyEmailPrompt, setShowVerifyEmailPrompt] = useState(false);
  const sessionExpiredToastShown = useRef(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const showToast = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  useEffect(() => {
    if (searchParams.get("reason") !== "session-expired") {
      return;
    }

    if (sessionExpiredToastShown.current) {
      return;
    }

    sessionExpiredToastShown.current = true;
    showToast("Your session has expired. Please sign in again.", "error");

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("reason");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const prefillEmail =
      location.state?.prefillEmail?.trim() || location.state?.email?.trim();
    if (!prefillEmail) {
      return;
    }

    setEmail(prefillEmail);
    setEmailState(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(prefillEmail) ? "success" : "idle");
    setEmailMsg("");
  }, [location.state?.prefillEmail, location.state?.email]);

  const handleBlurEmail = () => {
    if (email && !emailValid) {
      setEmailState("error");
      setEmailMsg("Invalid email address");
    } else if (email && emailValid) {
      setEmailState("success");
      setEmailMsg("");
    }
  };

  const handleSubmit = async () => {
    if (!emailValid) {
      setEmailState("error");
      setEmailMsg("Invalid email address");
      return;
    }

    setLoading(true);

    try {
      const user = await auth.login({ email, password, rememberMe: remember });
      const destination = dashboardForRole(user?.role);

      setShowVerifyEmailPrompt(false);
      showToast("Signed in successfully! Redirecting...", "success");

      if (!destination) {
        auth.logout();
        showToast("Unable to determine your account role. Please contact support.", "error");
        return;
      }

      setTimeout(() => navigate(destination), 1200);
    } catch (error) {
      const message = readAuthApiMessage(error, "Invalid email or password");
      setShowVerifyEmailPrompt(message.toLowerCase().includes("verify"));
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast message={toastMessage} visible={toast} variant={toastVariant} />
      <div className="flex flex-col gap-5">
        <AuthInput
          label="Email Address"
          icon={<Mail size={16} />}
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={setEmail}
          state={emailState}
          message={emailMsg}
          onBlur={handleBlurEmail}
          rightSlot={
            emailState === "success" ? (
              <CheckCircle size={16} color={G.success} />
            ) : emailState === "error" ? (
              <AlertCircle size={16} color="#ef4444" />
            ) : undefined
          }
        />
        <AuthInput
          label="Password"
          icon={<Lock size={16} />}
          type={showPw ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={{ color: C.iconInteractive, opacity: 0.85 }}
              className="transition-opacity hover:opacity-100"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <div className="auth-remember-row flex items-center justify-between gap-3 pt-0.5">
          <label className="flex cursor-pointer items-center gap-2.5">
            <div
              onClick={() => setRemember((v) => !v)}
              className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition-all duration-200"
              style={{
                borderColor: remember ? C.primary : "rgba(79, 166, 248, 0.35)",
                background: remember ? C.primary : "rgba(255, 255, 255, 0.7)",
                boxShadow: remember ? "0 0 12px rgba(79, 166, 248, 0.25)" : "none",
              }}
            >
              {remember && <Check size={11} color={C.white} strokeWidth={3} />}
            </div>
            <span className="auth-footer-text text-[13px] font-medium tracking-[-0.01em]">
              Remember Me
            </span>
          </label>
          <button
            type="button"
            onClick={() =>
              navigate("/forgot-password", {
                state: { email: email.trim() },
              })
            }
            className="auth-footer-text text-[13px] font-medium tracking-[-0.01em] transition-colors duration-200"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.linkHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "";
            }}
          >
            Forgot Password?
          </button>
        </div>
        {showVerifyEmailPrompt && (
          <PrimaryButton
            onClick={() => {
              if (!email.trim()) {
                navigate("/verify-email");
                return;
              }

              navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
            }}
          >
            Go to Email Verification
          </PrimaryButton>
        )}
        <PrimaryButton loading={loading} onClick={handleSubmit}>
          {loading ? (
            "Signing In..."
          ) : (
            <>
              <span>Sign In</span>
              <ChevronRight size={16} className="auth-btn-arrow" />
            </>
          )}
        </PrimaryButton>
        <p className="auth-footer-text pt-1 text-center text-xs">Don&apos;t have an account?</p>
        <button type="button" onClick={() => navigate("/signup")} className="auth-secondary-btn">
          Create Account
        </button>
      </div>
    </>
  );
}
