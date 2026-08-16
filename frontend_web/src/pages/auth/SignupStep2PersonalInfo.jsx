import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, User, ChevronRight } from "lucide-react";
import { AuthInput } from "../../components/auth/AuthInput";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { ProfilePhotoUpload } from "../../components/auth/ProfilePhotoUpload";
import { Toast } from "../../components/auth/Toast";
import {
  getAuthBackLabel,
  getAuthContinueLabel,
  getAuthInvalidEmailMessage,
} from "../../components/auth/authLocalization";
import {
  getDisplayProfileImage,
  getStepAfterPersonalInfo,
  revokeWizardProfileImagePreview,
} from "./signupWizardHelpers";
import { readAuthApiMessage } from "../../components/auth/authHelpers";
import { useLocale } from "../../context/useLocale.js";
import { useSignupWizard } from "../../context/SignupWizardContext";
import api from "../../services/api";

const DUPLICATE_EMAIL_TOAST_DURATION = 7000;

export function SignupStep2PersonalInfo({ onBack }) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const {
    wizardData,
    updateWizardData,
    setWizardStep,
    wizardNotice,
    clearWizardNotice,
    serverErrors,
    clearServerError,
  } = useSignupWizard();
  const emailInputRef = useRef(null);
  const handledNoticeRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [toastDuration, setToastDuration] = useState(3000);
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const invalidEmailMessage = getAuthInvalidEmailMessage(t);
  const fullNameRequiredMessage = t("auth.signup.fullNameRequired");
  const phoneRequiredMessage = t("auth.signup.phoneRequired");

  const displayProfileImage = getDisplayProfileImage(wizardData);
  const serverEmailError = serverErrors.email ?? "";

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wizardData.email);
  const nameValid = wizardData.full_name.trim().length > 0;
  const phoneValid = wizardData.phone.trim().length > 0;
  const canContinue =
    nameValid && emailValid && phoneValid && !uploadingPhoto && !serverEmailError;

  const emailState = serverEmailError
    ? "error"
    : wizardData.email
      ? emailValid
        ? "success"
        : "error"
      : "idle";

  const nameState = nameTouched && !nameValid ? "error" : "idle";
  const phoneState = phoneTouched && !phoneValid ? "error" : "idle";

  const showToast = (message, variant = "success", duration = 3000) => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastDuration(duration);
    setToastVisible(true);
  };

  useEffect(() => {
    if (!wizardNotice || wizardNotice.step !== 2) {
      return;
    }

    const noticeKey =
      wizardNotice.toastKey ??
      `${wizardNotice.message}-${wizardNotice.variant}-${wizardNotice.focusField ?? ""}`;

    if (handledNoticeRef.current !== noticeKey) {
      handledNoticeRef.current = noticeKey;
      showToast(
        wizardNotice.message,
        wizardNotice.variant || "error",
        wizardNotice.duration ?? DUPLICATE_EMAIL_TOAST_DURATION,
      );
    }

    if (wizardNotice.focusField === "email") {
      window.requestAnimationFrame(() => {
        emailInputRef.current?.focus();
      });
    }

    clearWizardNotice();
  }, [wizardNotice, clearWizardNotice]);

  useEffect(() => {
    if (serverEmailError) {
      window.requestAnimationFrame(() => {
        emailInputRef.current?.focus();
      });
    }
  }, [serverEmailError]);

  const handleEmailChange = (value) => {
    updateWizardData({ email: value });

    if (serverEmailError) {
      clearServerError("email");
    }
  };

  const handleSignIn = () => {
    navigate("/login", { state: { prefillEmail: wizardData.email.trim() } });
  };

  const emailMessage = serverEmailError ? (
    <>
      {t("auth.signup.duplicateEmailInlinePrompt")}{" "}
      <button
        type="button"
        onClick={handleSignIn}
        className="auth-footer-link font-semibold underline-offset-2 hover:underline"
      >
        {t("auth.signup.duplicateEmailSignInLink")}
      </button>
      .
    </>
  ) : emailState === "error" ? (
    invalidEmailMessage
  ) : (
    ""
  );

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      showToast(t("auth.signup.invalidImageType"), "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast(t("auth.signup.imageTooLarge"), "error");
      return;
    }

    const previousImageUrl = wizardData.profile_image_url;
    const previousPreview = wizardData.profileImagePreview;
    const previousFile = wizardData.profileImageFile;

    const nextPreviewUrl = URL.createObjectURL(file);

    updateWizardData({
      profileImageFile: file,
      profileImagePreview: nextPreviewUrl,
      profile_image_url: null,
    });

    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await api.post("/uploads/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (previousPreview && previousPreview !== nextPreviewUrl) {
        revokeWizardProfileImagePreview(previousPreview);
      }

      updateWizardData({
        profileImageFile: file,
        profileImagePreview: nextPreviewUrl,
        profile_image_url: uploadResponse.data.data.url,
      });
    } catch (error) {
      revokeWizardProfileImagePreview(nextPreviewUrl);
      updateWizardData({
        profileImageFile: previousFile,
        profileImagePreview: previousPreview,
        profile_image_url: previousImageUrl,
      });
      showToast(readAuthApiMessage(error, t("auth.signup.imageUploadFailed")), "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleContinue = () => {
    setNameTouched(true);
    setPhoneTouched(true);

    if (!nameValid) {
      showToast(fullNameRequiredMessage, "error");
      return;
    }

    if (!emailValid) {
      showToast(invalidEmailMessage, "error");
      return;
    }

    if (serverEmailError) {
      emailInputRef.current?.focus();
      return;
    }

    if (!phoneValid) {
      showToast(phoneRequiredMessage, "error");
      return;
    }

    setWizardStep(getStepAfterPersonalInfo(wizardData.role));
  };

  return (
    <>
      <Toast
        message={toastMessage}
        visible={toastVisible}
        variant={toastVariant}
        duration={toastDuration}
        onDismiss={() => setToastVisible(false)}
      />

      <div className="signup-wizard-step flex flex-col">
        <div className="mb-3 flex flex-col gap-2.5">
          <ProfilePhotoUpload
            displayUrl={displayProfileImage}
            fallbackUrl={
              wizardData.profileImagePreview &&
              displayProfileImage !== wizardData.profileImagePreview
                ? wizardData.profileImagePreview
                : null
            }
            uploading={uploadingPhoto}
            onSelect={handlePhotoSelect}
          />

          <AuthInput
            label={t("auth.signup.fullNameLabel")}
            icon={<User size={16} />}
            placeholder={t("auth.signup.fullNamePlaceholder")}
            value={wizardData.full_name}
            onChange={(value) => updateWizardData({ full_name: value })}
            state={nameState}
            message={nameState === "error" ? fullNameRequiredMessage : ""}
            onBlur={() => setNameTouched(true)}
          />

          <AuthInput
            label={t("auth.signup.emailLabel")}
            icon={<Mail size={16} />}
            type="email"
            placeholder={t("auth.signIn.emailPlaceholder")}
            value={wizardData.email}
            onChange={handleEmailChange}
            state={emailState}
            message={emailMessage}
            inputRef={emailInputRef}
          />

          <AuthInput
            label={t("auth.signup.phoneLabel")}
            icon={<Phone size={16} />}
            placeholder={t("auth.signup.phonePlaceholder")}
            value={wizardData.phone}
            onChange={(value) => updateWizardData({ phone: value })}
            state={phoneState}
            message={phoneState === "error" ? phoneRequiredMessage : ""}
            onBlur={() => setPhoneTouched(true)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="auth-secondary-btn flex-1">
            {getAuthBackLabel(t)}
          </button>
          <div className="flex-1">
            <PrimaryButton disabled={!canContinue} onClick={handleContinue}>
              <span>{getAuthContinueLabel(t)}</span>
              <ChevronRight size={16} className="auth-btn-arrow" />
            </PrimaryButton>
          </div>
        </div>
      </div>
    </>
  );
}
