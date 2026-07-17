import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/specialist_reports_models.dart';
import '../../providers/specialist_reports_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/dashboard_visuals.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../specialist/manage_goals_widgets.dart';

String reportDateLabel(DateTime? date) {
  if (date == null) {
    return '—';
  }
  return DateFormat('MMM d, yyyy').format(date);
}

class ReportFilterChips extends StatelessWidget {
  const ReportFilterChips({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final SpecialistReportFilter selected;
  final ValueChanged<SpecialistReportFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: context.dashSpacing * 2.1,
      child: ListView.separated(
        primary: false,
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.zero,
        itemCount: SpecialistReportFilter.values.length,
        separatorBuilder: (_, __) =>
            SizedBox(width: context.dashSpacing * 0.4),
        itemBuilder: (context, index) {
          final filter = SpecialistReportFilter.values[index];
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
                    ? DashboardColors.purpleSoft
                    : DashboardColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected
                      ? DashboardColors.primary
                      : DashboardColors.border,
                ),
              ),
              child: Text(
                filter.label,
                maxLines: 1,
                softWrap: false,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: isSelected
                          ? DashboardColors.primary
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

class ReportListCard extends StatelessWidget {
  const ReportListCard({
    super.key,
    required this.report,
    required this.onTap,
  });

  final SpecialistReportListItem report;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateLabel = reportDateLabel(report.createdAt);

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
      child: DashboardSurfaceCard(
        onTap: onTap,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DashboardProfileAvatar(
              initials: dashboardInitials(report.patientName, fallback: 'P'),
              radius: context.dashSpacing * 0.65,
            ),
            SizedBox(width: context.dashSpacing * 0.65),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    report.displayTitle,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.15),
                  Text(
                    report.patientName ?? 'Patient',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.35),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      DashboardPriorityBadge(label: report.typeBadgeLabel),
                      if (report.isAiReport)
                        const DashboardPriorityBadge(label: 'AI'),
                      if (report.hasPdf)
                        DashboardPriorityBadge(label: report.statusLabel),
                      Text(
                        dateLabel,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: DashboardColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                  if (report.preview.isNotEmpty) ...[
                    SizedBox(height: context.dashSpacing * 0.35),
                    Text(
                      report.preview,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                        height: 1.35,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            SizedBox(width: context.dashSpacing * 0.25),
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

Widget buildSharedReportSearchField({
  required TextEditingController controller,
  required ValueChanged<String> onChanged,
}) {
  return TextField(
    controller: controller,
    onChanged: onChanged,
    decoration: goalFieldDecoration('Search by patient or title').copyWith(
      prefixIcon: const Icon(
        Icons.search_rounded,
        color: DashboardColors.textMuted,
      ),
    ),
  );
}

/// Shared reports list body used by Admin and Specialist screens.
class ReportsListBody extends ConsumerWidget {
  const ReportsListBody({
    super.key,
    required this.searchController,
    required this.onReportTap,
    this.refreshIndicatorColor = DashboardColors.primary,
    this.patientId,
  });

  final TextEditingController searchController;
  final void Function(BuildContext context, SpecialistReportListItem report)
      onReportTap;
  final Color refreshIndicatorColor;

  /// When set, only reports for this patient are loaded/shown.
  final String? patientId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(specialistReportsProvider(patientId));
    final notifier = ref.read(specialistReportsProvider(patientId).notifier);
    final visible = state.visibleReports;

    if (state.isLoading) {
      return const Center(child: DashboardLoadingCard());
    }

    if (state.errorMessage != null && state.reports.isEmpty) {
      return Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: notifier.refresh,
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: notifier.refresh,
      color: refreshIndicatorColor,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: context.dashPadding,
        children: [
          buildSharedReportSearchField(
            controller: searchController,
            onChanged: notifier.setSearchQuery,
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          ReportFilterChips(
            selected: state.filter,
            onChanged: notifier.setFilter,
          ),
          if (state.errorMessage != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: state.errorMessage!,
              onRetry: notifier.refresh,
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.75),
          if (state.reports.isEmpty)
            DashboardEmptyCard(
              message: patientId == null
                  ? 'No reports found.'
                  : 'No reports found for this patient.',
            )
          else if (visible.isEmpty)
            const DashboardEmptyCard(
              message: 'No reports match your search or filter.',
            )
          else
            ...visible.map(
              (report) => ReportListCard(
                report: report,
                onTap: () => onReportTap(context, report),
              ),
            ),
          SizedBox(height: context.dashSpacing),
        ],
      ),
    );
  }
}
