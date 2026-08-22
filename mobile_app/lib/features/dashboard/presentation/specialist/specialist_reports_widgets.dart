import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_reports_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../shared/reports_list_widgets.dart';

export '../shared/reports_list_widgets.dart'
    show
        ReportFilterChips,
        ReportListCard,
        ReportsListBody,
        buildSharedReportSearchField,
        reportDateLabel;

/// Backward-compatible aliases for existing specialist imports.
typedef SpecialistReportFilterChips = ReportFilterChips;
typedef SpecialistReportCard = ReportListCard;

Widget buildReportSearchField({
  required BuildContext context,
  required TextEditingController controller,
  required ValueChanged<String> onChanged,
}) {
  return buildSharedReportSearchField(
    context: context,
    controller: controller,
    onChanged: onChanged,
  );
}

String _nonEmptyLabel(String? value, {String fallback = '—'}) {
  final trimmed = value?.trim();
  if (trimmed == null || trimmed.isEmpty) {
    return fallback;
  }
  return trimmed;
}

class SpecialistReportHeaderCard extends StatelessWidget {
  const SpecialistReportHeaderCard({super.key, required this.detail});

  final SpecialistReportDetail detail;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final dateLabel = reportDateLabel(detail.createdAt);
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
            detail.displayTitle,
            style: theme.textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              _MetaChip(label: detail.typeLabel),
              if (detail.isAiReport) const _MetaChip(label: 'AI'),
              if (detail.hasPdf)
                _MetaChip(label: l10n.specialistReportStatusPdfReady)
              else if (detail.isAwaitingReview)
                _MetaChip(label: l10n.specialistReportStatusAwaitingReview),
              Text(
                dateLabel,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
              ),
            ],
          ),
          if (detail.isAwaitingReview) ...[
            SizedBox(height: context.dashSpacing * 0.45),
            Text(
              l10n.specialistReportReviewBanner,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                height: 1.35,
              ),
            ),
          ],
          if (periodStart != null && periodEnd != null) ...[
            SizedBox(height: context.dashSpacing * 0.25),
            Text(
              'Period: ${reportDateLabel(periodStart)} – ${reportDateLabel(periodEnd)}',
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
    final l10n = AppLocalizations.of(context)!;
    final dateLabel = reportDateLabel(detail.createdAt);
    final specialistLabel = _nonEmptyLabel(detail.specialistName);
    final statusLabel = detail.hasPdf
        ? l10n.specialistReportStatusPdfReady
        : detail.isAwaitingReview
            ? l10n.specialistReportStatusAwaitingReview
            : null;

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
          _ReportInfoRow(label: 'Patient', value: detail.patientName ?? '—'),
          _ReportInfoRow(label: 'Specialist', value: specialistLabel),
          _ReportInfoRow(label: 'Report Type', value: detail.typeLabel),
          _ReportInfoRow(label: 'Created Date', value: dateLabel),
          if (statusLabel != null)
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
                  _MetaChip(label: statusLabel),
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
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: DashboardColors.textMuted),
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
    this.textDirection,
  });

  final SpecialistReportSection section;
  final TextDirection? textDirection;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final content = Column(
      crossAxisAlignment: textDirection == TextDirection.rtl
          ? CrossAxisAlignment.end
          : CrossAxisAlignment.start,
      children: [
        Text(
          section.title,
          textAlign: textDirection == TextDirection.rtl
              ? TextAlign.right
              : TextAlign.left,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w700,
            color: DashboardColors.textPrimary,
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.45),
        Text(
          section.content,
          textAlign: textDirection == TextDirection.rtl
              ? TextAlign.right
              : TextAlign.left,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: DashboardColors.textSecondary,
            height: 1.45,
          ),
        ),
      ],
    );

    return DashboardSurfaceCard(
      child: textDirection == null
          ? content
          : Directionality(
              textDirection: textDirection!,
              child: content,
            ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: DashboardColors.brandSoft,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: DashboardColors.border),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: DashboardColors.brandCyan,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
