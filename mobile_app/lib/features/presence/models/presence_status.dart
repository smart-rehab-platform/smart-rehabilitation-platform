import 'package:intl/intl.dart';

class PresenceStatus {
  const PresenceStatus({
    required this.userId,
    this.isOnline = false,
    this.lastSeen,
  });

  final String userId;
  final bool isOnline;
  final DateTime? lastSeen;

  PresenceStatus copyWith({
    bool? isOnline,
    DateTime? lastSeen,
    bool clearLastSeen = false,
  }) {
    return PresenceStatus(
      userId: userId,
      isOnline: isOnline ?? this.isOnline,
      lastSeen: clearLastSeen ? null : (lastSeen ?? this.lastSeen),
    );
  }

  factory PresenceStatus.fromMap(Map<String, dynamic> map) {
    final lastSeenRaw = map['last_seen'] ?? map['lastSeen'];
    DateTime? lastSeen;
    if (lastSeenRaw is String && lastSeenRaw.isNotEmpty) {
      lastSeen = DateTime.tryParse(lastSeenRaw);
    }

    final storedOnline =
        map['is_online'] == true || map['isOnline'] == true;
    final computedOnline = map.containsKey('isOnline')
        ? map['isOnline'] == true
        : storedOnline;

    return PresenceStatus(
      userId: (map['id'] ?? map['user_id'] ?? map['userId'] ?? '').toString(),
      isOnline: computedOnline,
      lastSeen: lastSeen,
    );
  }
}

String formatPresenceLabel(PresenceStatus? status) {
  if (status == null) {
    return 'Offline';
  }

  if (status.isOnline) {
    return 'Online';
  }

  final lastSeen = status.lastSeen;
  if (lastSeen == null) {
    return 'Offline';
  }

  final localLastSeen = lastSeen.toLocal();
  final now = DateTime.now();
  final diff = now.difference(localLastSeen);

  if (diff.inMinutes < 1) {
    return 'Last seen just now';
  }
  if (diff.inMinutes < 60) {
    return 'Last seen ${diff.inMinutes} minute${diff.inMinutes == 1 ? '' : 's'} ago';
  }
  if (diff.inHours < 24) {
    return 'Last seen ${diff.inHours} hour${diff.inHours == 1 ? '' : 's'} ago';
  }

  final today = DateTime(now.year, now.month, now.day);
  final seenDay = DateTime(
    localLastSeen.year,
    localLastSeen.month,
    localLastSeen.day,
  );
  final yesterday = today.subtract(const Duration(days: 1));

  if (seenDay == yesterday) {
    return 'Last seen yesterday';
  }

  return 'Last seen ${DateFormat('MMM d').format(localLastSeen)}';
}
