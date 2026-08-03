import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../dashboard/widgets/admin_ui_components.dart';
import '../../dashboard/widgets/dashboard_layout.dart';
import '../models/admin_case_inbox_models.dart';
import 'case_request_status_chip.dart';

class AdminCaseInboxCard extends StatelessWidget {
  const AdminCaseInboxCard({
    super.key,
    required this.item,
    required this.onTap,
  });

  final AdminCaseInboxItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final parentName = item.parent?.fullName?.trim();
    final categoryName = item.category?.name.trim();
    final specialistName = item.assignedSpecialist?.fullName?.trim();
    final submittedLabel = item.submittedAt != null
        ? DateFormat('MMM d, yyyy').format(item.submittedAt!)
        : 'Date unavailable';

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.65),
      child: AdminSurfaceCard(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    item.childName.isNotEmpty
                        ? item.childName
                        : 'Unnamed child',
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: DashboardColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                SizedBox(width: context.dashSpacing * 0.4),
                Flexible(
                  child: Align(
                    alignment: Alignment.topRight,
                    child: CaseRequestStatusChip(status: item.status),
                  ),
                ),
              ],
            ),
            if (parentName != null && parentName.isNotEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.3),
              Text(
                parentName,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            if (categoryName != null && categoryName.isNotEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.2),
              Text(
                categoryName,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            SizedBox(height: context.dashSpacing * 0.35),
            Wrap(
              spacing: 12,
              runSpacing: 6,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                _MetaChip(
                  icon: Icons.event_outlined,
                  label: 'Submitted $submittedLabel',
                ),
                _MetaChip(
                  icon: Icons.attach_file_rounded,
                  label: item.attachmentCount == 1
                      ? '1 attachment'
                      : '${item.attachmentCount} attachments',
                ),
              ],
            ),
            if (specialistName != null && specialistName.isNotEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.4),
              Row(
                children: [
                  Icon(
                    Icons.medical_services_outlined,
                    size: 16,
                    color: DashboardColors.brandCyan,
                  ),
                  SizedBox(width: context.dashSpacing * 0.25),
                  Expanded(
                    child: Text(
                      specialistName,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: DashboardColors.textMuted),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: DashboardColors.textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
