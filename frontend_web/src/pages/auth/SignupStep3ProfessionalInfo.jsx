import { useState } from "react";
import {
  Briefcase,
  IdCard,
  Hash,
  ChevronRight,
} from "lucide-react";
import { AuthInput } from "../../components/auth/AuthInput";
import { AuthTextarea } from "../../components/auth/AuthTextarea";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { Toast } from "../../components/auth/Toast";
import {
  getAuthBackLabel,
  getAuthContinueLabel,
} from "../../components/auth/authLocalization";
import {
  EMPTY_SPECIALIST_PROFILE,
  validateBio,
  validateLicenseNumber,
  validateSpecialization,
  validateYearsOfExperience,
} from "./signupWizardHelpers";
import { useLocale } from "../../context/useLocale.js";
import { useSignupWizard } from "../../context/SignupWizardContext";

export function SignupStep3ProfessionalInfo({ onBack }) {
  const { t } = useLocale();
  const { wizardData, updateWizardData, setWizardStep } = useSignupWizard();
  const profile = wizardData.specialist_profile ?? EMPTY_SPECIALIST_PROFILE;

  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [specializationTouched, setSpecializationTouched] = useState(false);
  const [licenseTouched, setLicenseTouched] = useState(false);
  const [yearsTouched, setYearsTouched] = useState(false);

  const specializationResult = validateSpecialization(profile.specialization, t);
  const licenseResult = validateLicenseNumber(profile.license_number, t);
  const yearsResult = validateYearsOfExperience(profile.years_of_experience, t);
  const bioResult = validateBio(profile.bio, t);

  const canContinue =
    specializationResult.valid &&
    licenseResult.valid &&
    yearsResult.valid &&
    bioResult.valid;

  const specializationState =
    specializationTouched && !specializationResult.valid ? "error" : "idle";
  const licenseState = licenseTouched && !licenseResult.valid ? "error" : "idle";
  const yearsState = yearsTouched && !yearsResult.valid ? "error" : "idle";
  const bioState = !bioResult.valid ? "error" : "idle";

  const showToast = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const updateSpecialistProfile = (patch) => {
    updateWizardData({
      specialist_profile: {
        ...(wizardData.specialist_profile ?? EMPTY_SPECIALIST_PROFILE),
        ...patch,
      },
    });
  };

  const handleYearsChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "");

    updateSpecialistProfile({
      years_of_experience: digitsOnly === "" ? null : Number.parseInt(digitsOnly, 10),
    });
  };

  const handleContinue = () => {
    setSpecializationTouched(true);
    setLicenseTouched(true);
    setYearsTouched(true);

    if (!specializationResult.valid) {
      showToast(specializationResult.message, "error");
      return;
    }

    if (!licenseResult.valid) {
      showToast(licenseResult.message, "error");
      return;
    }

    if (!yearsResult.valid) {
      showToast(yearsResult.message, "error");
      return;
    }

    if (!bioResult.valid) {
      showToast(bioResult.message, "error");
      return;
    }

    updateWizardData({
      specialist_profile: {
        specialization: specializationResult.value,
        license_number: licenseResult.value,
        years_of_experience: yearsResult.value,
        bio: bioResult.value,
      },
    });

    setWizardStep(4);
  };

  return (
    <>
      <Toast message={toastMessage} visible={toast} variant={toastVariant} />

      <div className="signup-wizard-step flex flex-col">
        <div className="mb-3 flex flex-col gap-2.5">
          <AuthInput
            label={t("auth.signup.specializationLabel")}
            icon={<Briefcase size={16} />}
            placeholder={t("auth.signup.specializationPlaceholder")}
            value={profile.specialization}
            onChange={(value) => updateSpecialistProfile({ specialization: value })}
            state={specializationState}
            message={specializationState === "error" ? specializationResult.message : ""}
            onBlur={() => setSpecializationTouched(true)}
          />

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <AuthInput
              label={t("auth.signup.licenseNumberLabel")}
              icon={<IdCard size={16} />}
              placeholder={t("auth.signup.licenseNumberLabel")}
              value={profile.license_number}
              onChange={(value) => updateSpecialistProfile({ license_number: value })}
              state={licenseState}
              message={licenseState === "error" ? licenseResult.message : ""}
              onBlur={() => setLicenseTouched(true)}
            />

            <AuthInput
              label={t("auth.signup.yearsOfExperienceLabel")}
              icon={<Hash size={16} />}
              type="text"
              placeholder={t("auth.signup.yearsOfExperienceLabel")}
              value={
                profile.years_of_experience === null ||
                profile.years_of_experience === undefined
                  ? ""
                  : String(profile.years_of_experience)
              }
              onChange={handleYearsChange}
              state={yearsState}
              message={yearsState === "error" ? yearsResult.message : ""}
              onBlur={() => setYearsTouched(true)}
            />
          </div>

          <AuthTextarea
            label={t("auth.signup.bioLabel")}
            placeholder={t("auth.signup.bioPlaceholder")}
            value={profile.bio}
            onChange={(value) => updateSpecialistProfile({ bio: value })}
            state={bioState}
            message={bioState === "error" ? bioResult.message : ""}
            maxLength={500}
            rows={3}
            showCounter
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
