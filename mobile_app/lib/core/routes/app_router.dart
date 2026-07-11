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
import '../../features/dashboard/presentation/admin/admin_screens.dart';
import '../../features/dashboard/presentation/admin/admin_ai_center_screen.dart';
import '../../features/dashboard/presentation/admin/admin_audit_logs_screen.dart';
import '../../features/dashboard/presentation/admin/admin_patients_screen.dart';
import '../../features/dashboard/presentation/admin/admin_sessions_screen.dart';
import '../../features/dashboard/presentation/admin/admin_users_screen.dart';
import '../../features/dashboard/presentation/admin/patient_assignments_screen.dart';
import '../../features/dashboard/presentation/admin_dashboard_screen.dart';
import '../../features/dashboard/presentation/manage_parent_links_screen.dart';
import '../../features/dashboard/presentation/parent/edit_parent_profile_screen.dart';
import '../../features/dashboard/presentation/communication/chat_screen.dart';
import '../../features/dashboard/presentation/communication/conversations_list_screen.dart';
import '../../features/dashboard/models/communication_models.dart';
import '../../features/dashboard/presentation/parent/parent_ai_chat_screen.dart';
import '../../features/dashboard/presentation/parent/parent_extended_screens.dart';
import '../../features/dashboard/presentation/parent/parent_screens.dart';
import '../../features/dashboard/presentation/parent_dashboard_screen.dart';
import '../../features/dashboard/presentation/specialist/edit_treatment_plan_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_ai_recommendations_screen.dart';
import '../../features/dashboard/presentation/specialist/manage_goals_screen.dart';
import '../../features/dashboard/presentation/specialist/patient_details_screen.dart';
import '../../features/dashboard/presentation/specialist/review_exercise_screen.dart';
import '../../features/dashboard/presentation/specialist/edit_specialist_profile_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_profile_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_report_details_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_reports_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_sessions_screen.dart';
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
        builder: (context, state) => const ForgotPasswordScreen(),
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
          final conversation = state.extra is CommunicationConversation
              ? state.extra as CommunicationConversation
              : null;
          return CommunicationChatScreen(
            conversationId: conversationId,
            initialConversation: conversation,
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
        path: AppRoutes.manageParentLinks,
        name: 'manageParentLinks',
        builder: (context, state) => const ManageParentLinksScreen(),
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
        builder: (context, state) => const SpecialistSessionsScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistTreatmentPlans,
        name: 'specialistTreatmentPlans',
        builder: (context, state) => const SpecialistTreatmentPlansScreen(),
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
        path: AppRoutes.specialistReports,
        name: 'specialistReports',
        builder: (context, state) => const SpecialistReportsScreen(),
      ),
      GoRoute(
        path: AppRoutes.specialistReportDetailsPath,
        name: 'specialistReportDetails',
        builder: (context, state) => SpecialistReportDetailsScreen(
          reportId: state.pathParameters['reportId']!,
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
          final conversation = state.extra is CommunicationConversation
              ? state.extra as CommunicationConversation
              : null;
          return CommunicationChatScreen(
            conversationId: conversationId,
            initialConversation: conversation,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.specialistMore,
        name: 'specialistMore',
        builder: (context, state) => const SpecialistMoreScreen(),
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
        path: AppRoutes.adminPatientAssignments,
        name: 'adminPatientAssignments',
        builder: (context, state) => const PatientAssignmentsScreen(),
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
        builder: (context, state) => const AdminUsersScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminExercises,
        name: 'adminExercises',
        builder: (context, state) => const AdminExercisesScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminReports,
        name: 'adminReports',
        builder: (context, state) => const AdminReportsScreen(),
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
        path: AppRoutes.adminMore,
        name: 'adminMore',
        builder: (context, state) => const AdminMoreScreen(),
      ),
    ],
  );
});
