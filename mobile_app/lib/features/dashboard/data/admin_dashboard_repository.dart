import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';

class AdminOverviewData {
  const AdminOverviewData({
    this.totalUsers = 0,
    this.totalPatients = 0,
    this.totalSpecialists = 0,
    this.newSignupsThisWeek = 0,
  });

  final int totalUsers;
  final int totalPatients;
  final int totalSpecialists;
  final int newSignupsThisWeek;
}

class WeeklySystemActivityDay {
  const WeeklySystemActivityDay({
    required this.label,
    required this.fullLabel,
    required this.activityCount,
  });

  final String label;
  final String fullLabel;
  final int activityCount;

  factory WeeklySystemActivityDay.fromMap(Map<String, dynamic> map) {
    return WeeklySystemActivityDay(
      label: ApiResponseParser.readString(map, const ['label']) ?? '—',
      fullLabel: ApiResponseParser.readString(map, const [
            'full_label',
            'fullLabel',
          ]) ??
          ApiResponseParser.readString(map, const ['label']) ??
          '—',
      activityCount: ApiResponseParser.readInt(map, const [
            'activity_count',
            'activityCount',
          ]) ??
          0,
    );
  }
}

class WeeklySystemActivityData {
  const WeeklySystemActivityData({
    required this.days,
    this.weekOffset = 0,
    this.weekStart,
    this.weekEnd,
  });

  final List<WeeklySystemActivityDay> days;
  final int weekOffset;
  final DateTime? weekStart;
  final DateTime? weekEnd;

  bool get hasActivity => days.any((day) => day.activityCount > 0);

  String get periodLabel => systemActivityPeriodLabel(
        weekOffset: weekOffset,
        weekStart: weekStart,
        weekEnd: weekEnd,
      );

  static const _defaultLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  static const _defaultFullLabels = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  static WeeklySystemActivityData get empty => WeeklySystemActivityData(
        days: List.generate(
          7,
          (index) => WeeklySystemActivityDay(
            label: _defaultLabels[index],
            fullLabel: _defaultFullLabels[index],
            activityCount: 0,
          ),
        ),
      );

  static WeeklySystemActivityData forRequestedWeek(int weekOffset) {
    return WeeklySystemActivityData(
      days: empty.days,
      weekOffset: weekOffset.clamp(0, 52),
    );
  }

  factory WeeklySystemActivityData.fromMap(
    Map<String, dynamic>? map, {
    int requestedWeekOffset = 0,
  }) {
    final normalizedOffset = requestedWeekOffset.clamp(0, 52);

    if (map == null) {
      return WeeklySystemActivityData.forRequestedWeek(normalizedOffset);
    }

    final rawDays = map['days'];
    if (rawDays is! List || rawDays.isEmpty) {
      return WeeklySystemActivityData(
        days: empty.days,
        weekOffset: ApiResponseParser.readInt(map, const [
              'week_offset',
              'weekOffset',
            ]) ??
            normalizedOffset,
        weekStart: _parseDate(map['week_start'] ?? map['weekStart']),
        weekEnd: _parseDate(map['week_end'] ?? map['weekEnd']),
      );
    }

    final days = rawDays
        .whereType<Map>()
        .map(
          (item) => WeeklySystemActivityDay.fromMap(
            item.map((key, value) => MapEntry(key.toString(), value)),
          ),
        )
        .toList();

    if (days.length != 7) {
      return WeeklySystemActivityData(
        days: empty.days,
        weekOffset: ApiResponseParser.readInt(map, const [
              'week_offset',
              'weekOffset',
            ]) ??
            normalizedOffset,
        weekStart: _parseDate(map['week_start'] ?? map['weekStart']),
        weekEnd: _parseDate(map['week_end'] ?? map['weekEnd']),
      );
    }

    return WeeklySystemActivityData(
      days: days,
      weekOffset: ApiResponseParser.readInt(map, const [
            'week_offset',
            'weekOffset',
          ]) ??
          normalizedOffset,
      weekStart: _parseDate(map['week_start'] ?? map['weekStart']),
      weekEnd: _parseDate(map['week_end'] ?? map['weekEnd']),
    );
  }

  static DateTime? _parseDate(Object? value) {
    if (value == null) {
      return null;
    }
    if (value is DateTime) {
      return value;
    }
    return DateTime.tryParse(value.toString());
  }
}

const systemActivityPresetOffsets = <String, int>{
  'This Week': 0,
  'Last Week': 1,
  'Last 2 Weeks': 2,
  'Last Month': 4,
};

