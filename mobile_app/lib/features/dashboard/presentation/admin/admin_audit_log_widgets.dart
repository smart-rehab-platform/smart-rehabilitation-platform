import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/admin_dashboard_colors.dart';
import '../../data/admin_features_repository.dart';
import '../../widgets/admin_ui_components.dart';
import '../../widgets/dashboard_layout.dart';

/// Semantic category used for badge color and icon.
enum AuditActionCategory {
  create,
  update,
  complete,
  delete,
  assign,
  login,
  cancel,
  other,
}

class AuditActionPresentation {
  const AuditActionPresentation({
    required this.title,
    required this.badgeLabel,
    required this.category,
    required this.icon,
    required this.color,
    required this.background,
  });

  final String title;
  final String badgeLabel;
  final AuditActionCategory category;
  final IconData icon;
  final Color color;
  final Color background;
}

const _assignPurple = Color(0xFF7C3AED);
const _assignPurpleSoft = Color(0xFFF5F3FF);

/// Known action → friendly title. Filters still use raw backend values.
const Map<String, String> _auditActionTitles = {
  'session_complete': 'Session Completed',
  'session_cancel': 'Session Cancelled',
  'session_create': 'Session Created',
  'session_update': 'Session Updated',
  'session_delete': 'Session Deleted',
  'session_no_show': 'Session Marked No Show',
  'patient_create': 'Patient Created',
  'patient_update': 'Patient Updated',
  'patient_delete': 'Patient Deleted',
  'treatment_plan_create': 'Treatment Plan Created',
  'treatment_plan_created': 'Treatment Plan Created',
  'goal_add': 'Goal Added',
  'goal_added': 'Goal Added',
  'goal_create': 'Goal Added',
  'exercise_assign': 'Exercise Assigned',
  'exercise_assigned': 'Exercise Assigned',
  'parent_link': 'Parent Linked',
  'parent_linked': 'Parent Linked',
  'specialist_assign': 'Specialist Assigned',
  'specialist_assigned': 'Specialist Assigned',
  'login': 'Login',
  'logout': 'Logout',
  'user_create': 'User Created',
  'user_update': 'User Updated',
  'user_delete': 'User Deleted',
  'case_category_create': 'Case Category Created',
  'case_category_update': 'Case Category Updated',
  'specialist_case_categories_update': 'Specialist Categories Updated',
  'case_intake_request_create': 'Case Request Created',
  'case_intake_request_update': 'Case Request Updated',
  'case_intake_attachment_add': 'Attachment Added',
  'case_intake_attachment_delete': 'Attachment Deleted',
  'case_intake_request_assign': 'Case Request Assigned',
  'case_intake_assessment_start': 'Assessment Started',
  'case_intake_assessment_notes_update': 'Assessment Notes Updated',
  'case_intake_request_accept': 'Case Request Accepted',
  'case_intake_request_reject': 'Case Request Rejected',
  'case_intake_request_convert': 'Case Converted to Patient',
};

const Map<String, String> _entityLabels = {
  'session': 'Session',
  'sessions': 'Session',
  'patient': 'Patient',
  'patients': 'Patient',
  'user': 'User',
  'users': 'User',
  'goal': 'Goal',
  'goals': 'Goal',
  'exercise': 'Exercise',
  'exercises': 'Exercise',
  'treatment_plan': 'Treatment Plan',
  'report': 'Report',
  'reports': 'Report',
  'case_intake_request': 'Case Request',
  'case_category': 'Case Category',
  'parent': 'Parent',
  'specialist': 'Specialist',
};

String formatAuditActionTitle(String rawAction) {
  final key = rawAction.trim().toLowerCase();
  if (key.isEmpty) {
    return 'Activity';
  }

  final mapped = _auditActionTitles[key];
  if (mapped != null) {
    return mapped;
  }

  return key
      .split(RegExp(r'[_\s-]+'))
      .where((part) => part.isNotEmpty)
      .map((part) => '${part[0].toUpperCase()}${part.substring(1)}')
      .join(' ');
}

String formatAuditEntityLabel(String? entityName) {
  final key = entityName?.trim().toLowerCase() ?? '';
  if (key.isEmpty) {
    return 'System';
  }
  return _entityLabels[key] ??
      key
          .split(RegExp(r'[_\s-]+'))
          .where((part) => part.isNotEmpty)
          .map((part) => '${part[0].toUpperCase()}${part.substring(1)}')
          .join(' ');
}

