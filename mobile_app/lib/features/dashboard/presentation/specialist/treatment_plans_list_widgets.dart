import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_feature_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/dashboard_visuals.dart';
import 'specialist_scoped_localization_utils.dart';

enum TreatmentPlanListFilter {
  all,
  active,
  completed,
  archived;

  String get label => switch (this) {
    TreatmentPlanListFilter.all => 'All',
    TreatmentPlanListFilter.active => 'Active',
    TreatmentPlanListFilter.completed => 'Completed',
    TreatmentPlanListFilter.archived => 'Archived',
  };

  bool matches(SpecialistTreatmentPlanItem plan) {
    final status = plan.status?.trim().toLowerCase() ?? 'active';
    return switch (this) {
      TreatmentPlanListFilter.all => true,
      TreatmentPlanListFilter.active => status == 'active',
      TreatmentPlanListFilter.completed => status == 'completed',
      TreatmentPlanListFilter.archived => status == 'archived',
    };
  }
}

Color treatmentPlanStatusColor(String? status) {
  return switch (status?.trim().toLowerCase()) {
    'completed' => DashboardColors.accent,
    'archived' => DashboardColors.textMuted,
    _ => DashboardColors.brandCyan,
  };
}

class TreatmentPlanListCard extends StatelessWidget {
  const TreatmentPlanListCard({
    super.key,
    required this.plan,
    required this.onTap,
  });

  final SpecialistTreatmentPlanItem plan;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusColor = treatmentPlanStatusColor(plan.status);

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
      child: DashboardSurfaceCard(
        onTap: onTap,
        tint: statusColor,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: context.dashSpacing * 2.3,
              height: context.dashSpacing * 2.3,
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(Icons.assignment_outlined, color: statusColor),
            ),
            SizedBox(width: context.dashSpacing * 0.65),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    plan.title,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.2),
                  Text(
                    plan.patientName,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.35),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      DashboardPriorityBadge(label: plan.statusLabel),
                      Text(
                        '${formatDashboardDate(plan.startDate)} → ${formatDashboardDate(plan.endDate)}',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: DashboardColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: DashboardColors.textMuted,
            ),
          ],
        ),
      ),
    );
  }
}

class TreatmentPlanFilterChips extends StatelessWidget {
  const TreatmentPlanFilterChips({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final TreatmentPlanListFilter selected;
  final ValueChanged<TreatmentPlanListFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return SizedBox(
      height: context.dashSpacing * 2.1,
      child: ListView.separated(
        primary: false,
        scrollDirection: Axis.horizontal,
        itemCount: TreatmentPlanListFilter.values.length,
        separatorBuilder: (_, __) => SizedBox(width: context.dashSpacing * 0.4),
        itemBuilder: (context, index) {
          final filter = TreatmentPlanListFilter.values[index];
          final isSelected = selected == filter;
          return InkWell(
            onTap: () => onChanged(filter),
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: EdgeInsets.symmetric(
                horizontal: context.dashSpacing * 0.65,
                vertical: context.dashSpacing * 0.45,
              ),
              decoration: BoxDecoration(
                color: isSelected
                    ? DashboardColors.brandSoft
                    : DashboardColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected
                      ? DashboardColors.brandCyan
                      : DashboardColors.border,
                ),
              ),
              child: Text(
                localizedTreatmentPlanFilter(l10n, filter),
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: isSelected
                      ? DashboardColors.brandCyan
                      : DashboardColors.textSecondary,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