String systemActivityPeriodLabel({
  required int weekOffset,
  DateTime? weekStart,
  DateTime? weekEnd,
}) {
  for (final entry in systemActivityPresetOffsets.entries) {
    if (entry.value == weekOffset) {
      return entry.key;
    }
  }

  if (weekStart != null && weekEnd != null) {
    return '${_formatChartDate(weekStart)} – ${_formatChartDate(weekEnd)}';
  }

  if (weekOffset == 1) {
    return 'Last Week';
  }

  return '$weekOffset weeks ago';
}

String _formatChartDate(DateTime date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return '${months[date.month - 1]} ${date.day}';
}

class AdminRecentUser {
  const AdminRecentUser({
    required this.name,
    required this.role,
    required this.registeredLabel,
  });

  final String name;
  final String role;
  final String registeredLabel;

  factory AdminRecentUser.fromMap(Map<String, dynamic> map) {
    final createdAt = ApiResponseParser.readDate(
      map['created_at'] ?? map['createdAt'],
    );

    return AdminRecentUser(
      name: ApiResponseParser.readString(map, const [
            'full_name',
            'fullName',
            'name',
          ]) ??
          'User',
      role: _formatRole(
        ApiResponseParser.readString(map, const ['role', 'userRole']),
      ),
      registeredLabel: _formatRegistered(createdAt),
    );
  }

  static String _formatRole(String? role) {
    if (role == null || role.isEmpty) {
      return 'User';
    }
    return '${role[0].toUpperCase()}${role.substring(1)}';
  }

  static String _formatRegistered(DateTime? date) {
    if (date == null) {
      return 'Recently';
    }
    final diff = DateTime.now().difference(date);
    if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    }
    if (diff.inDays < 7) {
      return '${diff.inDays}d ago';
    }
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }
}

class AdminDashboardRepository {
  AdminDashboardRepository(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>?> _getMap(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
      );
      return ApiResponseParser.extractMap(response.data);
    } on DioException {
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    try {
      final response = await _dio.get(path);
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
          .toList();
    } on DioException {
      return const [];
    }
  }

  Future<AdminOverviewData> fetchOverview() async {
    final overviewMap = await _getMap('/dashboard/admin/overview');
    final usersByRole = await _getList('/dashboard/admin/users');
    final allUsers = await _getList('/users');

    var totalUsers = ApiResponseParser.readInt(overviewMap ?? {}, const [
          'total_users',
          'totalUsers',
        ]) ??
        0;
    var totalPatients = ApiResponseParser.readInt(overviewMap ?? {}, const [
          'total_patients',
          'totalPatients',
        ]) ??
        0;

    var totalSpecialists = 0;
    for (final row in usersByRole) {
      final role = ApiResponseParser.readString(row, const ['role'])?.toLowerCase();
      if (role == 'specialist') {
        totalSpecialists = ApiResponseParser.readInt(row, const ['count']) ?? 0;
        break;
      }
    }

    final weekAgo = DateTime.now().subtract(const Duration(days: 7));
    final newSignups = allUsers.where((user) {
      final createdAt = ApiResponseParser.readDate(
        user['created_at'] ?? user['createdAt'],
      );
      return createdAt != null && createdAt.isAfter(weekAgo);
    }).length;

    if (totalUsers == 0) {
      totalUsers = allUsers.length;
    }
    if (totalPatients == 0) {
      totalPatients = (await _getList('/patients')).length;
    }
    if (totalSpecialists == 0) {
      totalSpecialists = allUsers
          .where(
            (user) =>
                ApiResponseParser.readString(user, const ['role'])?.toLowerCase() ==
                'specialist',
          )
          .length;
    }

    return AdminOverviewData(
      totalUsers: totalUsers,
      totalPatients: totalPatients,
      totalSpecialists: totalSpecialists,
      newSignupsThisWeek: newSignups,
    );
  }

  Future<WeeklySystemActivityData> fetchWeeklySystemActivity({
    int weekOffset = 0,
  }) async {
    final normalizedOffset = weekOffset.clamp(0, 52);
    final response = await _dio.get(
      '/dashboard/admin/weekly-system-activity',
      queryParameters: {'week_offset': normalizedOffset},
    );
    final map = ApiResponseParser.extractMap(response.data);
    return WeeklySystemActivityData.fromMap(
      map,
      requestedWeekOffset: normalizedOffset,
    );
  }

  Future<List<AdminRecentUser>> fetchRecentUsers() async {
    final rows = await _getList('/users');
    final users = rows.map(AdminRecentUser.fromMap).toList();
    return users.take(5).toList();
  }

  Future<List<AdminRecentUser>> fetchAllUsers() async {
    final rows = await _getList('/users');
    return rows.map(AdminRecentUser.fromMap).toList();
  }

  Future<int> fetchUnreadNotifications(String userId) async {
    final rows = await _getList('/users/$userId/notifications/unread');
    return rows.length;
  }
}
