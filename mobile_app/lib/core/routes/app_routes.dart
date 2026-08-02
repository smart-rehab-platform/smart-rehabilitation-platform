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

  static const String specialistPendingReviews =
      '/dashboard/specialist/pending-reviews';

  static const String specialistSessions = '/dashboard/specialist/sessions';

  /// Opens Specialist Sessions in calendar or list mode via `?view=`.
  static String specialistSessionsWithView({String view = 'list'}) {
    if (view == 'calendar') {
      return Uri(
        path: specialistSessions,
        queryParameters: const {'view': 'calendar'},
      ).toString();
    }
    return specialistSessions;
  }

  static const String specialistSessionDetailsPath =
      '/dashboard/specialist/sessions/:sessionId';

  static String specialistSessionDetails(String sessionId) =>
      '/dashboard/specialist/sessions/$sessionId';

  static const String specialistCreateSession =
      '/dashboard/specialist/sessions/new';

  static const String specialistEditSessionPath =
      '/dashboard/specialist/sessions/:sessionId/edit';

  static String specialistEditSession(String sessionId) =>
      '/dashboard/specialist/sessions/$sessionId/edit';

  static const String specialistTreatmentPlans =
      '/dashboard/specialist/treatment-plans';

  static const String specialistCreateTreatmentPlanPath =
      '/dashboard/specialist/treatment-plans/new';

  static String specialistCreateTreatmentPlan({
    required String patientId,
    String? patientName,
  }) {
    final params = <String, String>{
      'patientId': patientId,
      if (patientName != null && patientName.trim().isNotEmpty)
        'patientName': patientName.trim(),
    };
    return Uri(
      path: specialistCreateTreatmentPlanPath,
      queryParameters: params,
    ).toString();
  }

  static const String specialistPatientProgress =
      '/dashboard/specialist/progress';
  static const String specialistExercises = '/dashboard/specialist/exercises';
  static const String specialistExerciseDetailsPath =
      '/dashboard/specialist/exercises/:exerciseId';

  static String specialistExerciseDetails(String exerciseId) =>
      '/dashboard/specialist/exercises/$exerciseId';

  static const String specialistAssignedExerciseDetailsPath =
      '/dashboard/specialist/assigned-exercises/:assignedExerciseId';

  static String specialistAssignedExerciseDetails(String assignedExerciseId) =>
      '/dashboard/specialist/assigned-exercises/$assignedExerciseId';

  static const String specialistAddExercise =
      '/dashboard/specialist/exercises/new';

  static const String specialistEditExercisePath =
      '/dashboard/specialist/exercises/:exerciseId/edit';

  static String specialistEditExercise(String exerciseId) =>
      '/dashboard/specialist/exercises/$exerciseId/edit';

  static const String specialistAssignExercisePath =
      '/dashboard/specialist/patient/:patientId/assign-exercise';

  static String specialistAssignExercise({
    required String patientId,
    required String planId,
  }) {
    return '/dashboard/specialist/patient/$patientId/assign-exercise'
        '?planId=${Uri.encodeComponent(planId)}';
  }

  static const String specialistReports = '/dashboard/specialist/reports';

  static String specialistPatientReports(String patientId) =>
      '/dashboard/specialist/reports?patientId=${Uri.encodeComponent(patientId)}';

  static const String specialistReportDetailsPath =
      '/dashboard/specialist/reports/:reportId';

  /// Always emits `?ai=0` or `?ai=1` so routers never infer the source.
  static String specialistReportDetails(String reportId, {required bool isAi}) {
    return '/dashboard/specialist/reports/$reportId?ai=${isAi ? '1' : '0'}';
  }

  static const String specialistNotifications =
      '/dashboard/specialist/notifications';
  static const String specialistProfile = '/dashboard/specialist/profile';
  static const String specialistEditProfile =
      '/dashboard/specialist/profile/edit';
  static const String specialistMore = '/dashboard/specialist/more';
  static const String specialistCaseRequests =
      '/dashboard/specialist/case-requests';
  static const String specialistCaseRequestDetailPath =
      '/dashboard/specialist/case-requests/:requestId';

  static String specialistCaseRequestDetail(String requestId) =>
      '/dashboard/specialist/case-requests/$requestId';

  static const String adminDashboard = '/dashboard/admin';
  static const String adminPatients = '/dashboard/admin/patients';
  static const String adminPatientDetailsPath =
      '/dashboard/admin/patient/:patientId';
  static const String adminPatientAssignments =
      '/dashboard/admin/patient-assignments';

  static String adminPatientDetails(String patientId) =>
      '/dashboard/admin/patient/$patientId';
  static const String adminSessions = '/dashboard/admin/sessions';
  static const String adminAiCenter = '/dashboard/admin/ai-center';
  static const String adminAuditLogs = '/dashboard/admin/audit-logs';
  static const String adminUsers = '/dashboard/admin/users';
  static const String adminExercises = '/dashboard/admin/exercises';
  static const String adminAddExercise = '/dashboard/admin/exercises/new';
  static const String adminEditExercisePath =
      '/dashboard/admin/exercises/:exerciseId/edit';
  static const String adminExerciseDetailsPath =
      '/dashboard/admin/exercises/:exerciseId';

  static String adminEditExercise(String exerciseId) =>
      '/dashboard/admin/exercises/$exerciseId/edit';

  static String adminExerciseDetails(String exerciseId) =>
      '/dashboard/admin/exercises/$exerciseId';

  static const String adminReports = '/dashboard/admin/reports';
  static const String adminReportDetailsPath =
      '/dashboard/admin/reports/:reportId';

  /// Always emits `?ai=0` or `?ai=1` so routers never infer the source.
  /// [isAi] must come from the list row source (`isAiReport`), not report type.
  static String adminReportDetails(String reportId, {required bool isAi}) {
    return '/dashboard/admin/reports/$reportId?ai=${isAi ? '1' : '0'}';
  }

  static const String adminNotifications = '/dashboard/admin/notifications';
  static const String adminProfile = '/dashboard/admin/profile';
  static const String adminMore = '/dashboard/admin/more';
  static const String adminCaseRequests = '/dashboard/admin/case-requests';
  static const String adminCaseRequestDetailPath =
      '/dashboard/admin/case-requests/:requestId';
  static const String adminCaseRequestAssignPath =
      '/dashboard/admin/case-requests/:requestId/assign';

  static String adminCaseRequestDetail(String requestId) =>
      '/dashboard/admin/case-requests/$requestId';

  static String adminCaseRequestAssign(String requestId) =>
      '/dashboard/admin/case-requests/$requestId/assign';

  static const String parentDailyTasks = '/dashboard/parent/daily-tasks';
  static const String parentChildren = '/dashboard/parent/children';
  static const String parentReports = '/dashboard/parent/reports';
  static const String parentSessions = '/dashboard/parent/sessions';
  static const String parentNotifications = '/dashboard/parent/notifications';
  static const String parentProfile = '/dashboard/parent/profile';
  static const String parentEditProfile = '/dashboard/parent/profile/edit';
  static const String parentMore = '/dashboard/parent/more';
  static const String parentChildDetail = '/dashboard/parent/children/:childId';
  static const String parentProgress = '/dashboard/parent/progress';
  static const String parentFeedback = '/dashboard/parent/feedback';
  static const String parentExerciseDetails =
      '/dashboard/parent/exercise-details';
  static const String parentSubmitExercise =
      '/dashboard/parent/submit-exercise';
  static const String parentAiChat = '/dashboard/parent/ai-chat';
  static const String parentMessages = '/dashboard/parent/messages';
  static const String specialistMessages = '/dashboard/specialist/messages';
  static const String parentChatPath =
      '/dashboard/parent/messages/:conversationId';
  static const String specialistChatPath =
      '/dashboard/specialist/messages/:conversationId';

  static String parentChat(String conversationId) =>
      '/dashboard/parent/messages/$conversationId';

  static String specialistChat(String conversationId) =>
      '/dashboard/specialist/messages/$conversationId';

  static const String parentCaseRequests = '/dashboard/parent/case-requests';
  static const String parentCaseRequestNew =
      '/dashboard/parent/case-requests/new';
  static const String parentCaseRequestDetailPath =
      '/dashboard/parent/case-requests/:requestId';
  static const String parentCaseRequestEditPath =
      '/dashboard/parent/case-requests/:requestId/edit';

  static String parentCaseRequestDetail(String requestId) =>
      '/dashboard/parent/case-requests/$requestId';

  static String parentCaseRequestEdit(String requestId) =>
      '/dashboard/parent/case-requests/$requestId/edit';
}
