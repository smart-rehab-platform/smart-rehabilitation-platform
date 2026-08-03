import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../l10n/app_localizations.dart';
import '../presentation/admin/admin_scoped_localization_utils.dart';

class AdminStatusBadge extends StatelessWidget {
  const AdminStatusBadge({super.key, required this.label, required this.color});

  final String label;
  final Color color;

  factory AdminStatusBadge.sessionStatus(
    BuildContext context,
    String? status, {
    bool isPastScheduled = false,
  }) {
    final l10n = AppLocalizations.of(context)!;
    final normalized = (status ?? 'unknown').toLowerCase();
    final label = localizedAdminSessionStatus(
      l10n,
      status,
      isPastScheduled: isPastScheduled,
    );

    switch (normalized) {
      case 'completed':
        return AdminStatusBadge(label: label, color: DashboardColors.success);
      case 'cancelled':
        return AdminStatusBadge(
          label: label,
          color: DashboardColors.highPriority,
        );
      case 'no_show':
        return AdminStatusBadge(label: label, color: DashboardColors.warning);
      case 'scheduled':
        return AdminStatusBadge(
          label: label,
          color: isPastScheduled
              ? DashboardColors.warning
              : DashboardColors.brandCyan,
        );
      case 'pending':
        return AdminStatusBadge(label: label, color: DashboardColors.warning);
      case 'inactive':
      case 'disabled':
        return AdminStatusBadge(label: label, color: DashboardColors.textMuted);
      default:
        return AdminStatusBadge(label: label, color: DashboardColors.textMuted);
    }
  }

  factory AdminStatusBadge.pending(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return AdminStatusBadge(
      label: l10n.statusPending,
      color: DashboardColors.warning,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        softWrap: true,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}
