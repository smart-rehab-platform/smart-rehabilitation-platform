import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/reset_password_screen.dart';
import '../../features/auth/presentation/signup_screen.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/presentation/verify_email_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/complaints/presentation/admin/admin_complaint_details_screen.dart';
import '../../features/complaints/presentation/admin/admin_complaints_screen.dart';
import '../../features/complaints/presentation/parent/parent_complaint_details_screen.dart';
import '../../features/complaints/presentation/parent/parent_complaint_form_screen.dart';
import '../../features/complaints/presentation/parent/parent_complaints_screen.dart';
import '../../features/support_requests/presentation/admin/admin_support_request_details_screen.dart';
import '../../features/support_requests/presentation/admin/admin_support_requests_screen.dart';
import '../../features/support_requests/presentation/specialist/specialist_support_request_details_screen.dart';
import '../../features/support_requests/presentation/specialist/specialist_support_request_form_screen.dart';
import '../../features/support_requests/presentation/specialist/specialist_support_requests_screen.dart';
import '../../features/case_intake/presentation/parent_case_request_details_screen.dart';
import '../../features/case_intake/presentation/parent_case_request_form_screen.dart';
import '../../features/case_intake/presentation/parent_case_requests_screen.dart';
import '../../features/case_intake/presentation/admin/admin_case_inbox_screen.dart';
import '../../features/case_intake/presentation/admin/admin_case_request_details_screen.dart';
import '../../features/case_intake/presentation/admin/admin_matching_specialists_screen.dart';
import '../../features/case_intake/presentation/specialist/specialist_assigned_cases_screen.dart';
import '../../features/case_intake/presentation/specialist/specialist_case_request_details_screen.dart';
import '../../features/dashboard/presentation/admin/admin_screens.dart';
import '../../features/dashboard/presentation/admin/edit_admin_profile_screen.dart';
import '../../features/dashboard/presentation/admin/admin_ai_center_screen.dart';
import '../../features/dashboard/presentation/admin/admin_audit_logs_screen.dart';
import '../../features/dashboard/presentation/admin/admin_patients_screen.dart';
import '../../features/dashboard/presentation/admin/admin_patient_details_screen.dart';
import '../../features/dashboard/presentation/admin/admin_sessions_screen.dart';
import '../../features/dashboard/presentation/admin/admin_users_screen.dart';
import '../../features/dashboard/presentation/admin/patient_assignments_screen.dart';
import '../../features/dashboard/presentation/admin_dashboard_screen.dart';
import '../../features/dashboard/presentation/parent/edit_parent_profile_screen.dart';
import '../../features/dashboard/presentation/communication/chat_screen.dart';
import '../../features/dashboard/presentation/communication/conversations_list_screen.dart';
import '../../features/dashboard/models/communication_models.dart';
import '../../features/dashboard/presentation/parent/parent_ai_chat_screen.dart';
import '../../features/dashboard/models/parent_dashboard_models.dart';
import '../../features/dashboard/presentation/parent/parent_extended_screens.dart';
import '../../features/dashboard/presentation/parent/parent_screens.dart';
import '../../features/dashboard/presentation/parent_dashboard_screen.dart';
import '../../features/dashboard/presentation/specialist/edit_treatment_plan_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_create_treatment_plan_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_ai_recommendations_screen.dart';
import '../../features/dashboard/presentation/specialist/manage_goals_screen.dart';
import '../../features/dashboard/presentation/specialist/patient_details_screen.dart';
import '../../features/dashboard/presentation/specialist/review_exercise_screen.dart';
import '../../features/dashboard/presentation/specialist/edit_specialist_profile_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_assign_exercise_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_exercise_details_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_assigned_exercise_details_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_upsert_exercise_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_profile_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_report_details_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_reports_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_sessions_calendar_widgets.dart';
import '../../features/dashboard/presentation/specialist/specialist_sessions_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_session_details_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_upsert_session_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_speech_analysis_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_screens.dart';
import '../../features/dashboard/presentation/specialist_dashboard_screen.dart';
import '../../features/dashboard/home_page.dart';
import '../../features/exercises/presentation/parent_daily_tasks_screen.dart';
import 'app_routes.dart';
import 'role_routing.dart';

class GoRouterRefreshNotifier extends ChangeNotifier {
  GoRouterRefreshNotifier(this._ref) {
    _ref.listen<AuthState>(authProvider, (_, __) => notifyListeners());
  }

  final Ref _ref;
}

