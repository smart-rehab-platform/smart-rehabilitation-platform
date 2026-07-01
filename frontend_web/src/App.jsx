import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AuthLayoutRoute from "./pages/auth/AuthLayoutRoute";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/useAuth";
import { canAccessRoute, dashboardForRole } from "./routes/roleRouting";

function AppLoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center text-sm"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#0A1931",
        color: "#F6FAFD",
      }}
    >
      Restoring your session...
    </div>
  );
}

function RootRedirect() {
  const { isInitializing, isAuthenticated, isVerified, user } = useAuth();

  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    const email = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
    return <Navigate to={`/verify-email${email}`} replace />;
  }

  return <Navigate to={dashboardForRole(user?.role) || "/login"} replace />;
}

function PublicAuthRoute({ children }) {
  const { isInitializing, isAuthenticated, isVerified, user } = useAuth();

  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  if (!isAuthenticated) {
    return children;
  }

  if (!isVerified) {
    const email = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
    return <Navigate to={`/verify-email${email}`} replace />;
  }

  return <Navigate to={dashboardForRole(user?.role) || "/login"} replace />;
}

function VerifyEmailRoute({ children }) {
  const { isInitializing, isAuthenticated, isVerified, user } = useAuth();

  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  if (isAuthenticated && isVerified) {
    return <Navigate to={dashboardForRole(user?.role) || "/login"} replace />;
  }

  return children;
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isInitializing, isAuthenticated, isVerified, user } = useAuth();

  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    const email = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
    return <Navigate to={`/verify-email${email}`} replace />;
  }

  if (!canAccessRoute(user?.role, location.pathname)) {
    return <Navigate to={dashboardForRole(user?.role) || "/login"} replace />;
  }

  return children;
}

function DashboardLanding() {
  const { user } = useAuth();
  return <Navigate to={dashboardForRole(user?.role) || "/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLanding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <Dashboard role="admin" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist"
          element={
            <ProtectedRoute>
              <Dashboard role="specialist" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent"
          element={
            <ProtectedRoute>
              <Dashboard role="parent" />
            </ProtectedRoute>
          }
        />
        <Route element={<AuthLayoutRoute />}>
          <Route
            path="/login"
            element={
              <PublicAuthRoute>
                <Login />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicAuthRoute>
                <Signup />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicAuthRoute>
                <ForgotPassword />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicAuthRoute>
                <ResetPassword />
              </PublicAuthRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <VerifyEmailRoute>
                <VerifyEmail />
              </VerifyEmailRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
