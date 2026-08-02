import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/specialist_feature_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import 'manage_goals_widgets.dart';

class SessionFilterChips extends StatelessWidget {
  const SessionFilterChips({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final SessionListFilter selected;
  final ValueChanged<SessionListFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: SessionListFilter.values.map((filter) {
          final isSelected = selected == filter;
          return Padding(
            padding: EdgeInsets.only(right: context.dashSpacing * 0.4),
            child: InkWell(
              onTap: () => onChanged(filter),
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: context.dashSpacing * 0.65,
                  vertical: context.dashSpacing * 0.45,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? DashboardColors.brandSoft
                      : DashboardColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected
                        ? DashboardColors.brandCyan
                        : DashboardColors.border,
                  ),
                ),
                child: Text(
                  filter.label,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: isSelected
                            ? DashboardColors.brandCyan
                            : DashboardColors.textSecondary,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class SessionStatusBadge extends StatelessWidget {
  const SessionStatusBadge({super.key, required this.status});

  final SessionDisplayStatus status;

  Color get _color => switch (status) {
        SessionDisplayStatus.scheduled => const Color(0xFF00A884),
        SessionDisplayStatus.completed => DashboardColors.success,
        SessionDisplayStatus.cancelled => DashboardColors.highPriority,
        SessionDisplayStatus.noShow => const Color(0xFFC62828),
      };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.45,
        vertical: context.dashSpacing * 0.15,
      ),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: _color,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class SpecialistSessionCard extends StatelessWidget {
  const SpecialistSessionCard({
    super.key,
    required this.session,
    required this.onTap,
  });

  final SpecialistSessionDetail session;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateLabel = session.scheduledAt != null
        ? DateFormat('MMM d, yyyy').format(session.scheduledAt!)
        : '—';

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
      child: DashboardSurfaceCard(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  backgroundColor: DashboardColors.blueSoft,
                  child: Text(
                    dashboardAvatarLetter(session.patientName),
                    style: TextStyle(
                      color: const Color(0xFF3B82F6),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                SizedBox(width: context.dashSpacing * 0.65),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        session.patientName,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: DashboardColors.textPrimary,
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.15),
                      Text(
                        session.sessionType,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: DashboardColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                SessionStatusBadge(status: session.displayStatus),
              ],
            ),
            SizedBox(height: context.dashSpacing * 0.55),
            _SessionInfoRow(
              icon: Icons.calendar_today_outlined,
              label: 'Date',
              value: dateLabel,
            ),
            SizedBox(height: context.dashSpacing * 0.25),
            _SessionInfoRow(
              icon: Icons.schedule_rounded,
              label: 'Time',
              value: session.timeLabel,
            ),
            if (session.location != null && session.location!.isNotEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.25),
              _SessionInfoRow(
                icon: Icons.location_on_outlined,
                label: 'Location',
                value: session.location!,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SessionInfoRow extends StatelessWidget {
  const _SessionInfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: context.dashSpacing * 0.5, color: DashboardColors.textMuted),
        SizedBox(width: context.dashSpacing * 0.35),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                    height: 1.35,
                  ),
              children: [
                TextSpan(
                  text: '$label: ',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                TextSpan(text: value),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

Widget buildSessionSearchField({
  required TextEditingController controller,
  required ValueChanged<String> onChanged,
}) {
  return TextField(
    controller: controller,
    onChanged: onChanged,
    decoration: goalFieldDecoration('Search by patient name').copyWith(
      prefixIcon: const Icon(Icons.search_rounded, color: DashboardColors.textMuted),
    ),
  );
}
