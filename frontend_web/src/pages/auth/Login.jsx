import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif", color: C.white }}>
          Welcome Back
        </h2>
        <p className="text-sm" style={{ color: C.light }}>
          Continue your smart rehabilitation journey
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
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setRemember((v) => !v)}
              className="w-4 h-4 rounded flex items-center justify-center border transition-all"
              style={{
                borderColor: remember ? C.primary : C.border,
                background: remember ? C.primary : "transparent",
              }}
            >
              {remember && <Check size={10} color={C.white} strokeWidth={3} />}
            </div>
            <span className="text-xs" style={{ color: C.light }}>
              Remember Me
            </span>
          </label>
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-xs font-medium transition-colors"
            style={{ color: C.soft }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.linkHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.soft;
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
              <ChevronRight size={16} />
            </>
          )}
        </PrimaryButton>
        <p className="text-center text-xs" style={{ color: C.light }}>
          {"Don't have an account? "}
          <button
            onClick={() => navigate("/signup")}
            className="font-semibold transition-colors"
            style={{ color: C.soft }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.linkHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.soft;
            }}
          >
            Create Account
          </button>
        </p>
      </div>
    </>
  );
}
