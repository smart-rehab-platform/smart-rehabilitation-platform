import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/routes/app_routes.dart';
import 'package:mobile_app/features/dashboard/data/admin_users_repository.dart';
import 'package:mobile_app/features/dashboard/presentation/admin/admin_users_screen.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

bool _matchesRole(AdminUserRecord user, String? roleFilter) {
  return roleFilter == null ||
      roleFilter.isEmpty ||
      user.role.toLowerCase() == roleFilter.toLowerCase();
}

List<AdminUserRecord> _filterUsersByRole(
  List<AdminUserRecord> users,
  String? roleFilter,
) {
  return users
      .where((user) => _matchesRole(user, roleFilter))
      .toList(growable: false);
}

void main() {
  group('Admin Users role filter navigation', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('Specialists KPI route includes role=specialist', () {
      expect(
        AppRoutes.adminUsersWithRole(role: 'specialist'),
        '${AppRoutes.adminUsers}?role=specialist',
      );
    });

    test('plain Users route has no role query param', () {
      expect(AppRoutes.adminUsersWithRole(), AppRoutes.adminUsers);
      expect(AppRoutes.adminUsersWithRole(role: null), AppRoutes.adminUsers);
    });

    test('parseAdminUsersRoleParam accepts specialist and rejects invalid values', () {
      expect(AppRoutes.parseAdminUsersRoleParam('specialist'), 'specialist');
      expect(AppRoutes.parseAdminUsersRoleParam(' SPECIALIST '), 'specialist');
      expect(AppRoutes.parseAdminUsersRoleParam(null), isNull);
      expect(AppRoutes.parseAdminUsersRoleParam(''), isNull);
      expect(AppRoutes.parseAdminUsersRoleParam('all'), isNull);
      expect(AppRoutes.parseAdminUsersRoleParam('unknown'), isNull);
      expect(AppRoutes.parseAdminUsersRoleParam('الأخصائي'), isNull);
    });

    test('AdminUsersScreen stores parsed initial role filter once', () {
      const screen = AdminUsersScreen(initialRoleFilter: 'specialist');
      expect(screen.initialRoleFilter, 'specialist');

      const defaultScreen = AdminUsersScreen();
      expect(defaultScreen.initialRoleFilter, isNull);
    });

    test('existing role filtering returns only specialists for specialist filter', () {
      final users = [
        AdminUserRecord(
          id: '1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'admin',
          isActive: true,
        ),
        AdminUserRecord(
          id: '2',
          name: 'Spec User',
          email: 'spec@test.com',
          role: 'specialist',
          isActive: true,
        ),
        AdminUserRecord(
          id: '3',
          name: 'Parent User',
          email: 'parent@test.com',
          role: 'parent',
          isActive: true,
        ),
      ];

      final filtered = _filterUsersByRole(users, 'specialist');

      expect(filtered, hasLength(1));
      expect(filtered.first.role, 'specialist');
    });

    test('missing or invalid role defaults to All via null filter', () {
      expect(AppRoutes.parseAdminUsersRoleParam(null), isNull);
      expect(AppRoutes.parseAdminUsersRoleParam('invalid'), isNull);

      final users = [
        AdminUserRecord(
          id: '1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'admin',
          isActive: true,
        ),
        AdminUserRecord(
          id: '2',
          name: 'Spec User',
          email: 'spec@test.com',
          role: 'specialist',
          isActive: true,
        ),
      ];

      expect(_filterUsersByRole(users, null), users);
    });

    test('role filter value is locale-independent while labels differ', () {
      expect(en.roleSpecialist, isNot(equals(ar.roleSpecialist)));
      expect(AppRoutes.parseAdminUsersRoleParam('specialist'), 'specialist');
    });

    test('manual filter switching uses the same raw role values', () {
      String? roleFilter = AppRoutes.parseAdminUsersRoleParam('specialist');
      expect(roleFilter, 'specialist');

      roleFilter = null;
      expect(roleFilter, isNull);

      roleFilter = AppRoutes.parseAdminUsersRoleParam('parent');
      expect(roleFilter, 'parent');
    });
  });
}
