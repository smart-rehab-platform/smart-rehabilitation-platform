import { C } from "../components/auth/tokens";
import { useAuth } from "../context/useAuth";
import { getRoleLabel } from "../routes/roleRouting";

export default function Dashboard({ role }) {
  const { user } = useAuth();
  const roleLabel = getRoleLabel(role || user?.role);

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
      </div>
    </div>
  );
}
