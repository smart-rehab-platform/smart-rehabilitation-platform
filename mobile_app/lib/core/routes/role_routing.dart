import '../../features/auth/models/auth_user.dart';
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

  static String? normalizeSpecialistVerificationStatus(String? status) {
    final normalized = status?.trim().toLowerCase();
    if (normalized == 'approved' ||
        normalized == 'rejected' ||
        normalized == 'pending') {
      return normalized;
    }
    return null;
  }

  static String? getSpecialistVerificationStatus(AuthUser? user) {
    if (user?.role?.toLowerCase() != 'specialist') {
      return null;
    }

    return normalizeSpecialistVerificationStatus(user?.verificationStatus) ??
        'pending';
  }

  static bool isApprovedSpecialist(AuthUser? user) {
    return getSpecialistVerificationStatus(user) == 'approved';
  }

  /// Role home that also routes unapproved specialists to verification screens.
  static String? homeForUser(AuthUser? user) {
    final role = user?.role?.toLowerCase();
    if (role != 'specialist') {
      return dashboardForRole(role);
    }

    final status = getSpecialistVerificationStatus(user);
    if (status == 'approved') {
      return AppRoutes.specialistDashboard;
    }
    if (status == 'rejected') {
      return AppRoutes.specialistVerificationRejected;
    }
    return AppRoutes.specialistVerificationPending;
  }

  static bool isAdminRoute(String path) => path.startsWith('/dashboard/admin');

  static bool isSpecialistRoute(String path) =>
      path.startsWith('/dashboard/specialist');

  static bool isParentRoute(String path) => path.startsWith('/dashboard/parent');

  static bool isSpecialistVerificationRoute(String path) {
    return path == AppRoutes.specialistVerificationPending ||
        path == AppRoutes.specialistVerificationRejected ||
        path.startsWith('/specialist-verification/');
  }

  static bool isProtectedDashboardRoute(String path) {
    return isAdminRoute(path) || isSpecialistRoute(path) || isParentRoute(path);
  }

  static bool canAccessRoute(AuthUser? user, String path) {
    final role = user?.role?.toLowerCase();

    if (isAdminRoute(path)) {
      return role == 'admin';
    }
    if (isSpecialistRoute(path)) {
      return role == 'specialist' && isApprovedSpecialist(user);
    }
    if (isParentRoute(path)) {
      return role == 'parent';
    }
    if (isSpecialistVerificationRoute(path)) {
      return role == 'specialist';
    }
    return true;
  }
}
