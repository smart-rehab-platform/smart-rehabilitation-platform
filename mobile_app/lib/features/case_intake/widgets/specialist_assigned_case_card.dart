import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../dashboard/widgets/dashboard_layout.dart';
import '../../dashboard/widgets/dashboard_surface_card.dart';
import '../models/specialist_assigned_case_models.dart';
import 'case_request_status_chip.dart';

class SpecialistAssignedCaseCard extends StatelessWidget {
  const SpecialistAssignedCaseCard({
    super.key,
    required this.item,
    required this.onTap,
  });

  final SpecialistAssignedCaseItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final parentName = item.parent?.fullName?.trim();
    final categoryName = item.category?.name.trim();
    final assignedSource = item.assignedAt ?? item.submittedAt;
    final assignedLabel = assignedSource != null
        ? DateFormat('MMM d, yyyy').format(assignedSource)
        : 'Date unavailable';
    final assignedPrefix = item.assignedAt != null ? 'Assigned' : 'Submitted';

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.65),
      child: DashboardSurfaceCard(
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
            SizedBox(height: context.dashSpacing * 0.4),
            Wrap(
              spacing: 12,
              runSpacing: 6,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                _MetaChip(
                  icon: Icons.event_outlined,
                  label: '$assignedPrefix $assignedLabel',
                ),
                _MetaChip(
                  icon: Icons.attach_file_rounded,
                  label: item.attachmentCount == 1
                      ? '1 attachment'
                      : '${item.attachmentCount} attachments',
                ),
                if (item.hasConversation)
                  const _MetaChip(
                    icon: Icons.forum_outlined,
                    label: 'Conversation available',
                  ),
              ],
            ),
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
