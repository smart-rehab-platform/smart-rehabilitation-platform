import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import api from "../../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [emailState, setEmailState] = useState("idle");
  const [emailMsg, setEmailMsg] = useState("");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const showToast = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

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
      const { data } = await api.post("/auth/login", { email, password });

      localStorage.setItem("accessToken", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      showToast("Signed in successfully! Redirecting...", "success");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (error) {
      const message = readAuthApiMessage(error, "Invalid email or password");
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
              style={{ color: C.light, opacity: 0.6 }}
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
                borderColor: remember ? C.primary : "rgba(179,207,229,0.4)",
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
            className="text-xs font-medium transition-colors hover:text-white"
            style={{ color: C.primary }}
          >
            Forgot Password?
          </button>
        </div>
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
            className="font-semibold transition-colors hover:text-white"
            style={{ color: C.primary }}
          >
            Create Account
          </button>
        </p>
      </div>
    </>
  );
}
