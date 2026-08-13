import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../data/admin_features_repository.dart';
import '../../widgets/admin_ui_components.dart';
import '../../widgets/dashboard_layout.dart';
import 'admin_audit_localization_utils.dart';

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

AuditActionPresentation auditActionPresentation(
  AppLocalizations l10n,
  String rawAction,
) {
  final key = rawAction.trim().toLowerCase();
  final title = localizedAuditActionTitle(l10n, rawAction);
  final category = resolveAuditActionCategory(key);
  final badgeLabel = localizedAuditActionBadgeLabel(l10n, category, rawAction);

  return switch (category) {
    AuditActionCategory.create => AuditActionPresentation(
      title: title,
      badgeLabel: badgeLabel,
      category: category,
      icon: Icons.add_circle_outline_rounded,
      color: DashboardColors.success,
      background: DashboardColors.tealSoft,
    ),
    AuditActionCategory.update => AuditActionPresentation(
      title: title,
      badgeLabel: badgeLabel,
      category: category,
      icon: Icons.edit_outlined,
      color: DashboardColors.brandCyan,
      background: DashboardColors.blueSoft,
    ),
    AuditActionCategory.complete => AuditActionPresentation(
      title: title,
      badgeLabel: badgeLabel,
      category: category,
      icon: Icons.check_circle_outline_rounded,
      color: DashboardColors.warning,
      background: DashboardColors.amberSoft,
    ),
    AuditActionCategory.delete => AuditActionPresentation(
      title: title,
      badgeLabel: badgeLabel,
      category: category,
      icon: Icons.delete_outline_rounded,
      color: DashboardColors.highPriority,
      background: DashboardColors.amberSoft,
    ),
    AuditActionCategory.assign => AuditActionPresentation(
      title: title,
      badgeLabel: badgeLabel,
      category: category,
      icon: Icons.person_add_alt_1_outlined,
      color: _assignPurple,
      background: _assignPurpleSoft,
    ),
    AuditActionCategory.login => AuditActionPresentation(
      title: title,
      badgeLabel: badgeLabel,
      category: category,
      icon: key.contains('logout') ? Icons.logout_rounded : Icons.login_rounded,
      color: DashboardColors.textSecondary,
      background: DashboardColors.purpleSoft,
    ),
    AuditActionCategory.cancel => AuditActionPresentation(
      title: title,
      badgeLabel: badgeLabel,
      category: category,
      icon: Icons.cancel_outlined,
      color: DashboardColors.warning,
      background: const Color(0xFFFFFBEB),
    ),
    AuditActionCategory.other => AuditActionPresentation(
      title: title,
      badgeLabel: badgeLabel,
      category: category,
      icon: Icons.history_rounded,
      color: DashboardColors.textSecondary,
      background: DashboardColors.purpleSoft,
    ),
  };
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
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final log = widget.log;
    final presentation = auditActionPresentation(l10n, log.action);
    final userName = (log.userName?.trim().isNotEmpty ?? false)
        ? log.userName!.trim()
        : l10n.adminAuditSystemUser;
    final userEmail = log.userEmail?.trim();
    final entityLabel = localizedAuditEntityLabel(l10n, log.entityName);
    final entityId = log.entityId?.trim();
    final hasReferenceId =
        entityId != null && entityId.isNotEmpty && looksLikeUuid(entityId);
    final humanReference =
        entityId != null && entityId.isNotEmpty && !looksLikeUuid(entityId)
        ? entityId
        : null;
    final createdAt = log.createdAt?.toLocal();
    final dateLabel = createdAt == null
        ? l10n.adminAuditUnknownDate
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
                          color: DashboardColors.textPrimary,
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
                          color: DashboardColors.textPrimary,
                        ),
                      ),
                      if (userEmail != null && userEmail.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          userEmail,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
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
                _AuditMetaChip(icon: Icons.schedule_rounded, label: timeLabel),
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
                    l10n.commonDetails,
                    style: theme.textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.brandCyan,
                    ),
                  ),
                  trailing: Icon(
                    _detailsExpanded
                        ? Icons.expand_less_rounded
                        : Icons.expand_more_rounded,
                    color: DashboardColors.brandCyan,
                  ),
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: DashboardColors.purpleSoft,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: DashboardColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.adminAuditReferenceId,
                            style: theme.textTheme.labelSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: DashboardColors.textMuted,
                              letterSpacing: 0.2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          SelectableText(
                            entityId,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: DashboardColors.textSecondary,
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
        border: Border.all(color: presentation.color.withValues(alpha: 0.28)),
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
    final l10n = AppLocalizations.of(context)!;
    final initials = dashboardInitials(
      name,
      fallback: l10n.adminAuditSystemUserInitials,
    );

    return Container(
      width: 40,
      height: 40,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: DashboardColors.blueSoft,
        shape: BoxShape.circle,
        border: Border.all(color: DashboardColors.border),
      ),
      child: Text(
        initials,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
          fontWeight: FontWeight.w700,
          color: DashboardColors.brandCyan,
        ),
      ),
    );
  }
}

class _AuditMetaChip extends StatelessWidget {
  const _AuditMetaChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: DashboardColors.purpleSoft,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: DashboardColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: DashboardColors.textMuted),
          const SizedBox(width: 6),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 180),
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: DashboardColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
