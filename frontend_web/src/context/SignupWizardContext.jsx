import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getClearWizardProfileImagePatch,
  revokeWizardProfileImagePreview,
} from "../pages/auth/signupWizardHelpers";

const defaultWizardData = {
  role: null,
  full_name: "",
  email: "",
  phone: "",
  profileImageFile: null,
  profileImagePreview: null,
  profile_image_url: null,
  specialist_profile: null,
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};
const SignupWizardContext = createContext(null);

export function SignupWizardProvider({ children }) {
  const location = useLocation();
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState(defaultWizardData);
  const [wizardNotice, setWizardNotice] = useState(null);
  const [serverErrors, setServerErrors] = useState({});
  const [isRegistrationSubmitting, setIsRegistrationSubmitting] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/signup") {
      setWizardData((current) => {
        revokeWizardProfileImagePreview(current.profileImagePreview);
        return {
          ...defaultWizardData,
          ...getClearWizardProfileImagePatch(),
        };
      });
      setWizardStep(1);
      setServerErrors({});
      setWizardNotice(null);
    }
  }, [location.pathname]);

  const updateWizardData = (patch) => {
    setWizardData((current) => ({ ...current, ...patch }));
  };

  const clearServerError = (field) => {
    setServerErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const value = useMemo(
    () => ({
      wizardStep,
      setWizardStep,
      wizardData,
      setWizardData,
      updateWizardData,
      wizardNotice,
      setWizardNotice,
      clearWizardNotice: () => setWizardNotice(null),
      serverErrors,
      setServerErrors,
      clearServerError,
      isRegistrationSubmitting,
      setIsRegistrationSubmitting,
    }),
    [wizardStep, wizardData, wizardNotice, serverErrors, isRegistrationSubmitting],
  );

  return (
    <SignupWizardContext.Provider value={value}>{children}</SignupWizardContext.Provider>
  );
}

export function useSignupWizard() {
  const context = useContext(SignupWizardContext);

  if (!context) {
    throw new Error("useSignupWizard must be used within SignupWizardProvider");
  }

  return context;
}
