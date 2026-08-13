import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/parent_dashboard_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';
import 'parent_scoped_localization_utils.dart';
import 'parent_ui_helpers.dart';

class ParentChildDetailHeaderCard extends StatelessWidget {
  const ParentChildDetailHeaderCard({super.key, required this.child});

  final ParentChild child;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final metaParts = buildChildMetaParts(
      l10n: l10n,
      child: child,
      formatDate: parentFormatDate,
    );
    final progress = child.progressPercent;
    final normalizedProgress = progress == null
        ? null
        : (progress <= 1
                  ? progress.clamp(0.0, 1.0)
                  : (progress / 100).clamp(0.0, 1.0))
              .toDouble();
    final progressLabel = normalizedProgress == null
        ? null
        : '${(normalizedProgress * 100).round()}%';

    return DashboardSurfaceCard(
      tint: DashboardColors.brandCyan,
      padding: EdgeInsets.all(context.dashSpacing),
      decoration: BoxDecoration(
        color: DashboardColors.brandHeroBackground,
        borderRadius: DashboardDecorations.cardRadius,
        border: Border.all(
          color: DashboardColors.border.withValues(alpha: 0.55),
        ),
        boxShadow: DashboardDecorations.heroCardShadow(
          DashboardColors.brandCyan,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              DashboardProfileAvatar(
                initials: dashboardInitials(child.name, fallback: 'CH'),
                imageUrl: child.profileImageUrl,
                radius: 28,
              ),
              SizedBox(width: context.dashSpacing * 0.75),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      child.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: DashboardColors.textPrimary,
                        height: 1.1,
                      ),
                    ),
                    if (metaParts.isNotEmpty) ...[
                      SizedBox(height: context.dashSpacing * 0.2),
                      Text(
                        metaParts.join(' • '),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: DashboardColors.textSecondary,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (normalizedProgress != null && progressLabel != null) ...[
            SizedBox(height: context.dashSpacing * 0.65),
            Text(
              l10n.parentDashboardOverallProgress,
              style: theme.textTheme.labelMedium?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.3),
            Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: SizedBox(
                      height: 8,
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Container(color: DashboardColors.border),
                          FractionallySizedBox(
                            alignment: AlignmentDirectional.centerStart,
                            widthFactor: normalizedProgress,
                            child: const DecoratedBox(
                              decoration: BoxDecoration(
                                gradient: DashboardColors.brandProgressGradient,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                SizedBox(width: context.dashSpacing * 0.45),
                Text(
                  progressLabel,
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.brandCyan,
                  ),
                ),
              ],
            ),
            SizedBox(height: context.dashSpacing * 0.2),
            Text(
              l10n.parentDashboardKeepGoing,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
          ] else ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              l10n.parentChildrenProgressPending,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class ParentChildDetailExerciseCard extends StatelessWidget {
  const ParentChildDetailExerciseCard({
    super.key,
    required this.exercise,
    required this.subtitle,
  });

  final ParentAssignedExercise exercise;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.all(context.dashSpacing * 0.45),
            decoration: BoxDecoration(
              color: DashboardColors.brandSoft,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.fitness_center_outlined,
              color: DashboardColors.brandCyan,
              size: context.dashSpacing * 0.55,
            ),
          ),
          SizedBox(width: context.dashSpacing * 0.65),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exercise.title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                if (subtitle.isNotEmpty) ...[
                  SizedBox(height: context.dashSpacing * 0.15),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ParentChildDetailReportCard extends StatelessWidget {
  const ParentChildDetailReportCard({
    super.key,
    required this.report,
    required this.childName,
    required this.onTap,
    required this.onLongPress,
  });

  final ParentReportItem report;
  final String childName;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final subtitle = [
      if (report.reportType != null)
        localizedReportType(l10n, report.reportType!),
      childName,
      if (report.summary != null && report.summary!.trim().isNotEmpty)
        report.summary!.trim(),
      parentFormatDate(report.date),
    ].join(' • ');

    return DashboardSurfaceCard(
      onTap: onTap,
      onLongPress: onLongPress,
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(context.dashSpacing * 0.5),
            decoration: BoxDecoration(
              color: DashboardColors.brandSoft,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.description_outlined,
              color: DashboardColors.brandCyan,
              size: context.dashSpacing * 0.6,
            ),
          ),
          SizedBox(width: context.dashSpacing * 0.65),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  report.title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.15),
                Text(
                  subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          if (report.pdfUrl != null && report.pdfUrl!.isNotEmpty)
            Icon(
              Icons.open_in_new_outlined,
              color: DashboardColors.brandCyan,
              size: context.dashSpacing * 0.55,
            ),
        ],
      ),
    );
  }
}
