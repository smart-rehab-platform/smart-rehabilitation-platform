class AppRoutes {
  AppRoutes._();

  static const String splash = '/';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String forgotPassword = '/forgot-password';
  static const String resetPassword = '/reset-password';
  static const String verifyEmail = '/verify-email';
  static const String dashboard = '/dashboard';
  static const String parentDashboard = '/dashboard/parent';
  static const String specialistDashboard = '/dashboard/specialist';
  static const String manageParentLinks = '/dashboard/specialist/parent-links';
  static const String specialistPatients = '/dashboard/specialist/patients';
  static const String specialistPatientDetailsPath =
      '/dashboard/specialist/patient/:patientId';

  static String specialistPatientDetails(String patientId) =>
      '/dashboard/specialist/patient/$patientId';

  static const String specialistReviewExercisePath =
      '/dashboard/specialist/review/:submissionId';

  static String specialistReviewExercise(String submissionId) =>
      '/dashboard/specialist/review/$submissionId';

  static const String specialistEditTreatmentPlanPath =
      '/dashboard/specialist/treatment-plan/:planId/edit';

  static String specialistEditTreatmentPlan(String planId) =>
      '/dashboard/specialist/treatment-plan/$planId/edit';

  static const String specialistManageGoalsPath =
      '/dashboard/specialist/patient/:patientId/goals';

  static String specialistManageGoals(String patientId) =>
      '/dashboard/specialist/patient/$patientId/goals';

  static const String specialistAiRecommendationsPath =
      '/dashboard/specialist/patient/:patientId/ai-recommendations';

  static String specialistAiRecommendations(String patientId) =>
      '/dashboard/specialist/patient/$patientId/ai-recommendations';

  static const String specialistPatientSpeechAnalysisPath =
      '/dashboard/specialist/patient/:patientId/speech-analysis';

  static String specialistPatientSpeechAnalysis(
    String patientId, {
    String? submissionId,
  }) {
    final base = '/dashboard/specialist/patient/$patientId/speech-analysis';
    if (submissionId != null && submissionId.trim().isNotEmpty) {
      return '$base?submissionId=${Uri.encodeComponent(submissionId.trim())}';
    }
    return base;
  }

  static const String specialistPendingReviews = '/dashboard/specialist/pending-reviews';
  static const String specialistSessions = '/dashboard/specialist/sessions';
  static const String specialistTreatmentPlans = '/dashboard/specialist/treatment-plans';
  static const String specialistPatientProgress = '/dashboard/specialist/progress';
  static const String specialistExercises = '/dashboard/specialist/exercises';
  static const String specialistReports = '/dashboard/specialist/reports';
  static const String specialistReportDetailsPath =
      '/dashboard/specialist/reports/:reportId';

  static String specialistReportDetails(String reportId, {bool isAi = false}) {
    final base = '/dashboard/specialist/reports/$reportId';
    return isAi ? '$base?ai=1' : base;
  }

  static const String specialistNotifications = '/dashboard/specialist/notifications';
  static const String specialistProfile = '/dashboard/specialist/profile';
  static const String specialistEditProfile = '/dashboard/specialist/profile/edit';
  static const String specialistMore = '/dashboard/specialist/more';
  static const String adminDashboard = '/dashboard/admin';
  static const String adminPatients = '/dashboard/admin/patients';
  static const String adminPatientAssignments = '/dashboard/admin/patient-assignments';
  static const String adminSessions = '/dashboard/admin/sessions';
  static const String adminAiCenter = '/dashboard/admin/ai-center';
  static const String adminAuditLogs = '/dashboard/admin/audit-logs';
  static const String adminUsers = '/dashboard/admin/users';
  static const String adminExercises = '/dashboard/admin/exercises';
  static const String adminReports = '/dashboard/admin/reports';
  static const String adminNotifications = '/dashboard/admin/notifications';
  static const String adminProfile = '/dashboard/admin/profile';
  static const String adminMore = '/dashboard/admin/more';
}
