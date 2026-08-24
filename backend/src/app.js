const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { getExpressCorsOptions } = require("./config/cors");
const usersRoutes = require("./modules/users/users.routes");
const authRoutes = require("./modules/auth/auth.routes");
const patientsRoutes = require("./modules/patients/patients.routes");
const assessmentsRoutes = require("./modules/assessments/assessments.routes");
const treatmentPlansRoutes = require("./modules/treatmentPlans/treatmentPlans.routes");
const goalsRoutes = require("./modules/goals/goals.routes");
const progressRoutes = require('./modules/progress/progress.routes');
const exercisesRoutes = require("./modules/exercises/exercises.routes");
const assignedExercisesRoutes = require("./modules/assignedExercises/assignedExercises.routes");
const exerciseSubmissionsRoutes = require("./modules/exerciseSubmissions/exerciseSubmissions.routes");
const exerciseReviewsRoutes = require("./modules/exerciseReviews/exerciseReviews.routes");
const sessionsRoutes = require("./modules/sessions/sessions.routes");
const notificationsRoutes = require("./modules/notifications/notifications.routes");
const communicationRoutes = require("./modules/communication/communication.routes");
const reportsRoutes = require("./modules/reports/reports.routes");
const resourcesRoutes = require("./modules/resources/resources.routes");
const auditLogsRoutes = require("./modules/auditLogs/auditLogs.routes");
const specialistsRoutes = require("./modules/specialists/specialists.routes");
const parentsRoutes = require("./modules/parents/parents.routes");

const aiRecommendationsRoutes = require("./modules/aiRecommendations/aiRecommendations.routes");
const aiChatRoutes = require("./modules/aiChat/aiChat.routes");
const aiClinicalProgressRoutes = require("./modules/aiClinicalProgress/aiClinicalProgress.routes");
const speechAnalysesRoutes = require("./modules/speechAnalyses/speechAnalyses.routes");


const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const uploadsRoutes = require("./modules/uploads/uploads.routes");
const aiReportsRoutes = require("./modules/aiReports/aiReports.routes");
const translationsRoutes = require("./modules/translations/translations.routes");
const presenceRoutes = require("./modules/presence/presence.routes");
const specialistFeedbackRoutes = require("./modules/specialistFeedback/specialistFeedback.routes");
const sessionRequestsRoutes = require("./modules/sessionRequests/sessionRequests.routes");
const complaintsRoutes = require("./modules/complaints/complaints.routes");
const adminComplaintsRoutes = require("./modules/complaints/adminComplaints.routes");
const supportRequestsRoutes = require("./modules/supportRequests/supportRequests.routes");
const adminSupportRequestsRoutes = require("./modules/supportRequests/adminSupportRequests.routes");
const caseCategoriesRoutes = require("./modules/caseCategories/caseCategories.routes");
const caseIntakeRoutes = require("./modules/caseIntake/caseIntake.routes");
const familyPatternsRoutes = require("./modules/familyPatterns/familyPatterns.routes");
const { devRequestLogger } = require("./middleware/devRequestLogger");
const { uploadsRoot, ensureUploadDirs } = require("./config/uploads");

ensureUploadDirs();

const app = express();

app.set("trust proxy", true);

app.use(helmet());
app.use(cors(getExpressCorsOptions()));
app.use(cookieParser());
app.use(express.json());
app.use(devRequestLogger);

app.get("/", (req, res) => {
  res.json({
    message: "Smart Rehab Backend API Running"
  });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running"
  });
});

app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/patients", patientsRoutes);
app.use("/api/v1/assessments", assessmentsRoutes);
app.use("/api/v1/treatment-plans", treatmentPlansRoutes);
app.use("/api/v1/goals", goalsRoutes);
app.use('/api/v1', progressRoutes);
app.use("/api/v1", exercisesRoutes);
app.use("/api/v1", assignedExercisesRoutes);
app.use("/api/v1", exerciseSubmissionsRoutes);
app.use("/api/v1", exerciseReviewsRoutes);
app.use("/api/v1", sessionsRoutes);
app.use("/api/v1", notificationsRoutes);
app.use("/api/v1", communicationRoutes);
app.use("/api/v1", reportsRoutes);
app.use("/api/v1", resourcesRoutes);
app.use("/api/v1", auditLogsRoutes);
app.use("/api/v1", specialistsRoutes);
app.use("/api/v1", parentsRoutes);

app.use("/api/v1/ai/recommendations", aiRecommendationsRoutes);
app.use("/api/v1/ai/chat", aiChatRoutes);
app.use("/api/v1", aiClinicalProgressRoutes);
app.use("/api/v1/speech-analyses", speechAnalysesRoutes);
app.use("/api/v1", dashboardRoutes);
app.use("/api/v1/uploads", uploadsRoutes);
app.use(
  "/uploads",
  express.static(uploadsRoot, {
    setHeaders(res) {
      // Public uploaded assets are embedded by the frontend on a different origin in dev.
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);
app.use("/api/v1", aiReportsRoutes);
app.use("/api/v1", translationsRoutes);
app.use("/api/v1/presence", presenceRoutes);
app.use("/api/v1/specialist-feedback", specialistFeedbackRoutes);
app.use("/api/v1/session-requests", sessionRequestsRoutes);
app.use("/api/v1/complaints", complaintsRoutes);
app.use("/api/v1/admin/complaints", adminComplaintsRoutes);
app.use("/api/v1/support-requests", supportRequestsRoutes);
app.use("/api/v1/admin/support-requests", adminSupportRequestsRoutes);
app.use("/api/v1/case-categories", caseCategoriesRoutes);
app.use("/api/v1/case-intake-requests", caseIntakeRoutes);
app.use("/api/v1", familyPatternsRoutes);

module.exports = app;
