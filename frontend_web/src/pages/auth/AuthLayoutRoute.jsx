import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { SignupWizardProvider } from "../../context/SignupWizardContext";

export default function AuthLayoutRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname === "/signup" ? "signup" : "signin";

  return (
    <SignupWizardProvider>
      <AuthLayout
        activeTab={activeTab}
        onTabChange={(tab) => navigate(tab === "signup" ? "/signup" : "/login")}
      >
        <Outlet />
      </AuthLayout>
    </SignupWizardProvider>
  );
}
