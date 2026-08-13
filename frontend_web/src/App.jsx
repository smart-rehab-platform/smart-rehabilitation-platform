import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AuthLayoutRoute from "./pages/auth/AuthLayoutRoute";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail";
import LandingPage from "./pages/LandingPage";
import AdminDashboardPage from "./features/admin-dashboard/AdminDashboardPage";
import AdminPatientDetailsPage from "./features/admin-dashboard/AdminPatientDetailsPage";
import AdminCaseRequestDetailsPage from "./features/admin-dashboard/AdminCaseRequestDetailsPage";
import AdminCaseRequestSpecialistsPage from "./features/admin-dashboard/AdminCaseRequestSpecialistsPage";
import AdminCaseRequestsPage from "./features/admin-dashboard/AdminCaseRequestsPage";
import AdminComplaintsPage from "./features/admin-dashboard/AdminComplaintsPage";
import AdminComplaintDetailsPage from "./features/admin-dashboard/AdminComplaintDetailsPage";
import AdminExercisesPage from "./features/admin-dashboard/AdminExercisesPage";
import AdminSessionsPage from "./features/admin-dashboard/AdminSessionsPage";
import AdminReportsPage from "./features/admin-dashboard/AdminReportsPage";
import AdminReportDetailsPage from "./features/admin-dashboard/AdminReportDetailsPage";
import AdminAiCenterPage from "./features/admin-dashboard/AdminAiCenterPage";
import AdminAuditLogsPage from "./features/admin-dashboard/AdminAuditLogsPage";
import AdminNotificationsPage from "./features/admin-dashboard/AdminNotificationsPage";
import AdminProfilePage from "./features/admin-dashboard/AdminProfilePage";
import AdminExerciseDetailsPage from "./features/admin-dashboard/AdminExerciseDetailsPage";
import AdminUpsertExercisePage from "./features/admin-dashboard/AdminUpsertExercisePage";
import AdminPatientAssignmentsPage from "./features/admin-dashboard/AdminPatientAssignmentsPage";
import AdminPatientsPage from "./features/admin-dashboard/AdminPatientsPage";
import AdminUsersPage from "./features/admin-dashboard/AdminUsersPage";
import SpecialistDashboardPage from "./features/specialist-dashboard/SpecialistDashboardPage";
import SpecialistPlaceholderPage from "./features/specialist-dashboard/SpecialistPlaceholderPage";
import SpecialistMessagesPage from "./features/specialist-dashboard/SpecialistMessagesPage";
import SpecialistNotificationsPage from "./features/specialist-dashboard/SpecialistNotificationsPage";
import SpecialistPatientsPage from "./features/specialist-dashboard/SpecialistPatientsPage";
import SpecialistPatientDetailsPage from "./features/specialist-dashboard/SpecialistPatientDetailsPage";
import { SPECIALIST_PLACEHOLDER_FEATURES } from "./routes/specialistDashboardRoutes";
import { AuthSessionNavigator } from "./components/auth/AuthSessionNavigator";
import ParentDashboardPreviewPage from "./features/parent-dashboard-preview/ParentDashboardPreviewPage";
import ParentExerciseDetailPage from "./features/parent-dashboard-preview/ParentExerciseDetailPage";
import ParentDailyTasksPage from "./features/parent-dashboard-preview/ParentDailyTasksPage";
import ParentFeedbackPage from "./features/parent-dashboard-preview/ParentFeedbackPage";
import ParentSessionsPage from "./features/parent-dashboard-preview/ParentSessionsPage";
import ParentReportsPage from "./features/parent-dashboard-preview/ParentReportsPage";
import ParentReportDetailPage from "./features/parent-dashboard-preview/ParentReportDetailPage";
import ParentNotificationsPage from "./features/parent-dashboard-preview/ParentNotificationsPage";
import ParentAiAssistantPage from "./features/parent-dashboard-preview/ParentAiAssistantPage";
import ParentProfilePage from "./features/parent-dashboard-preview/ParentProfilePage";
import ParentChildrenPage from "./features/parent-dashboard-preview/ParentChildrenPage";
import ParentChildDetailPage from "./features/parent-dashboard-preview/ParentChildDetailPage";
import ParentProgressPage from "./features/parent-dashboard-preview/ParentProgressPage";
import ParentCaseRequestsPage from "./features/parent-dashboard-preview/ParentCaseRequestsPage";
import ParentCaseRequestDetailPage from "./features/parent-dashboard-preview/ParentCaseRequestDetailPage";
import ParentCaseRequestFormPage from "./features/parent-dashboard-preview/ParentCaseRequestFormPage";
import ParentMessagesPage from "./features/parent-dashboard-preview/ParentMessagesPage";
import { useAuth } from "./context/useAuth";
import { canAccessRoute, dashboardForRole } from "./routes/roleRouting";
import { isAuthRouteAllowingAuthenticatedSession } from "./routes/publicAuthRoutes";

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

