import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/dashboard_colors.dart';
import '../../core/routes/app_routes.dart';
import '../../core/theme/dashboard_theme.dart';
import '../../l10n/app_localizations.dart';
import '../../shared/widgets/responsive_layout.dart';

/// Temporary launcher to preview role dashboards during UI development.
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Theme(
      data: DashboardTheme.light,
      child: Scaffold(
        backgroundColor: DashboardColors.background,
        appBar: AppBar(
          title: Text(l10n.devDashboardPreviewsTitle),
        ),
        body: ListView(
          padding: context.responsivePadding,
          children: [
            _PreviewTile(
              title: 'Parent Dashboard',
              subtitle: 'Children, tasks, progress, and reports',
              onTap: () => context.go(AppRoutes.parentDashboard),
            ),
            _PreviewTile(
              title: 'Specialist Dashboard',
              subtitle: 'Reviews, schedule, and patient progress',
              onTap: () => context.go(AppRoutes.specialistDashboard),
            ),
            _PreviewTile(
              title: 'Admin Dashboard',
              subtitle: 'Analytics, users, and system alerts',
              onTap: () => context.go(AppRoutes.adminDashboard),
            ),
          ],
        ),
      ),
    );
  }
}

class _PreviewTile extends StatelessWidget {
  const _PreviewTile({
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: context.spacingUnit),
      child: ListTile(
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
        onTap: onTap,
      ),
    );
  }
}
