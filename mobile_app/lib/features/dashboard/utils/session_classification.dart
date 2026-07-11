/// Shared session tab classification used by Parent and Specialist sessions.
bool sessionIsUpcoming({
  required String? status,
  required DateTime? scheduledAt,
  DateTime? now,
}) {
  final normalized = status?.toLowerCase().trim();
  if (normalized != 'scheduled') {
    return false;
  }
  if (scheduledAt == null) {
    return true;
  }
  final clock = now ?? DateTime.now();
  return !scheduledAt.isBefore(clock);
}

bool sessionIsPast({
  required String? status,
  required DateTime? scheduledAt,
  DateTime? now,
}) {
  if (sessionIsUpcoming(
    status: status,
    scheduledAt: scheduledAt,
    now: now,
  )) {
    return false;
  }

  final normalized = status?.toLowerCase().trim();
  if (normalized == 'completed' ||
      normalized == 'cancelled' ||
      normalized == 'no_show') {
    return true;
  }

  final clock = now ?? DateTime.now();
  return scheduledAt != null && scheduledAt.isBefore(clock);
}

bool sessionIsToday({
  required DateTime? scheduledAt,
  DateTime? now,
}) {
  if (scheduledAt == null) {
    return false;
  }
  final clock = now ?? DateTime.now();
  return scheduledAt.year == clock.year &&
      scheduledAt.month == clock.month &&
      scheduledAt.day == clock.day;
}