bool looksLikeUuid(String? value) {
  if (value == null) {
    return false;
  }
  final trimmed = value.trim();
  return RegExp(
    r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
  ).hasMatch(trimmed);
}

AuditActionPresentation auditActionPresentation(String rawAction) {
  final key = rawAction.trim().toLowerCase();
  final title = formatAuditActionTitle(rawAction);
  final category = _resolveCategory(key);

  return switch (category) {
    AuditActionCategory.create => AuditActionPresentation(
        title: title,
        badgeLabel: 'Create',
        category: category,
        icon: Icons.add_circle_outline_rounded,
        color: AdminDashboardColors.success,
        background: AdminDashboardColors.emeraldSoft,
      ),
    AuditActionCategory.update => AuditActionPresentation(
        title: title,
        badgeLabel: 'Update',
        category: category,
        icon: Icons.edit_outlined,
        color: AdminDashboardColors.primary,
        background: AdminDashboardColors.blueSoft,
      ),
    AuditActionCategory.complete => AuditActionPresentation(
        title: title,
        badgeLabel: 'Complete',
        category: category,
        icon: Icons.check_circle_outline_rounded,
        color: AdminDashboardColors.orange,
        background: AdminDashboardColors.orangeSoft,
      ),
    AuditActionCategory.delete => AuditActionPresentation(
        title: title,
        badgeLabel: 'Delete',
        category: category,
        icon: Icons.delete_outline_rounded,
        color: AdminDashboardColors.danger,
        background: AdminDashboardColors.redSoft,
      ),
    AuditActionCategory.assign => AuditActionPresentation(
        title: title,
        badgeLabel: 'Assign',
        category: category,
        icon: Icons.person_add_alt_1_outlined,
        color: _assignPurple,
        background: _assignPurpleSoft,
      ),
    AuditActionCategory.login => AuditActionPresentation(
        title: title,
        badgeLabel: key.contains('logout') ? 'Logout' : 'Login',
        category: category,
        icon: key.contains('logout')
            ? Icons.logout_rounded
            : Icons.login_rounded,
        color: AdminDashboardColors.textSecondary,
        background: AdminDashboardColors.slateSoft,
      ),
    AuditActionCategory.cancel => AuditActionPresentation(
        title: title,
        badgeLabel: 'Cancel',
        category: category,
        icon: Icons.cancel_outlined,
        color: AdminDashboardColors.warning,
        background: const Color(0xFFFFFBEB),
      ),
    AuditActionCategory.other => AuditActionPresentation(
        title: title,
        badgeLabel: 'Activity',
        category: category,
        icon: Icons.history_rounded,
        color: AdminDashboardColors.textSecondary,
        background: AdminDashboardColors.slateSoft,
      ),
  };
}

AuditActionCategory _resolveCategory(String key) {
  if (key == 'login' || key == 'logout' || key.endsWith('_login')) {
    return AuditActionCategory.login;
  }
  if (key.contains('cancel') || key.contains('reject') || key.contains('no_show')) {
    return AuditActionCategory.cancel;
  }
  if (key.contains('complete') || key.contains('accept') || key.contains('convert')) {
    return AuditActionCategory.complete;
  }
  if (key.contains('delete') || key.contains('remove') || key.contains('unlink')) {
    return AuditActionCategory.delete;
  }
  if (key.contains('assign') ||
      key.contains('link') ||
      key.contains('attach')) {
    return AuditActionCategory.assign;
  }
  if (key.contains('create') ||
      key.contains('add') ||
      key.endsWith('_start')) {
    return AuditActionCategory.create;
  }
  if (key.contains('update') ||
      key.contains('edit') ||
      key.contains('change')) {
    return AuditActionCategory.update;
  }
  return AuditActionCategory.other;
}

class AdminAuditLogCard extends StatefulWidget {
  const AdminAuditLogCard({super.key, required this.log});

  final AdminAuditLogRecord log;

  @override
  State<AdminAuditLogCard> createState() => _AdminAuditLogCardState();
}

