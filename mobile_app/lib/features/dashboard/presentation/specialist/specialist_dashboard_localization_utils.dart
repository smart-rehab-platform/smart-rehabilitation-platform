import 'package:intl/intl.dart';

import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_feature_models.dart';
import '../../utils/session_classification.dart';

String mapSpecialistDashboardError(AppLocalizations l10n, String message) {
  if (message == 'Please sign in as a specialist to view this dashboard.') {
    return l10n.specialistDashboardSignInRequired;
  }
  if (message.startsWith('Failed to load specialist dashboard:')) {
    return l10n.specialistDashboardLoadFailed(
      message.substring('Failed to load specialist dashboard:'.length).trim(),
    );
  }
  return message;
}

String formatLocalizedSubmittedAgo(AppLocalizations l10n, DateTime? date) {
  if (date == null) {
    return l10n.specialistDashboardSubmittedRecently;
  }

  final diff = DateTime.now().difference(date);
  if (diff.inMinutes < 60) {
    return l10n.specialistDashboardSubmittedMinutesAgo(diff.inMinutes);
  }
  if (diff.inHours < 24) {
    return l10n.specialistDashboardSubmittedHoursAgo(diff.inHours);
  }
  return l10n.specialistDashboardSubmittedOnDate(
    DateFormat('MMM d').format(date),
  );
}

String formatLocalizedTodayRemainingSessionsLabel({
  required AppLocalizations l10n,
  required int todayScheduledCount,
  required SpecialistSessionDetail? nextSession,
  DateTime? now,
}) {
  if (todayScheduledCount == 0) {
    return l10n.specialistDashboardNoSessionsToday;
  }

  final clock = now ?? DateTime.now();
  final nextIsToday =
      nextSession != null &&
      sessionIsToday(scheduledAt: nextSession.scheduledAt, now: clock);
  final remaining = nextIsToday ? todayScheduledCount - 1 : todayScheduledCount;

  if (remaining <= 0) {
    return l10n.specialistDashboardNoMoreSessionsToday;
  }

  return l10n.specialistDashboardMoreSessionsToday(remaining);
}

String formatLocalizedNextSessionScheduleLabel({
  required AppLocalizations l10n,
  required SpecialistSessionDetail session,
  required String localeName,
}) {
  final scheduledAt = session.scheduledAt;
  if (scheduledAt == null) {
    return session.timeLabel;
  }

  final now = DateTime.now();
  if (sessionIsToday(scheduledAt: scheduledAt, now: now)) {
    return l10n.specialistDashboardNextSessionToday(session.timeLabel);
  }

  final tomorrow = DateTime(now.year, now.month, now.day + 1);
  if (scheduledAt.year == tomorrow.year &&
      scheduledAt.month == tomorrow.month &&
      scheduledAt.day == tomorrow.day) {
    return l10n.specialistDashboardNextSessionTomorrow(session.timeLabel);
  }

  final dateLabel = DateFormat('EEE, MMM d', localeName).format(scheduledAt);
  return '$dateLabel • ${session.timeLabel}';
}
