import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/signup_screen.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/dashboard/presentation/admin/admin_screens.dart';
import '../../features/dashboard/presentation/admin/admin_users_screen.dart';
import '../../features/dashboard/presentation/admin/patient_assignments_screen.dart';
import '../../features/dashboard/presentation/admin_dashboard_screen.dart';
import '../../features/dashboard/presentation/manage_parent_links_screen.dart';
import '../../features/dashboard/presentation/parent_dashboard_screen.dart';
import '../../features/dashboard/presentation/specialist/specialist_screens.dart';
import '../../features/dashboard/presentation/specialist_dashboard_screen.dart';
import '../../features/dashboard/home_page.dart';
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
      final path = state.matchedLocation;
      final role = auth.user?.role;

      if (auth.isInitializing) {
        return null;
      }

      final isAuthRoute = path == AppRoutes.login || path == AppRoutes.signup;

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
        path: AppRoutes.adminPatientAssignments,
        name: 'adminPatientAssignments',
        builder: (context, state) => const PatientAssignmentsScreen(),
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
