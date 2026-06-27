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

  Future<Map<String, dynamic>?> _getMap(String path) async {
    try {
      final response = await _dio.get(path);
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
