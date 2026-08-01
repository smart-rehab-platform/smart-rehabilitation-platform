import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Users, Stethoscope, ChevronRight } from "lucide-react";
import { OnboardingRoleCard } from "../../components/auth/OnboardingRoleCard";
import { PrimaryButton } from "../../components/auth/PrimaryButton";
import { useSignupWizard } from "../../context/SignupWizardContext";
import { SignupStep2PersonalInfo } from "./SignupStep2PersonalInfo";
import { SignupStep3ProfessionalInfo } from "./SignupStep3ProfessionalInfo";
import { SignupStep4AccountSecurity } from "./SignupStep4AccountSecurity";
import { SignupStep5Review } from "./SignupStep5Review";
import { getStepBeforeSecurity } from "./signupWizardHelpers";

export default function Signup() {
  const navigate = useNavigate();
  const { wizardStep, setWizardStep, updateWizardData, wizardData, isRegistrationSubmitting } =
    useSignupWizard();
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (wizardStep === 3 && wizardData.role !== "specialist") {
      setWizardStep(4);
    }
  }, [wizardStep, wizardData.role, setWizardStep]);

  useEffect(() => {
    if (wizardStep === 1 && wizardData.role) {
      setSelectedRole(wizardData.role);
    }
  }, [wizardStep, wizardData.role]);

  const handleContinue = () => {
    if (!selectedRole) return;
    updateWizardData({
      role: selectedRole,
      specialist_profile: selectedRole === "specialist" ? wizardData.specialist_profile : null,
    });
    setWizardStep(2);
  };

  const handleBackToStep1 = () => {
    if (wizardData.role) {
      setSelectedRole(wizardData.role);
    }
    setWizardStep(1);
  };

  const handleBackToStep2 = () => {
    setWizardStep(2);
  };

  const handleBackFromSecurity = () => {
    setWizardStep(getStepBeforeSecurity(wizardData.role));
  };

  const handleBackFromReview = () => {
    setWizardStep(4);
  };

  return (
    <div className="signup-wizard flex flex-col pb-2">
      <AnimatePresence mode="wait">
        {wizardStep === 1 && (
          <motion.div
            key="signup-step-1"
            className="signup-wizard-step flex flex-col"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-3 flex flex-col gap-2.5">
              <OnboardingRoleCard
                icon={<Users size={20} strokeWidth={1.75} />}
                title="Parent"
                description="Monitor your child's progress, communicate with specialists, and complete home exercises."
                selected={selectedRole === "parent"}
                onClick={() => {
                  setSelectedRole("parent");
                  updateWizardData({ specialist_profile: null });
                }}
              />
              <OnboardingRoleCard
                icon={<Stethoscope size={20} strokeWidth={1.75} />}
                title="Specialist"
                description="Manage patients, create treatment plans, review progress, and provide professional guidance."
                selected={selectedRole === "specialist"}
                onClick={() => setSelectedRole("specialist")}
              />
            </div>

            <div className="pt-2">
              <PrimaryButton disabled={!selectedRole} onClick={handleContinue}>
                <span>Continue</span>
                <ChevronRight size={16} className="auth-btn-arrow" />
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {wizardStep === 2 && (
          <motion.div
            key="signup-step-2"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <SignupStep2PersonalInfo onBack={handleBackToStep1} />
          </motion.div>
        )}

        {wizardStep === 3 && wizardData.role === "specialist" && (
          <motion.div
            key="signup-step-3"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <SignupStep3ProfessionalInfo onBack={handleBackToStep2} />
          </motion.div>
        )}

        {wizardStep === 4 && (
          <motion.div
            key="signup-step-4"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <SignupStep4AccountSecurity onBack={handleBackFromSecurity} />
          </motion.div>
        )}

        {wizardStep >= 5 && (
          <motion.div
            key="signup-step-5"
            className="signup-wizard-step"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <SignupStep5Review onBack={handleBackFromReview} />
          </motion.div>
        )}
      </AnimatePresence>

      <p className="auth-footer-text mt-8 text-center text-xs">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          disabled={isRegistrationSubmitting}
          className="auth-footer-link font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sign In
        </button>
      </p>

      <style>{`
        @media (hover: hover) {
          .onboarding-role-card:not([aria-pressed="true"]):hover {
            border-color: rgba(79, 166, 248, 0.45) !important;
            box-shadow: 0 10px 28px rgba(79, 166, 248, 0.12);
            background: rgba(255, 255, 255, 0.92);
          }
        }

        .signup-wizard-step {
          animation: signupWizardStepIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes signupWizardStepIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .signup-wizard-step {
            animation: none;
          }

          .signup-wizard-step,
          .signup-wizard-step * {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
