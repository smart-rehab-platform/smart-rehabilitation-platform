import 'app_routes.dart';

class RoleRouting {
  RoleRouting._();

  static String? dashboardForRole(String? role) {
    switch (role?.toLowerCase()) {
      case 'admin':
        return AppRoutes.adminDashboard;
      case 'specialist':
        return AppRoutes.specialistDashboard;
      case 'parent':
        return AppRoutes.parentDashboard;
      default:
        return null;
    }
  }

  static bool isAdminRoute(String path) => path.startsWith('/dashboard/admin');

  static bool isSpecialistRoute(String path) =>
      path.startsWith('/dashboard/specialist');

  static bool isParentRoute(String path) => path.startsWith('/dashboard/parent');

  static bool isProtectedDashboardRoute(String path) {
    return isAdminRoute(path) || isSpecialistRoute(path) || isParentRoute(path);
  }

  static bool canAccessRoute(String? role, String path) {
    final normalizedRole = role?.toLowerCase();
    if (isAdminRoute(path)) {
      return normalizedRole == 'admin';
    }
    if (isSpecialistRoute(path)) {
      return normalizedRole == 'specialist';
    }
    if (isParentRoute(path)) {
      return normalizedRole == 'parent';
    }
    return true;
  }
}
