import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/dashboard_colors.dart';
import '../../models/specialist_reports_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/dashboard_visuals.dart';
import 'manage_goals_widgets.dart';

String _reportDateLabel(DateTime? date) {
  if (date == null) {
    return '—';
  }
  return DateFormat('MMM d, yyyy').format(date);
}

String _nonEmptyLabel(String? value, {String fallback = '—'}) {
  final trimmed = value?.trim();
  if (trimmed == null || trimmed.isEmpty) {
    return fallback;
  }
  return trimmed;
}

class SpecialistReportFilterChips extends StatelessWidget {
  const SpecialistReportFilterChips({
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

class SpecialistReportCard extends StatelessWidget {
  const SpecialistReportCard({
    super.key,
    required this.report,
    required this.onTap,
  });

  final SpecialistReportListItem report;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateLabel = _reportDateLabel(report.createdAt);

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
                    report.patientName ?? 'Patient',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.15),
                  Text(
                    _nonEmptyLabel(report.title, fallback: 'Report'),
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.25),
                  Text(
                    '${report.typeLabel} • $dateLabel',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: DashboardColors.textMuted,
                    ),
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
                  if (report.hasPdf) ...[
                    SizedBox(height: context.dashSpacing * 0.35),
                    DashboardPriorityBadge(label: report.statusLabel),
                  ],
                ],
              ),
            ),
            SizedBox(width: context.dashSpacing * 0.25),
            Icon(
              Icons.chevron_right_rounded,
              color: DashboardColors.textMuted,
            ),
          ],
        ),
      ),
    );
  }
}

class SpecialistReportHeaderCard extends StatelessWidget {
  const SpecialistReportHeaderCard({super.key, required this.detail});

  final SpecialistReportDetail detail;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateLabel = _reportDateLabel(detail.createdAt);
    final periodStart = detail.periodStart;
    final periodEnd = detail.periodEnd;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DashboardProfileAvatar(
                initials: dashboardInitials(detail.patientName, fallback: 'P'),
                radius: context.dashSpacing * 0.75,
              ),
              SizedBox(width: context.dashSpacing * 0.65),
              Expanded(
                child: Text(
                  detail.patientName ?? 'Patient',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Text(
            _nonEmptyLabel(detail.title, fallback: 'Report'),
            style: theme.textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            '${detail.typeLabel} • $dateLabel',
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
          if (periodStart != null && periodEnd != null) ...[
            SizedBox(height: context.dashSpacing * 0.25),
            Text(
              'Period: ${_reportDateLabel(periodStart)} – ${_reportDateLabel(periodEnd)}',
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

class SpecialistReportInformationCard extends StatelessWidget {
  const SpecialistReportInformationCard({super.key, required this.detail});

  final SpecialistReportDetail detail;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateLabel = _reportDateLabel(detail.createdAt);
    final specialistLabel = detail.isAiReport
        ? '—'
        : _nonEmptyLabel(detail.specialistName);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Report Information',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          _ReportInfoRow(
            label: 'Patient',
            value: detail.patientName ?? '—',
          ),
          _ReportInfoRow(
            label: 'Specialist',
            value: specialistLabel,
          ),
          _ReportInfoRow(
            label: 'Report Type',
            value: detail.typeLabel,
          ),
          _ReportInfoRow(
            label: 'Created Date',
            value: dateLabel,
          ),
          if (detail.hasPdf)
            Padding(
              padding: EdgeInsets.only(top: context.dashSpacing * 0.15),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Status',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textMuted,
                      ),
                    ),
                  ),
                  DashboardPriorityBadge(label: detail.statusLabel),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _ReportInfoRow extends StatelessWidget {
  const _ReportInfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textMuted,
                  ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: DashboardColors.textPrimary,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class SpecialistReportSectionCard extends StatelessWidget {
  const SpecialistReportSectionCard({
    super.key,
    required this.section,
  });

  final SpecialistReportSection section;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            section.title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.45),
          Text(
            section.content,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class SpecialistReportAttachmentCard extends StatelessWidget {
  const SpecialistReportAttachmentCard({super.key, required this.pdfUrl});

  final String pdfUrl;

  @override
  Widget build(BuildContext context) {
    final resolved = ApiConstants.resolveMediaUrl(pdfUrl) ?? pdfUrl;

    return DashboardSurfaceCard(
      child: Row(
        children: [
          Icon(
            Icons.picture_as_pdf_outlined,
            color: DashboardColors.primary,
            size: context.dashSpacing * 0.65,
          ),
          SizedBox(width: context.dashSpacing * 0.5),
          Expanded(
            child: Text(
              resolved,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

Widget buildReportSearchField({
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
