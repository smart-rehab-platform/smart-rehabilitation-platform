import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_feature_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import 'specialist_scoped_localization_utils.dart';
import 'specialist_sessions_localization_utils.dart';
import 'specialist_sessions_widgets.dart';

enum SpecialistSessionsViewMode { calendar, list }

DateTime normalizeCalendarDate(DateTime date) =>
    DateTime(date.year, date.month, date.day);

DateTime startOfCalendarMonth(DateTime month) =>
    DateTime(month.year, month.month, 1);

DateTime calendarGridStart(DateTime month) {
  final first = startOfCalendarMonth(month);
  return first.subtract(Duration(days: first.weekday - DateTime.monday));
}

String calendarSessionModeLabel(SpecialistSessionDetail session) {
  if (session.hasOnlineMeetingLink) {
    return 'Online';
  }

  final location = session.location?.trim();
  if (location != null && location.isNotEmpty) {
    return location;
  }

  return 'In person';
}

class SpecialistSessionsViewModeTabs extends StatelessWidget {
  const SpecialistSessionsViewModeTabs({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final SpecialistSessionsViewMode selected;
  final ValueChanged<SpecialistSessionsViewMode> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Container(
      padding: EdgeInsets.all(context.dashSpacing * 0.18),
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: DashboardColors.border.withValues(alpha: 0.8),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: _ViewModeTabButton(
              label: l10n.filterCalendar,
              icon: Icons.calendar_month_outlined,
              isSelected: selected == SpecialistSessionsViewMode.calendar,
              onTap: () => onChanged(SpecialistSessionsViewMode.calendar),
            ),
          ),
          SizedBox(width: context.dashSpacing * 0.25),
          Expanded(
            child: _ViewModeTabButton(
              label: l10n.filterList,
              icon: Icons.view_list_rounded,
              isSelected: selected == SpecialistSessionsViewMode.list,
              onTap: () => onChanged(SpecialistSessionsViewMode.list),
            ),
          ),
        ],
      ),
    );
  }
}

