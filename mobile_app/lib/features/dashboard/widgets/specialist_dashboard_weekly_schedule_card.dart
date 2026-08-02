import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../models/specialist_feature_models.dart';
import '../utils/session_classification.dart';
import 'dashboard_layout.dart';
import 'dashboard_profile_avatar.dart';
import 'dashboard_surface_card.dart';

SpecialistSessionDetail? findNextUpcomingSession(
  List<SpecialistSessionDetail> sessions, {
  DateTime? now,
}) {
  final clock = now ?? DateTime.now();
  final upcoming = sessions.where((session) {
    if (session.scheduledAt == null) {
      return false;
    }

    final status = session.status?.toLowerCase().trim();
    if (status != null && status.isNotEmpty && status != 'scheduled') {
      return false;
    }

    return !session.scheduledAt!.isBefore(clock);
  }).toList()..sort((a, b) => a.scheduledAt!.compareTo(b.scheduledAt!));

  return upcoming.isEmpty ? null : upcoming.first;
}

int countTodayScheduledSessions(
  List<SpecialistSessionDetail> sessions, {
  DateTime? now,
}) {
  final clock = now ?? DateTime.now();
  return sessions
      .where(
        (session) =>
            session.isScheduled &&
            sessionIsToday(scheduledAt: session.scheduledAt, now: clock),
      )
      .length;
}

String formatTodayRemainingSessionsLabel({
  required int todayScheduledCount,
  required SpecialistSessionDetail? nextSession,
  DateTime? now,
}) {
  if (todayScheduledCount == 0) {
    return 'No sessions scheduled for today';
  }

  final clock = now ?? DateTime.now();
  final nextIsToday =
      nextSession != null &&
      sessionIsToday(scheduledAt: nextSession.scheduledAt, now: clock);
  final remaining = nextIsToday ? todayScheduledCount - 1 : todayScheduledCount;

  if (remaining <= 0) {
    return 'No more sessions today';
  }

  return '$remaining more session${remaining == 1 ? '' : 's'} today';
}

String formatNextSessionScheduleLabel(SpecialistSessionDetail session) {
  final scheduledAt = session.scheduledAt;
  if (scheduledAt == null) {
    return session.timeLabel;
  }

  final now = DateTime.now();
  if (sessionIsToday(scheduledAt: scheduledAt, now: now)) {
    return 'Today, ${session.timeLabel}';
  }

  final tomorrow = DateTime(now.year, now.month, now.day + 1);
  if (scheduledAt.year == tomorrow.year &&
      scheduledAt.month == tomorrow.month &&
      scheduledAt.day == tomorrow.day) {
    return 'Tomorrow, ${session.timeLabel}';
  }

  return '${DateFormat('EEE, MMM d').format(scheduledAt)} • ${session.timeLabel}';
}

DateTime startOfWeekMonday(DateTime date) {
  final normalized = DateTime(date.year, date.month, date.day);
  return normalized.subtract(
    Duration(days: normalized.weekday - DateTime.monday),
  );
}

bool isSameDay(DateTime a, DateTime b) {
  return a.year == b.year && a.month == b.month && a.day == b.day;
}

class SpecialistDashboardWeeklyScheduleCard extends StatefulWidget {
  const SpecialistDashboardWeeklyScheduleCard({
    super.key,
    required this.sessions,
  });

  final List<SpecialistSessionDetail> sessions;

  @override
  State<SpecialistDashboardWeeklyScheduleCard> createState() =>
      _SpecialistDashboardWeeklyScheduleCardState();
}