final goRouterProvider = Provider<GoRouter>((ref) {
  final refreshNotifier = GoRouterRefreshNotifier(ref);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    refreshListenable: refreshNotifier,
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      final uri = state.uri;
      final path = state.matchedLocation;

      if (uri.scheme == 'smartrehab' && uri.host == 'verify-email') {
        final token = uri.queryParameters['token'];
        if (token != null && token.trim().isNotEmpty) {
          return '${AppRoutes.verifyEmail}?token=${Uri.encodeComponent(token.trim())}';
        }

        final email = uri.queryParameters['email'];
        if (email != null && email.trim().isNotEmpty) {
          return '${AppRoutes.verifyEmail}?email=${Uri.encodeComponent(email.trim())}';
        }

        return AppRoutes.verifyEmail;
      }

      if (uri.scheme == 'smartrehab' && uri.host == 'reset-password') {
        final token = uri.queryParameters['token'];
        if (token != null && token.trim().isNotEmpty) {
          return '${AppRoutes.resetPassword}?token=${Uri.encodeComponent(token.trim())}';
        }

        return AppRoutes.resetPassword;
      }

      final role = auth.user?.role;

      if (auth.isInitializing) {
        return null;
      }

      final isAuthRoute =
          path == AppRoutes.login ||
          path == AppRoutes.signup ||
          path == AppRoutes.forgotPassword ||
          path == AppRoutes.resetPassword ||
          path == AppRoutes.verifyEmail;

      if (!auth.isAuthenticated) {
        if (RoleRouting.isProtectedDashboardRoute(path)) {
          return AppRoutes.login;
        }
        return null;
      }

      final home = RoleRouting.dashboardForRole(role);
      if (home == null) {
        if (RoleRouting.isProtectedDashboardRoute(path)) {
          return AppRoutes.login;
        }
        if (isAuthRoute || path == AppRoutes.splash) {
          return AppRoutes.login;
        }
        return null;
      }

      if (isAuthRoute || path == AppRoutes.splash) {
        if (path == AppRoutes.resetPassword ||
            path == AppRoutes.forgotPassword) {
          return null;
        }
        return home;
      }

      if (RoleRouting.isProtectedDashboardRoute(path) &&
          !RoleRouting.canAccessRoute(role, path)) {
        return home;
      }

      if (path == AppRoutes.dashboard) {
        return null;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.signup,
        name: 'signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        name: 'forgotPassword',
        builder: (context, state) {
          final initialEmail =
              state.extra is String ? state.extra as String : null;
          return ForgotPasswordScreen(initialEmail: initialEmail);
        },
      ),
      GoRoute(
        path: AppRoutes.resetPassword,
        name: 'resetPassword',
        builder: (context, state) => ResetPasswordScreen(
          initialToken: state.uri.queryParameters['token'],
        ),
      ),
      GoRoute(
        path: AppRoutes.verifyEmail,
        name: 'verifyEmail',
        builder: (context, state) => VerifyEmailScreen(
          initialToken: state.uri.queryParameters['token'],
          email: state.uri.queryParameters['email'],
        ),
      ),
      GoRoute(
        path: AppRoutes.dashboard,
        name: 'dashboard',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: AppRoutes.parentDashboard,
        name: 'parentDashboard',
        builder: (context, state) => const ParentDashboardScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentDailyTasks,
        name: 'parentDailyTasks',
        builder: (context, state) => const ParentDailyTasksScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentChildren,
        name: 'parentChildren',
        builder: (context, state) => const ParentChildrenScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentReports,
        name: 'parentReports',
        builder: (context, state) => const ParentReportsScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentSessions,
        name: 'parentSessions',
        builder: (context, state) => const ParentSessionsScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentNotifications,
        name: 'parentNotifications',
        builder: (context, state) => const ParentNotificationsScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentProfile,
        name: 'parentProfile',
        builder: (context, state) => const ParentProfileScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentEditProfile,
        name: 'parentEditProfile',
        builder: (context, state) => const EditParentProfileScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentMore,
        name: 'parentMore',
        builder: (context, state) => const ParentMoreScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentCaseRequests,
        name: 'parentCaseRequests',
        builder: (context, state) => const ParentCaseRequestsScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentCaseRequestNew,
        name: 'parentCaseRequestNew',
        builder: (context, state) => const ParentCaseRequestFormScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentCaseRequestEditPath,
        name: 'parentCaseRequestEdit',
        builder: (context, state) => ParentCaseRequestFormScreen(
          requestId: state.pathParameters['requestId'],
        ),
      ),
      GoRoute(
        path: AppRoutes.parentCaseRequestDetailPath,
        name: 'parentCaseRequestDetail',
        builder: (context, state) => ParentCaseRequestDetailsScreen(
          requestId: state.pathParameters['requestId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.parentComplaints,
        name: 'parentComplaints',
        builder: (context, state) => const ParentComplaintsScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentComplaintNew,
        name: 'parentComplaintNew',
        builder: (context, state) => const ParentComplaintFormScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentComplaintDetailPath,
        name: 'parentComplaintDetail',
        builder: (context, state) => ParentComplaintDetailsScreen(
          complaintId: state.pathParameters['complaintId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.parentChildDetail,
        name: 'parentChildDetail',
        builder: (context, state) =>
            ParentChildDetailScreen(childId: state.pathParameters['childId']!),
      ),
      GoRoute(
        path: AppRoutes.parentProgress,
        name: 'parentProgress',
        builder: (context, state) {
          final childId =
              state.uri.queryParameters['childId'] ??
              state.extra as String? ??
              '';
          return ParentProgressScreen(childId: childId);
        },
      ),
      GoRoute(
        path: AppRoutes.parentFeedbackDetailPath,
        name: 'parentFeedbackDetail',
        builder: (context, state) {
          final reviewId = state.pathParameters['reviewId'] ?? '';
          final patientId = state.uri.queryParameters['patientId'];
          final extra = state.extra;
          return ParentFeedbackDetailScreen(
            reviewId: reviewId,
            patientId: patientId,
            initialFeedback: extra is ParentSpecialistFeedback ? extra : null,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.parentFeedback,
        name: 'parentFeedback',
        builder: (context, state) => const ParentFeedbackScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentAiChat,
        name: 'parentAiChat',
        builder: (context, state) => const ParentAiChatScreen(),
      ),
      GoRoute(
        path: AppRoutes.parentMessages,
        name: 'parentMessages',
        builder: (context, state) =>
            const ConversationsListScreen(isParent: true),
      ),
      GoRoute(
        path: AppRoutes.parentChatPath,
        name: 'parentChat',
        builder: (context, state) {
          final conversationId = state.pathParameters['conversationId'] ?? '';
          final extra = state.extra;
          CommunicationConversation? conversation;
          String? initialDraftMessage;
          if (extra is CommunicationChatRouteArgs) {
            conversation = extra.conversation;
            initialDraftMessage = extra.initialDraftMessage;
          } else if (extra is CommunicationConversation) {
            conversation = extra;
          }
          return CommunicationChatScreen(
            conversationId: conversationId,
            initialConversation: conversation,
            initialDraftMessage: initialDraftMessage,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.parentExerciseDetails,
        name: 'parentExerciseDetails',
        builder: (context, state) {
          final assignedExerciseId =
              state.uri.queryParameters['assignedExerciseId'] ?? '';
          return ParentExerciseDetailScreen(
            assignedExerciseId: assignedExerciseId,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.specialistDashboard,
        name: 'specialistDashboard',
        builder: (context, state) => const SpecialistDashboardScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistPatients,
        name: 'specialistPatients',
        builder: (context, state) => const SpecialistPatientsScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistPatientDetailsPath,
        name: 'specialistPatientDetails',
        builder: (context, state) => SpecialistPatientDetailsScreen(
          patientId: state.pathParameters['patientId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistManageGoalsPath,
        name: 'specialistManageGoals',
        builder: (context, state) => SpecialistManageGoalsScreen(
          patientId: state.pathParameters['patientId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistAiRecommendationsPath,
        name: 'specialistAiRecommendations',
        builder: (context, state) => SpecialistAiRecommendationsScreen(
          patientId: state.pathParameters['patientId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistPatientSpeechAnalysisPath,
        name: 'specialistPatientSpeechAnalysis',
        builder: (context, state) => SpecialistSpeechAnalysisScreen(
          patientId: state.pathParameters['patientId']!,
          submissionId: state.uri.queryParameters['submissionId'],
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistReviewExercisePath,
        name: 'specialistReviewExercise',
        builder: (context, state) => SpecialistReviewExerciseScreen(
          submissionId: state.pathParameters['submissionId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistEditTreatmentPlanPath,
        name: 'specialistEditTreatmentPlan',
        builder: (context, state) => SpecialistEditTreatmentPlanScreen(
          planId: state.pathParameters['planId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistPendingReviews,
        name: 'specialistPendingReviews',
        builder: (context, state) => const SpecialistPendingReviewsScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistSessions,
        name: 'specialistSessions',
        builder: (context, state) {
          final view = state.uri.queryParameters['view'];
          final initialViewMode = view == 'calendar'
              ? SpecialistSessionsViewMode.calendar
              : SpecialistSessionsViewMode.list;
          return SpecialistSessionsScreen(initialViewMode: initialViewMode);
        },
      ),
      GoRoute(
        path: AppRoutes.specialistCreateSession,
        name: 'specialistCreateSession',
        builder: (context, state) {
          final initialNotes = state.extra is String
              ? state.extra as String
              : null;
          return SpecialistUpsertSessionScreen(
            initialPatientId: state.uri.queryParameters['patientId'],
            initialSessionNotes: initialNotes,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.specialistEditSessionPath,
        name: 'specialistEditSession',
        builder: (context, state) => SpecialistUpsertSessionScreen(
          sessionId: state.pathParameters['sessionId'],
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistSessionDetailsPath,
        name: 'specialistSessionDetails',
        builder: (context, state) => SpecialistSessionDetailsScreen(
          sessionId: state.pathParameters['sessionId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistTreatmentPlans,
        name: 'specialistTreatmentPlans',
        builder: (context, state) => const SpecialistTreatmentPlansScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistCreateTreatmentPlanPath,
        name: 'specialistCreateTreatmentPlan',
        builder: (context, state) {
          final patientId = state.uri.queryParameters['patientId'] ?? '';
          final patientName = state.uri.queryParameters['patientName'];
          return SpecialistCreateTreatmentPlanScreen(
            patientId: patientId,
            patientName: patientName,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.specialistPatientProgress,
        name: 'specialistPatientProgress',
        builder: (context, state) => const SpecialistPatientProgressScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistExercises,
        name: 'specialistExercises',
        builder: (context, state) => const SpecialistExercisesScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistAddExercise,
        name: 'specialistAddExercise',
        builder: (context, state) => const SpecialistUpsertExerciseScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistEditExercisePath,
        name: 'specialistEditExercise',
        builder: (context, state) => SpecialistUpsertExerciseScreen(
          exerciseId: state.pathParameters['exerciseId'],
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistExerciseDetailsPath,
        name: 'specialistExerciseDetails',
        builder: (context, state) => SpecialistExerciseDetailsScreen(
          exerciseId: state.pathParameters['exerciseId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistAssignedExerciseDetailsPath,
        name: 'specialistAssignedExerciseDetails',
        builder: (context, state) => SpecialistAssignedExerciseDetailsScreen(
          assignedExerciseId: state.pathParameters['assignedExerciseId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistAssignExercisePath,
        name: 'specialistAssignExercise',
        builder: (context, state) => SpecialistAssignExerciseScreen(
          patientId: state.pathParameters['patientId']!,
          planId: state.uri.queryParameters['planId'] ?? '',
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistReports,
        name: 'specialistReports',
        builder: (context, state) {
          final patientId = state.uri.queryParameters['patientId']?.trim();
          return SpecialistReportsScreen(
            patientId: (patientId == null || patientId.isEmpty)
                ? null
                : patientId,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.specialistReportDetailsPath,
        name: 'specialistReportDetails',
        builder: (context, state) => SpecialistReportDetailsScreen(
          reportId: state.pathParameters['reportId']!,
          // Only treat as AI when explicitly marked (?ai=1).
          isAiReport: state.uri.queryParameters['ai'] == '1',
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistNotifications,
        name: 'specialistNotifications',
        builder: (context, state) => const SpecialistNotificationsScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistProfile,
        name: 'specialistProfile',
        builder: (context, state) => const SpecialistProfileScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistEditProfile,
        name: 'specialistEditProfile',
        builder: (context, state) => const EditSpecialistProfileScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistMessages,
        name: 'specialistMessages',
        builder: (context, state) =>
            const ConversationsListScreen(isParent: false),
      ),
      GoRoute(
        path: AppRoutes.specialistChatPath,
        name: 'specialistChat',
        builder: (context, state) {
          final conversationId = state.pathParameters['conversationId'] ?? '';
          final extra = state.extra;
          CommunicationConversation? conversation;
          String? initialDraftMessage;
          if (extra is CommunicationChatRouteArgs) {
            conversation = extra.conversation;
            initialDraftMessage = extra.initialDraftMessage;
          } else if (extra is CommunicationConversation) {
            conversation = extra;
          }
          return CommunicationChatScreen(
            conversationId: conversationId,
            initialConversation: conversation,
            initialDraftMessage: initialDraftMessage,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.specialistMore,
        name: 'specialistMore',
        builder: (context, state) => const SpecialistMoreScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistCaseRequests,
        name: 'specialistCaseRequests',
        builder: (context, state) => const SpecialistAssignedCasesScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistCaseRequestDetailPath,
        name: 'specialistCaseRequestDetail',
        builder: (context, state) => SpecialistCaseRequestDetailsScreen(
          requestId: state.pathParameters['requestId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.specialistSupportRequests,
        name: 'specialistSupportRequests',
        builder: (context, state) => const SpecialistSupportRequestsScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistSupportRequestNew,
        name: 'specialistSupportRequestNew',
        builder: (context, state) => const SpecialistSupportRequestFormScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistSupportRequestDetailPath,
        name: 'specialistSupportRequestDetail',
        builder: (context, state) => SpecialistSupportRequestDetailsScreen(
          requestId: state.pathParameters['requestId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.adminDashboard,
        name: 'adminDashboard',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminPatients,
        name: 'adminPatients',
        builder: (context, state) => const AdminPatientsScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminPatientDetailsPath,
        name: 'adminPatientDetails',
        builder: (context, state) => AdminPatientDetailsScreen(
          patientId: state.pathParameters['patientId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.adminPatientAssignments,
        name: 'adminPatientAssignments',
        builder: (context, state) => const PatientAssignmentsScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminCaseRequests,
        name: 'adminCaseRequests',
        builder: (context, state) => const AdminCaseInboxScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminCaseRequestDetailPath,
        name: 'adminCaseRequestDetail',
        builder: (context, state) => AdminCaseRequestDetailsScreen(
          requestId: state.pathParameters['requestId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.adminComplaints,
        name: 'adminComplaints',
        builder: (context, state) => const AdminComplaintsScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminComplaintDetailPath,
        name: 'adminComplaintDetail',
        builder: (context, state) => AdminComplaintDetailsScreen(
          complaintId: state.pathParameters['complaintId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.adminSupportRequests,
        name: 'adminSupportRequests',
        builder: (context, state) => const AdminSupportRequestsScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminSupportRequestDetailPath,
        name: 'adminSupportRequestDetail',
        builder: (context, state) => AdminSupportRequestDetailsScreen(
          requestId: state.pathParameters['requestId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.adminCaseRequestAssignPath,
        name: 'adminCaseRequestAssign',
        builder: (context, state) => AdminMatchingSpecialistsScreen(
          requestId: state.pathParameters['requestId']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.adminSessions,
        name: 'adminSessions',
        builder: (context, state) => const AdminSessionsScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminAiCenter,
        name: 'adminAiCenter',
        builder: (context, state) => const AdminAiCenterScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminAuditLogs,
        name: 'adminAuditLogs',
        builder: (context, state) => const AdminAuditLogsScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminUsers,
        name: 'adminUsers',
        builder: (context, state) => AdminUsersScreen(
          initialRoleFilter: AppRoutes.parseAdminUsersRoleParam(
            state.uri.queryParameters['role'],
          ),
        ),
      ),
      GoRoute(
        path: AppRoutes.adminExercises,
        name: 'adminExercises',
        builder: (context, state) => const AdminExercisesScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminAddExercise,
        name: 'adminAddExercise',
        builder: (context, state) =>
            const SpecialistUpsertExerciseScreen(useAdminChrome: true),
      ),
      GoRoute(
        path: AppRoutes.adminEditExercisePath,
        name: 'adminEditExercise',
        builder: (context, state) => SpecialistUpsertExerciseScreen(
          exerciseId: state.pathParameters['exerciseId'],
          useAdminChrome: true,
        ),
      ),
      GoRoute(
        path: AppRoutes.adminExerciseDetailsPath,
        name: 'adminExerciseDetails',
        builder: (context, state) => SpecialistExerciseDetailsScreen(
          exerciseId: state.pathParameters['exerciseId']!,
          useAdminChrome: true,
        ),
      ),
      GoRoute(
        path: AppRoutes.adminReports,
        name: 'adminReports',
        builder: (context, state) => const AdminReportsScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminReportDetailsPath,
        name: 'adminReportDetails',
        builder: (context, state) => SpecialistReportDetailsScreen(
          reportId: state.pathParameters['reportId']!,
          // Only treat as AI when explicitly marked (?ai=1). Missing/0 = regular.
          isAiReport: state.uri.queryParameters['ai'] == '1',
          useAdminChrome: true,
        ),
      ),
      GoRoute(
        path: AppRoutes.adminNotifications,
        name: 'adminNotifications',
        builder: (context, state) => const AdminNotificationsScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminProfile,
        name: 'adminProfile',
        builder: (context, state) => const AdminProfileScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminEditProfile,
        name: 'adminEditProfile',
        builder: (context, state) => const EditAdminProfileScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminMore,
        name: 'adminMore',
        builder: (context, state) => const AdminMoreScreen(),
      ),
    ],
  );
});
