import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";

export default function AuthLayoutRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname === "/signup" ? "signup" : "signin";

  return (
    <AuthLayout
      activeTab={activeTab}
      onTabChange={(tab) => navigate(tab === "signup" ? "/signup" : "/login")}
      scrollable={activeTab === "signup"}
    >
      <Outlet />
    </AuthLayout>
  );
}
