import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routes/app_routes.dart';
import '../../auth/providers/auth_provider.dart';
import 'dashboard_bottom_nav.dart';

class ParentNavigation {
  ParentNavigation._();

  static void onNavTap(BuildContext context, DashboardNavItem item) {
    switch (item) {
      case DashboardNavItem.home:
        context.go(AppRoutes.parentDashboard);
      case DashboardNavItem.patients:
        context.go(AppRoutes.parentChildren);
      case DashboardNavItem.exercises:
        context.go(AppRoutes.parentDailyTasks);
      case DashboardNavItem.reports:
        context.go(AppRoutes.parentReports);
      case DashboardNavItem.more:
        context.go(AppRoutes.parentMore);
    }
  }

  static Future<void> logout(BuildContext context, WidgetRef ref) async {
    await ref.read(authProvider.notifier).logout();
    if (context.mounted) {
      context.go(AppRoutes.login);
    }
  }
}
