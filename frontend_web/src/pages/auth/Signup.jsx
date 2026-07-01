import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Camera,
  Users,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { AuthInput } from "../../components/auth/AuthInput";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { RoleCard } from "../../components/auth/RoleCard";
import { PasswordStrength } from "../../components/auth/PasswordStrength";
import { Toast } from "../../components/auth/Toast";
import { C } from "../../components/auth/tokens";
import {
  getPasswordStrength,
  readAuthApiMessage,
  strongPasswordMessage,
} from "../../components/auth/authHelpers";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const auth = useAuth();
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [role, setRole] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordStrength = getPasswordStrength(password);
  const pwValid = passwordStrength.isStrong;
  const cfValid = confirm === password && confirm.length > 0;

  const emailState = email ? (emailValid ? "success" : "error") : "idle";
  const pwState = password ? (pwValid ? "success" : "error") : "idle";
  const cfState = confirm ? (cfValid ? "success" : "error") : "idle";

  const showToast = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
    };
  }, [profilePreview]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      showToast("Please select a JPG, PNG, or WEBP image", "error");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be smaller than 5MB", "error");
      event.target.value = "";
      return;
    }

    if (profilePreview) URL.revokeObjectURL(profilePreview);

    setProfilePhoto(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast("Please enter your full name", "error");
      return;
    }

    if (!emailValid) {
      showToast("Invalid email address", "error");
      return;
    }

    if (!phone.trim()) {
      showToast("Please enter your phone number", "error");
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

    if (!role) {
      showToast("Please select your role", "error");
      return;
    }

    setLoading(true);

    try {
      let profileImageUrl = null;

      if (profilePhoto) {
        const formData = new FormData();
        formData.append("file", profilePhoto);

        const uploadResponse = await api.post("/uploads/profile-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        profileImageUrl = uploadResponse.data.data.url;
      }

      await auth.register({
        full_name: name.trim(),
        email,
        password,
        phone: phone.trim(),
        role,
        profile_image_url: profileImageUrl,
      });

      showToast(
        "Account created successfully. Please verify your email before signing in.",
        "success"
      );
      setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(email)}`), 1500);
    } catch (error) {
      const message = readAuthApiMessage(error, "Registration failed");
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast message={toastMessage} visible={toast} variant={toastVariant} />
      <div className="flex flex-col gap-1 mb-5">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif", color: C.white }}>
          Create Account
        </h2>
        <p className="text-sm" style={{ color: C.light }}>
          Join the Smart Rehabilitation Platform
        </p>
      </div>

      <div className="flex justify-center mb-5">
        <div className="flex flex-col items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <button
            type="button"
            onClick={handlePhotoClick}
            className="w-16 h-16 rounded-full flex items-center justify-center relative cursor-pointer transition-all hover:scale-105 overflow-hidden"
            style={{ border: `2px dashed ${C.primary}`, background: "rgba(74,127,167,0.08)" }}
          >
            {profilePreview ? (
              <img
                src={profilePreview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera size={20} style={{ color: C.primary }} />
            )}
          </button>
          <p className="text-xs" style={{ color: C.light, opacity: 0.7 }}>
            Profile photo optional
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <AuthInput
          label="Full Name"
          icon={<User size={16} />}
          placeholder="Dr. Sarah Johnson"
          value={name}
          onChange={setName}
        />
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
        <AuthInput
          label="Phone Number"
          icon={<Phone size={16} />}
          placeholder="+970 59 000 0000"
          value={phone}
          onChange={setPhone}
        />
        <AuthInput
          label="Password"
          icon={<Lock size={16} />}
          type={showPw ? "text" : "password"}
          placeholder="Min. 8 characters"
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
          label="Confirm Password"
          icon={<Lock size={16} />}
          type={showCf ? "text" : "password"}
          placeholder="Re-enter your password"
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

        <div>
          <p className="text-xs font-semibold mb-2.5" style={{ color: C.light }}>
            I am a...
          </p>
          <div className="flex gap-3">
            <RoleCard
              icon={<Users size={16} />}
              title="Parent"
              bullets={[
                "Track child progress",
                "Upload exercises",
                "View reports",
                "Communicate with specialists",
              ]}
              selected={role === "parent"}
              onClick={() => setRole("parent")}
            />
            <RoleCard
              icon={<Stethoscope size={16} />}
              title="Specialist"
              bullets={[
                "Manage patients",
                "Create treatment plans",
                "Review exercises",
                "Generate reports",
              ]}
              selected={role === "specialist"}
              onClick={() => setRole("specialist")}
            />
          </div>
        </div>

        <PrimaryButton loading={loading} onClick={handleSubmit}>
          {loading ? (
            "Creating Account..."
          ) : (
            <>
              <span>Create My Account</span>
              <ChevronRight size={16} />
            </>
          )}
        </PrimaryButton>

        <p className="text-center text-xs" style={{ color: C.light }}>
          Already have an account?{" "}
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
  );
}
