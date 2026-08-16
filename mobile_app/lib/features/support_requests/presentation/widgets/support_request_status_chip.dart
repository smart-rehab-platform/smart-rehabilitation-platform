import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/support_request_models.dart';
import '../support_request_localization_utils.dart';

class SupportRequestStatusChip extends StatelessWidget {
  const SupportRequestStatusChip({super.key, required this.status});

  final SupportRequestStatus status;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final Color color = switch (status) {
      SupportRequestStatus.pending => DashboardColors.warning,
      SupportRequestStatus.inProgress => DashboardColors.brandCyan,
      SupportRequestStatus.resolved => DashboardColors.success,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        localizedSupportRequestStatusLabel(l10n, status),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}