class _ViewModeTabButton extends StatelessWidget {
  const _ViewModeTabButton({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      decoration: BoxDecoration(
        color: isSelected ? DashboardColors.brandSoft : Colors.transparent,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.45),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  size: 18,
                  color: isSelected
                      ? DashboardColors.brandCyan
                      : DashboardColors.textMuted,
                ),
                SizedBox(width: context.dashSpacing * 0.25),
                Text(
                  label,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: isSelected
                        ? DashboardColors.brandCyan
                        : DashboardColors.textSecondary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class SpecialistSessionsMonthCalendar extends StatelessWidget {
  const SpecialistSessionsMonthCalendar({
    super.key,
    required this.visibleMonth,
    required this.selectedDate,
    required this.sessions,
    required this.onMonthChanged,
    required this.onDateSelected,
  });

  final DateTime visibleMonth;
  final DateTime selectedDate;
  final List<SpecialistSessionDetail> sessions;
  final ValueChanged<DateTime> onMonthChanged;
  final ValueChanged<DateTime> onDateSelected;

  bool _hasSessionsOnDay(DateTime day) {
    return sessions.any((session) {
      final scheduledAt = session.scheduledAt;
      if (scheduledAt == null) {
        return false;
      }
      return scheduledAt.year == day.year &&
          scheduledAt.month == day.month &&
          scheduledAt.day == day.day;
    });
  }

  void _shiftMonth(int delta) {
    final next = DateTime(visibleMonth.year, visibleMonth.month + delta, 1);
    onMonthChanged(next);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final localeName = Localizations.localeOf(context).toLanguageTag();
    final today = normalizeCalendarDate(DateTime.now());
    final monthStart = startOfCalendarMonth(visibleMonth);
    final gridStart = calendarGridStart(visibleMonth);
    final weekdayLabels = List.generate(7, (index) {
      final day = gridStart.add(Duration(days: index));
      return DateFormat('EEE', localeName).format(day);
    });

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              IconButton(
                onPressed: () => _shiftMonth(-1),
                icon: const Icon(Icons.chevron_left_rounded),
                color: DashboardColors.brandCyan,
                visualDensity: VisualDensity.compact,
                tooltip: l10n.calendarPreviousMonth,
              ),
              Expanded(
                child: Text(
                  DateFormat('MMMM yyyy', localeName).format(monthStart),
                  textAlign: TextAlign.center,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: DashboardColors.textPrimary,
                  ),
                ),
              ),
              IconButton(
                onPressed: () => _shiftMonth(1),
                icon: const Icon(Icons.chevron_right_rounded),
                color: DashboardColors.brandCyan,
                visualDensity: VisualDensity.compact,
                tooltip: l10n.calendarNextMonth,
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Row(
            children: weekdayLabels
                .map(
                  (label) => Expanded(
                    child: Text(
                      label,
                      textAlign: TextAlign.center,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: DashboardColors.textMuted,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          LayoutBuilder(
            builder: (context, constraints) {
              final cellWidth = constraints.maxWidth / 7;
              final cellHeight = cellWidth.clamp(36.0, 48.0);

              return Column(
                children: List.generate(6, (weekIndex) {
                  return Row(
                    children: List.generate(7, (dayIndex) {
                      final day = gridStart.add(
                        Duration(days: weekIndex * 7 + dayIndex),
                      );
                      final normalizedDay = normalizeCalendarDate(day);
                      final inMonth = day.month == visibleMonth.month;
                      final isSelected = normalizedDay == selectedDate;
                      final isToday = normalizedDay == today;
                      final hasSessions = _hasSessionsOnDay(normalizedDay);

                      return SizedBox(
                        width: cellWidth,
                        height: cellHeight,
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: inMonth
                                ? () => onDateSelected(normalizedDay)
                                : null,
                            borderRadius: BorderRadius.circular(12),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 180),
                                  width: 32,
                                  height: 32,
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? DashboardColors.brandCyan
                                        : isToday
                                        ? DashboardColors.brandSoft
                                        : Colors.transparent,
                                    shape: BoxShape.circle,
                                    border: isToday && !isSelected
                                        ? Border.all(
                                            color: DashboardColors.brandCyan,
                                            width: 1.5,
                                          )
                                        : null,
                                  ),
                                  child: Text(
                                    '${day.day}',
                                    style: theme.textTheme.labelLarge?.copyWith(
                                      color: isSelected
                                          ? Colors.white
                                          : inMonth
                                          ? DashboardColors.textPrimary
                                          : DashboardColors.textMuted
                                                .withValues(alpha: 0.55),
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Container(
                                  width: 5,
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: hasSessions && inMonth
                                        ? DashboardColors.brandCyan
                                        : Colors.transparent,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }),
                  );
                }),
              );
            },
          ),
        ],
      ),
    );
  }
}

class SpecialistCalendarDaySessionsSection extends StatelessWidget {
  const SpecialistCalendarDaySessionsSection({
    super.key,
    required this.selectedDate,
    required this.sessions,
    required this.onSessionTap,
  });

  final DateTime selectedDate;
  final List<SpecialistSessionDetail> sessions;
  final ValueChanged<SpecialistSessionDetail> onSessionTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final localeName = Localizations.localeOf(context).toLanguageTag();
    final headerLabel = DateFormat(
      'EEEE, MMMM d',
      localeName,
    ).format(selectedDate);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          headerLabel,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w800,
            color: DashboardColors.textPrimary,
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.5),
        if (sessions.isEmpty)
          DashboardEmptyCard(message: l10n.specialistNoSessionsOnDate)
        else
          ...sessions.map(
            (session) => SpecialistCalendarSessionTile(
              session: session,
              onTap: session.id.isEmpty ? null : () => onSessionTap(session),
            ),
          ),
      ],
    );
  }
}

class SpecialistCalendarSessionTile extends StatelessWidget {
  const SpecialistCalendarSessionTile({
    super.key,
    required this.session,
    required this.onTap,
  });

  final SpecialistSessionDetail session;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final duration = session.durationMinutes ?? 45;
    final modeLabel = localizedCalendarSessionMode(l10n, session);

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.55),
      child: DashboardSurfaceCard(
        onTap: onTap,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            DashboardProfileAvatar(
              initials: dashboardInitials(session.patientName, fallback: 'PT'),
              imageUrl: session.patientProfileImageUrl,
              radius: 21,
            ),
            SizedBox(width: context.dashSpacing * 0.6),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          session.patientName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: DashboardColors.textPrimary,
                          ),
                        ),
                      ),
                      SessionStatusBadge(status: session.displayStatus),
                    ],
                  ),
                  SizedBox(height: context.dashSpacing * 0.12),
                  Text(
                    localizedSessionTypeLabel(l10n, session.sessionType),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.12),
                  Text(
                    l10n.specialistSessionCalendarTileMeta(
                      session.timeLabel,
                      duration,
                      modeLabel,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: DashboardColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: DashboardColors.textMuted),
          ],
        ),
      ),
    );
  }
}
