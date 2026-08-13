import 'package:mobile_app/l10n/app_localizations.dart';

import '../models/parent_dashboard_models.dart';
import 'session_classification.dart';

/// Returns the earliest valid upcoming session for [childId], if any.
ParentSessionItem? nearestUpcomingParentSessionForChild(
  List<ParentSessionItem> sessions,
  String childId, {
  DateTime? now,
}) {
  if (childId.trim().isEmpty) {
    return null;
  }

  final clock = now ?? DateTime.now();
  final upcoming = sessions.where((session) {
    if (session.patientId != childId) {
      return false;
    }
    if (session.scheduledAt == null) {
      return false;
    }
    return sessionIsUpcoming(
      status: session.status,
      scheduledAt: session.scheduledAt,
      now: clock,
    );
  }).toList()..sort((a, b) => a.scheduledAt!.compareTo(b.scheduledAt!));

  return upcoming.isEmpty ? null : upcoming.first;
}

/// Formats the time remaining until [scheduledAt] for the Parent dashboard hero card.
String formatParentHeroSessionCountdown(DateTime scheduledAt, {DateTime? now}) {
  final clock = (now ?? DateTime.now()).toLocal();
  final session = scheduledAt.toLocal();

  if (!session.isAfter(clock)) {
    return 'No upcoming session';
  }

  final today = DateTime(clock.year, clock.month, clock.day);
  final sessionDay = DateTime(session.year, session.month, session.day);
  final dayDiff = sessionDay.difference(today).inDays;
  final diff = session.difference(clock);

  if (dayDiff >= 2) {
    return dayDiff == 1 ? 'In 1 day' : 'In $dayDiff days';
  }
  if (dayDiff == 1) {
    return 'Tomorrow';
  }

  if (diff.inMinutes < 60) {
    final minutes = diff.inMinutes <= 0 ? 1 : diff.inMinutes;
    return minutes == 1 ? 'In 1 minute' : 'In $minutes minutes';
  }
  if (diff.inHours < 24) {
    final hours = diff.inHours;
    return hours == 1 ? 'In 1 hour' : 'In $hours hours';
  }

  return 'Today';
}

/// Hero-card countdown label for the selected child.
String parentHeroUpcomingSessionCountdownLabel({
  required List<ParentSessionItem> sessions,
  required String? selectedPatientId,
  DateTime? now,
}) {
  if (selectedPatientId == null || selectedPatientId.trim().isEmpty) {
    return 'No upcoming session';
  }

  final nearest = nearestUpcomingParentSessionForChild(
    sessions,
    selectedPatientId,
    now: now,
  );
  final scheduledAt = nearest?.scheduledAt;
  if (scheduledAt == null) {
    return 'No upcoming session';
  }

  return formatParentHeroSessionCountdown(scheduledAt, now: now);
}

/// Localized version of [formatParentHeroSessionCountdown].
String localizedParentHeroSessionCountdown(
  AppLocalizations l10n,
  DateTime scheduledAt, {
  DateTime? now,
}) {
  final clock = (now ?? DateTime.now()).toLocal();
  final session = scheduledAt.toLocal();

  if (!session.isAfter(clock)) {
    return l10n.parentSessionNoUpcoming;
  }

  final today = DateTime(clock.year, clock.month, clock.day);
  final sessionDay = DateTime(session.year, session.month, session.day);
  final dayDiff = sessionDay.difference(today).inDays;
  final diff = session.difference(clock);

  if (dayDiff >= 2) {
    return l10n.parentSessionInDays(dayDiff);
  }
  if (dayDiff == 1) {
    return l10n.dateTomorrow;
  }

  if (diff.inMinutes < 60) {
    final minutes = diff.inMinutes <= 0 ? 1 : diff.inMinutes;
    return minutes == 1
        ? l10n.parentSessionInOneMinute
        : l10n.parentSessionInMinutes(minutes);
  }
  if (diff.inHours < 24) {
    final hours = diff.inHours;
    return hours == 1
        ? l10n.parentSessionInOneHour
        : l10n.parentSessionInHours(hours);
  }

  return l10n.dateToday;
}

/// Localized hero-card countdown label for the selected child.
String localizedParentHeroUpcomingSessionCountdownLabel(
  AppLocalizations l10n, {
  required List<ParentSessionItem> sessions,
  required String? selectedPatientId,
  DateTime? now,
}) {
  if (selectedPatientId == null || selectedPatientId.trim().isEmpty) {
    return l10n.parentSessionNoUpcoming;
  }

  final nearest = nearestUpcomingParentSessionForChild(
    sessions,
    selectedPatientId,
    now: now,
  );
  final scheduledAt = nearest?.scheduledAt;
  if (scheduledAt == null) {
    return l10n.parentSessionNoUpcoming;
  }

  return localizedParentHeroSessionCountdown(l10n, scheduledAt, now: now);
}