class _AdminAuditLogCardState extends State<AdminAuditLogCard> {
  bool _detailsExpanded = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final log = widget.log;
    final presentation = auditActionPresentation(log.action);
    final userName = (log.userName?.trim().isNotEmpty ?? false)
        ? log.userName!.trim()
        : 'System';
    final userEmail = log.userEmail?.trim();
    final entityLabel = formatAuditEntityLabel(log.entityName);
    final entityId = log.entityId?.trim();
    final hasReferenceId =
        entityId != null && entityId.isNotEmpty && looksLikeUuid(entityId);
    final humanReference = entityId != null &&
            entityId.isNotEmpty &&
            !looksLikeUuid(entityId)
        ? entityId
        : null;
    final createdAt = log.createdAt?.toLocal();
    final dateLabel = createdAt == null
        ? 'Unknown date'
        : DateFormat('MMM d, yyyy').format(createdAt);
    final timeLabel = createdAt == null
        ? '—'
        : DateFormat('h:mm a').format(createdAt);

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.65),
      child: AdminSurfaceCard(
        tint: presentation.color,
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AdminIconCircle(
                  icon: presentation.icon,
                  color: presentation.color,
                  background: presentation.background,
                  size: 44,
                ),
                SizedBox(width: context.dashSpacing * 0.7),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        presentation.title,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AdminDashboardColors.textPrimary,
                          height: 1.25,
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.35),
                      _AuditActionBadge(presentation: presentation),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: context.dashSpacing * 0.85),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _AuditUserAvatar(name: userName),
                SizedBox(width: context.dashSpacing * 0.6),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        userName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AdminDashboardColors.textPrimary,
                        ),
                      ),
                      if (userEmail != null && userEmail.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          userEmail,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AdminDashboardColors.textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                _AuditMetaChip(
                  icon: Icons.category_outlined,
                  label: entityLabel,
                ),
                if (humanReference != null)
                  _AuditMetaChip(
                    icon: Icons.label_outline_rounded,
                    label: humanReference,
                  ),
                _AuditMetaChip(
                  icon: Icons.calendar_today_outlined,
                  label: dateLabel,
                ),
                _AuditMetaChip(
                  icon: Icons.schedule_rounded,
                  label: timeLabel,
                ),
              ],
            ),
            if (hasReferenceId) ...[
              SizedBox(height: context.dashSpacing * 0.35),
              Theme(
                data: theme.copyWith(dividerColor: Colors.transparent),
                child: ExpansionTile(
                  tilePadding: EdgeInsets.zero,
                  childrenPadding: const EdgeInsets.only(bottom: 4),
                  initiallyExpanded: _detailsExpanded,
                  onExpansionChanged: (expanded) {
                    setState(() => _detailsExpanded = expanded);
                  },
                  title: Text(
                    'Details',
                    style: theme.textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AdminDashboardColors.primary,
                    ),
                  ),
                  trailing: Icon(
                    _detailsExpanded
                        ? Icons.expand_less_rounded
                        : Icons.expand_more_rounded,
                    color: AdminDashboardColors.primary,
                  ),
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AdminDashboardColors.slateSoft,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AdminDashboardColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Reference ID',
                            style: theme.textTheme.labelSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AdminDashboardColors.textMuted,
                              letterSpacing: 0.2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          SelectableText(
                            entityId,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: AdminDashboardColors.textSecondary,
                              fontFamily: 'monospace',
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _AuditActionBadge extends StatelessWidget {
  const _AuditActionBadge({required this.presentation});

  final AuditActionPresentation presentation;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: presentation.background,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: presentation.color.withValues(alpha: 0.28),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(presentation.icon, size: 14, color: presentation.color),
          const SizedBox(width: 6),
          Text(
            presentation.badgeLabel,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: presentation.color,
                ),
          ),
        ],
      ),
    );
  }
}

class _AuditUserAvatar extends StatelessWidget {
  const _AuditUserAvatar({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final initials = dashboardInitials(name, fallback: 'SY');

    return Container(
      width: 40,
      height: 40,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AdminDashboardColors.blueSoft,
        shape: BoxShape.circle,
        border: Border.all(color: AdminDashboardColors.border),
      ),
      child: Text(
        initials,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: AdminDashboardColors.primary,
            ),
      ),
    );
  }
}

class _AuditMetaChip extends StatelessWidget {
  const _AuditMetaChip({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AdminDashboardColors.slateSoft,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AdminDashboardColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AdminDashboardColors.textMuted),
          const SizedBox(width: 6),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 180),
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AdminDashboardColors.textSecondary,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
