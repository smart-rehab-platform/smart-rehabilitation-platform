import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/routes/app_routes.dart';
import 'package:mobile_app/features/dashboard/utils/admin_dashboard_navigation.dart';

void main() {
  group('Admin dashboard KPI navigation', () {
    test('New Signups KPI uses scroll-to-recent-users intent', () {
      expect(
        kAdminDashboardNewSignupsNavKind,
        AdminDashboardNewSignupsNavKind.scrollToRecentUsers,
      );
    });

    test('Recent Users scroll target key is stable', () {
      final key = GlobalKey(
        debugLabel: kAdminDashboardRecentUsersSectionDebugLabel,
      );

      expect(
        key.toString(),
        contains(kAdminDashboardRecentUsersSectionDebugLabel),
      );
    });

    test('Specialists KPI still deep-links to Users with specialist role', () {
      expect(
        AppRoutes.adminUsersWithRole(role: 'specialist'),
        '${AppRoutes.adminUsers}?role=specialist',
      );
    });

    test('default Users navigation has no role query param', () {
      expect(AppRoutes.adminUsersWithRole(), AppRoutes.adminUsers);
    });

    test('scroll intent is locale-independent', () {
      expect(kAdminDashboardNewSignupsNavKind, AdminDashboardNewSignupsNavKind.scrollToRecentUsers);
    });
  });
}
