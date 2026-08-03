import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../l10n/app_localizations.dart';
import '../../dashboard/widgets/dashboard_layout.dart';
import '../../dashboard/widgets/dashboard_surface_card.dart';
import '../models/case_intake_request_model.dart';
import '../presentation/parent_case_intake_localization_utils.dart';
import 'case_request_status_chip.dart';

class CaseRequestCard extends StatelessWidget {
  const CaseRequestCard({
    super.key,
    required this.request,
    required this.onTap,
  });

  final CaseIntakeRequest request;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final submittedLabel = request.submittedAt != null
        ? DateFormat('MMM d, yyyy').format(request.submittedAt!)
        : l10n.parentCaseRequestsDateUnavailable;
    final specialistName = request.assignedSpecialist?.fullName?.trim();
    final statusLabel = localizedCaseIntakeStatusLabel(l10n, request.status);

    return DashboardSurfaceCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  request.childName,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: DashboardColors.textPrimary,
                  ),
                ),
              ),
              CaseRequestStatusChip(status: request.status, label: statusLabel),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          if (request.category?.name != null &&
              request.category!.name.isNotEmpty)
            Text(
              request.category!.name,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          SizedBox(height: context.dashSpacing * 0.25),
          Row(
            children: [
              Icon(
                Icons.event_outlined,
                size: 14,
                color: DashboardColors.textMuted,
              ),
              SizedBox(width: context.dashSpacing * 0.12),
              Text(
                l10n.parentDashboardCaseSubmittedOn(submittedLabel),
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textSecondary,
                ),
              ),
            ],
          ),
          if (specialistName != null && specialistName.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Row(
              children: [
                Icon(
                  Icons.medical_services_outlined,
                  size: 14,
                  color: DashboardColors.brandCyan,
                ),
                SizedBox(width: context.dashSpacing * 0.12),
                Expanded(
                  child: Text(
                    specialistName,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ],
          if (request.status != null) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              localizedCaseIntakeStatusSubtitle(l10n, request.status!),
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