function LandingRoute() {
  const { isInitializing, isAuthenticated, isVerified, user } = useAuth();

  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  if (isAuthenticated) {
    if (!isVerified) {
      const email = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
      return <Navigate to={`/verify-email${email}`} replace />;
    }

    return <Navigate to={dashboardForRole(user?.role) || "/login"} replace />;
  }

  return <LandingPage />;
}

function PublicAuthRoute({ children }) {
  const location = useLocation();
  const { isInitializing, isAuthenticated, isVerified, user } = useAuth();

  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  if (!isAuthenticated) {
    return children;
  }

  if (isAuthRouteAllowingAuthenticatedSession(location.pathname)) {
    return children;
  }

  if (!isVerified) {
    const email = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
    return <Navigate to={`/verify-email${email}`} replace />;
  }

  return <Navigate to={dashboardForRole(user?.role) || "/login"} replace />;
}

function VerifyEmailRoute({ children }) {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return <AppLoadingScreen />;
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
    return <Navigate to="/login" replace state={{ from: location }} />;
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
      <AuthSessionNavigator />
      <Routes>
        <Route path="/" element={<LandingRoute />} />
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
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/patients"
          element={
            <ProtectedRoute>
              <AdminPatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/patients/:patientId"
          element={
            <ProtectedRoute>
              <AdminPatientDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/patient-assignments"
          element={
            <ProtectedRoute>
              <AdminPatientAssignmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/case-requests"
          element={
            <ProtectedRoute>
              <AdminCaseRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/case-requests/:requestId/specialists"
          element={
            <ProtectedRoute>
              <AdminCaseRequestSpecialistsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/case-requests/:requestId"
          element={
            <ProtectedRoute>
              <AdminCaseRequestDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/complaints"
          element={
            <ProtectedRoute>
              <AdminComplaintsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/complaints/:complaintId"
          element={
            <ProtectedRoute>
              <AdminComplaintDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/exercises/new"
          element={
            <ProtectedRoute>
              <AdminUpsertExercisePage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/exercises/:exerciseId/edit"
          element={
            <ProtectedRoute>
              <AdminUpsertExercisePage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/exercises/:exerciseId"
          element={
            <ProtectedRoute>
              <AdminExerciseDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/exercises"
          element={
            <ProtectedRoute>
              <AdminExercisesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/sessions"
          element={
            <ProtectedRoute>
              <AdminSessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/reports/:reportId"
          element={
            <ProtectedRoute>
              <AdminReportDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/reports"
          element={
            <ProtectedRoute>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/ai-center"
          element={
            <ProtectedRoute>
              <AdminAiCenterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/audit-logs"
          element={
            <ProtectedRoute>
              <AdminAuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/notifications"
          element={
            <ProtectedRoute>
              <AdminNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/profile"
          element={
            <ProtectedRoute>
              <AdminProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist"
          element={
            <ProtectedRoute>
              <SpecialistDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/patients"
          element={
            <ProtectedRoute>
              <SpecialistPatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/patients/:patientId"
          element={
            <ProtectedRoute>
              <SpecialistPatientDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/patients/:patientId/goals"
          element={
            <ProtectedRoute>
              <SpecialistPlaceholderPage title={SPECIALIST_PLACEHOLDER_FEATURES.patientGoals.title} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/patients/:patientId/ai-recommendations"
          element={
            <ProtectedRoute>
              <SpecialistPlaceholderPage title={SPECIALIST_PLACEHOLDER_FEATURES.aiRecommendations.title} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/patients/:patientId/speech-analysis"
          element={
            <ProtectedRoute>
              <SpecialistPlaceholderPage title={SPECIALIST_PLACEHOLDER_FEATURES.speechAnalysis.title} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/patients/:patientId/assign-exercise"
          element={
            <ProtectedRoute>
              <SpecialistPlaceholderPage title={SPECIALIST_PLACEHOLDER_FEATURES.assignExercise.title} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/reports"
          element={
            <ProtectedRoute>
              <SpecialistPlaceholderPage title={SPECIALIST_PLACEHOLDER_FEATURES.reports.title} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/treatment-plans/new"
          element={
            <ProtectedRoute>
              <SpecialistPlaceholderPage title="Create Treatment Plan" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/treatment-plans/:planId/edit"
          element={
            <ProtectedRoute>
              <SpecialistPlaceholderPage title="Edit Treatment Plan" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/reviews"
          element={
            <ProtectedRoute>
              <SpecialistPlaceholderPage title={SPECIALIST_PLACEHOLDER_FEATURES.reviews.title} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/sessions"
          element={
            <ProtectedRoute>
              <SpecialistPlaceholderPage title={SPECIALIST_PLACEHOLDER_FEATURES.sessions.title} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/treatment-plans"
          element={
            <ProtectedRoute>
              <SpecialistPlaceholderPage
                title={SPECIALIST_PLACEHOLDER_FEATURES.treatmentPlans.title}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/progress"
          element={
            <ProtectedRoute>
              <SpecialistPlaceholderPage title={SPECIALIST_PLACEHOLDER_FEATURES.progress.title} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/messages"
          element={
            <ProtectedRoute>
              <SpecialistMessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/messages/:conversationId"
          element={
            <ProtectedRoute>
              <SpecialistMessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialist/notifications"
          element={
            <ProtectedRoute>
              <SpecialistNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent"
          element={
            <ProtectedRoute>
              <ParentDashboardPreviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/exercise-details"
          element={
            <ProtectedRoute>
              <ParentExerciseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/daily-tasks"
          element={
            <ProtectedRoute>
              <ParentDailyTasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/feedback"
          element={
            <ProtectedRoute>
              <ParentFeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/sessions"
          element={
            <ProtectedRoute>
              <ParentSessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/reports"
          element={
            <ProtectedRoute>
              <ParentReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/reports/:reportId"
          element={
            <ProtectedRoute>
              <ParentReportDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/notifications"
          element={
            <ProtectedRoute>
              <ParentNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/ai-assistant"
          element={
            <ProtectedRoute>
              <ParentAiAssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/ai-assistant/:conversationId"
          element={
            <ProtectedRoute>
              <ParentAiAssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/profile"
          element={
            <ProtectedRoute>
              <ParentProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/children"
          element={
            <ProtectedRoute>
              <ParentChildrenPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/children/:childId"
          element={
            <ProtectedRoute>
              <ParentChildDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/progress"
          element={
            <ProtectedRoute>
              <ParentProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/case-requests"
          element={
            <ProtectedRoute>
              <ParentCaseRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/case-requests/new"
          element={
            <ProtectedRoute>
              <ParentCaseRequestFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/case-requests/:requestId/edit"
          element={
            <ProtectedRoute>
              <ParentCaseRequestFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/case-requests/:requestId"
          element={
            <ProtectedRoute>
              <ParentCaseRequestDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/messages"
          element={
            <ProtectedRoute>
              <ParentMessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parent/messages/:conversationId"
          element={
            <ProtectedRoute>
              <ParentMessagesPage />
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