class _SpecialistDashboardWeeklyScheduleCardState
    extends State<SpecialistDashboardWeeklyScheduleCard> {
  late DateTime _selectedDay;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _selectedDay = DateTime(now.year, now.month, now.day);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final weekStart = startOfWeekMonday(today);
    final weekDays = List.generate(
      7,
      (index) => weekStart.add(Duration(days: index)),
    );
    final nextSession = findNextUpcomingSession(widget.sessions, now: now);
    final todayScheduledCount = countTodayScheduledSessions(
      widget.sessions,
      now: now,
    );
    final footerLabel = formatTodayRemainingSessionsLabel(
      todayScheduledCount: todayScheduledCount,
      nextSession: nextSession,
      now: now,
    );

    return DashboardSurfaceCard(
      tint: DashboardColors.brandCyan,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(
                Icons.calendar_today_outlined,
                size: 18,
                color: DashboardColors.brandCyan,
              ),
              SizedBox(width: context.dashSpacing * 0.35),
              Text(
                'THIS WEEK',
                style: theme.textTheme.labelLarge?.copyWith(
                  color: DashboardColors.textPrimary,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.4,
                ),
              ),
              const Spacer(),
              InkWell(
                onTap: () => context.push(
                  AppRoutes.specialistSessionsWithView(view: 'calendar'),
                ),
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 4,
                    vertical: 2,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'View Calendar',
                        style: theme.textTheme.labelLarge?.copyWith(
                          color: DashboardColors.brandCyan,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Icon(
                        Icons.chevron_right_rounded,
                        size: 18,
                        color: DashboardColors.brandCyan,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Row(
            children: weekDays.map((day) {
              final isSelected = isSameDay(day, _selectedDay);
              final isToday = isSameDay(day, today);
              final hasSession = widget.sessions.any(
                (session) =>
                    session.isScheduled &&
                    session.scheduledAt != null &&
                    isSameDay(session.scheduledAt!, day),
              );

              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _selectedDay = day),
                  behavior: HitTestBehavior.opaque,
                  child: Column(
                    children: [
                      Text(
                        DateFormat('EEE').format(day),
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: isSelected || isToday
                              ? DashboardColors.brandCyan
                              : DashboardColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.25),
                      Container(
                        width: 34,
                        height: 34,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: isSelected
                              ? DashboardColors.brandCyan
                              : Colors.transparent,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '${day.day}',
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: isSelected
                                ? Colors.white
                                : DashboardColors.textPrimary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.15),
                      Container(
                        width: 5,
                        height: 5,
                        decoration: BoxDecoration(
                          color: (isSelected || isToday) && hasSession
                              ? DashboardColors.brandCyan
                              : Colors.transparent,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          Padding(
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.75),
            child: Divider(
              height: 1,
              color: DashboardColors.border.withValues(alpha: 0.85),
            ),
          ),
          if (nextSession == null)
            _EmptyNextSession(theme: theme)
          else
            _NextSessionRow(session: nextSession, theme: theme),
          Padding(
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
            child: Divider(
              height: 1,
              color: DashboardColors.border.withValues(alpha: 0.85),
            ),
          ),
          InkWell(
            onTap: () => context.push(AppRoutes.specialistSessions),
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Row(
                children: [
                  Icon(
                    Icons.event_note_outlined,
                    size: 18,
                    color: DashboardColors.brandCyan,
                  ),
                  SizedBox(width: context.dashSpacing * 0.4),
                  Expanded(
                    child: Text(
                      footerLabel,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Icon(
                    Icons.chevron_right_rounded,
                    size: 18,
                    color: DashboardColors.textMuted,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyNextSession extends StatelessWidget {
  const _EmptyNextSession({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.35),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'No upcoming sessions',
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.2),
          Text(
            'Your scheduled sessions will appear here.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _NextSessionRow extends StatelessWidget {
  const _NextSessionRow({required this.session, required this.theme});

  final SpecialistSessionDetail session;
  final ThemeData theme;

  static const double _avatarRadius = 22;

  Widget _buildSessionDetails(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'Next Session',
          style: theme.textTheme.labelSmall?.copyWith(
            color: DashboardColors.brandCyan,
            fontWeight: FontWeight.w700,
            height: 1.1,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          session.patientName,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: DashboardColors.textPrimary,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          session.sessionType,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: theme.textTheme.bodySmall?.copyWith(
            color: DashboardColors.textSecondary,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          formatNextSessionScheduleLabel(session),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: theme.textTheme.labelSmall?.copyWith(
            color: DashboardColors.textMuted,
            height: 1.2,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final initials = dashboardInitials(session.patientName, fallback: 'PT');

    return LayoutBuilder(
      builder: (context, constraints) {
        final stackAction = constraints.maxWidth < 340;
        final avatar = DashboardProfileAvatar(
          initials: initials,
          imageUrl: session.patientProfileImageUrl,
          radius: _avatarRadius,
        );
        final details = _buildSessionDetails(context);
        final viewButton = _ViewSessionButton(session: session, theme: theme);

        if (stackAction) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  avatar,
                  const SizedBox(width: 12),
                  Expanded(child: details),
                ],
              ),
              const SizedBox(height: 8),
              Align(
                alignment: AlignmentDirectional.centerEnd,
                child: viewButton,
              ),
            ],
          );
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            avatar,
            const SizedBox(width: 12),
            Expanded(child: details),
            const SizedBox(width: 8),
            viewButton,
          ],
        );
      },
    );
  }
}

class _ViewSessionButton extends StatelessWidget {
  const _ViewSessionButton({required this.session, required this.theme});

  final SpecialistSessionDetail session;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: DashboardColors.brandSoft,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: session.id.isEmpty
            ? null
            : () =>
                  context.push(AppRoutes.specialistSessionDetails(session.id)),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: Text(
            'View Session →',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.brandCyan,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}
