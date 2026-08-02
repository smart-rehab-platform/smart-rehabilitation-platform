import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../components/auth/PrimaryButton";
import { C } from "../components/auth/tokens";
import { useAuth } from "../context/useAuth";
import { getRoleLabel } from "../routes/roleRouting";

export default function Dashboard({ role }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const roleLabel = getRoleLabel(role || user?.role);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ fontFamily: "'Inter', sans-serif", background: C.navy, color: C.white }}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-3">{roleLabel} Dashboard</h1>
        <p className="text-sm" style={{ color: C.light }}>
          Signed in as {user?.full_name || user?.email || "your account"}.
        </p>
        <div className="mt-6 max-w-xs mx-auto">
          <PrimaryButton onClick={handleLogout}>Log Out</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
