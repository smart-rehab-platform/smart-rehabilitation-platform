import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/locale/locale_provider.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/case_intake/providers/case_categories_provider.dart';
import 'package:mobile_app/features/case_intake/providers/parent_case_intake_provider.dart';
import 'package:mobile_app/features/dashboard/providers/communication_list_provider.dart';
import 'package:mobile_app/features/dashboard/providers/parent_dashboard_provider.dart';
import 'package:mobile_app/features/dashboard/models/parent_dashboard_models.dart';
import 'package:mobile_app/features/dashboard/models/parent_profile_models.dart';
import 'package:mobile_app/features/dashboard/presentation/parent/edit_parent_profile_screen.dart';
import 'package:mobile_app/features/dashboard/presentation/parent/parent_screens.dart';
import 'package:mobile_app/features/dashboard/providers/parent_edit_profile_provider.dart';
import 'package:mobile_app/features/dashboard/providers/parent_features_provider.dart';
import 'package:mobile_app/features/dashboard/providers/parent_profile_provider.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

const _user = AuthUser(
  id: 'parent-1',
  fullName: 'Sarah Ahmed',
  email: 'parent@example.com',
  role: 'parent',
);

const _profileBundle = ParentProfileBundle(
  userId: 'parent-1',
  fullName: 'Sarah Ahmed',
  email: 'parent@example.com',
  phone: '+966501234567',
  address: 'Riyadh',
);

class _ImmediateAuthNotifier extends AuthNotifier {
  _ImmediateAuthNotifier(
    super.repository,
    super.tokenStorage,
    AuthState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> restoreSession() async {}

  @override
  Future<({bool rememberMe, String? email})> loadRememberedLogin() async {
    return (rememberMe: false, email: null);
  }
}

class _ImmediateParentCaseIntakeNotifier extends ParentCaseIntakeNotifier {
  _ImmediateParentCaseIntakeNotifier(
    super.ref,
    super.repository,
    super.communicationRepository,
    super.authRepository,
    ParentCaseIntakeState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> loadRequests() async {}
}

class _ImmediateParentProfileNotifier extends ParentProfileNotifier {
  _ImmediateParentProfileNotifier(
    super.ref,
    super.repository,
    ParentProfileState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}

  @override
  Future<void> refresh() async {}
}

class _ImmediateParentNotificationsNotifier
    extends ParentNotificationsNotifier {
  _ImmediateParentNotificationsNotifier(
    super.ref,
    super.repository,
    ParentNotificationsState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}
}

class _ImmediateParentEditProfileNotifier extends ParentEditProfileNotifier {
  _ImmediateParentEditProfileNotifier(
    super.ref,
    super.repository,
    ParentEditProfileState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}
}

Widget _localizedTestApp({
  required Locale locale,
  required Widget home,
  List<Override> extraOverrides = const [],
}) {
  return ProviderScope(
    overrides: [
      localeProvider.overrideWith((ref) {
        final notifier = LocaleNotifier(const TokenStorage());
        notifier.state = locale;
        return notifier;
      }),
      authProvider.overrideWith((ref) {
        final repository = ref.watch(authRepositoryProvider);
        final tokenStorage = ref.watch(tokenStorageProvider);
        return _ImmediateAuthNotifier(
          repository,
          tokenStorage,
          const AuthState(
            isInitializing: false,
            token: 'test-token',
            user: _user,
          ),
        );
      }),
      parentCaseIntakeProvider.overrideWith((ref) {
        return _ImmediateParentCaseIntakeNotifier(
          ref,
          ref.watch(caseIntakeRepositoryProvider),
          ref.watch(communicationRepositoryProvider),
          ref.watch(authRepositoryProvider),
          const ParentCaseIntakeState(isLoading: false, requests: []),
        );
      }),
      ...extraOverrides,
    ],
    child: MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: home,
    ),
  );
}

void main() {
  testWidgets('Parent More renders English labels', (tester) async {
    await tester.pumpWidget(
      _localizedTestApp(
        locale: const Locale('en'),
        home: const ParentMoreScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('More'), findsWidgets);
    expect(find.text('Language'), findsOneWidget);
    expect(find.text('Case Requests'), findsOneWidget);
    expect(find.text('Messages'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
    expect(find.text('Notifications'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Logout'),
      120,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Logout'), findsOneWidget);
  });

  testWidgets('Parent More renders Arabic labels', (tester) async {
    await tester.pumpWidget(
      _localizedTestApp(
        locale: const Locale('ar'),
        home: const ParentMoreScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('المزيد'), findsWidgets);
    expect(find.text('اللغة'), findsOneWidget);
    expect(find.text('طلبات الحالات'), findsOneWidget);
    expect(find.text('الرسائل'), findsOneWidget);
    expect(find.text('الملف الشخصي'), findsOneWidget);
    expect(find.text('الإشعارات'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('تسجيل الخروج'),
      120,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('تسجيل الخروج'), findsOneWidget);
  });

  testWidgets('Parent Profile renders localized field labels', (tester) async {
    await tester.pumpWidget(
      _localizedTestApp(
        locale: const Locale('en'),
        home: const ParentProfileScreen(),
        extraOverrides: [
          parentProfileProvider.overrideWith((ref) {
            return _ImmediateParentProfileNotifier(
              ref,
              ref.watch(parentProfileRepositoryProvider),
              const ParentProfileState(
                isLoading: false,
                bundle: _profileBundle,
              ),
            );
          }),
        ],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Profile'), findsOneWidget);
    expect(find.text('Language'), findsOneWidget);
    expect(find.text('Full Name'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Role'), findsOneWidget);
    expect(find.text('Parent'), findsOneWidget);
    expect(find.text('Phone'), findsOneWidget);
    expect(find.text('Address'), findsOneWidget);
    expect(find.text('Edit Profile'), findsOneWidget);
    expect(find.text('Logout'), findsOneWidget);
  });

  testWidgets('Parent Profile renders Arabic field labels', (tester) async {
    await tester.pumpWidget(
      _localizedTestApp(
        locale: const Locale('ar'),
        home: const ParentProfileScreen(),
        extraOverrides: [
          parentProfileProvider.overrideWith((ref) {
            return _ImmediateParentProfileNotifier(
              ref,
              ref.watch(parentProfileRepositoryProvider),
              const ParentProfileState(
                isLoading: false,
                bundle: _profileBundle,
              ),
            );
          }),
        ],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('الملف الشخصي'), findsOneWidget);
    expect(find.text('اللغة'), findsOneWidget);
    expect(find.text('الاسم الكامل'), findsOneWidget);
    expect(find.text('البريد الإلكتروني'), findsOneWidget);
    expect(find.text('الدور'), findsOneWidget);
    expect(find.text('ولي الأمر'), findsOneWidget);
    expect(find.text('الهاتف'), findsOneWidget);
    expect(find.text('العنوان'), findsOneWidget);
    expect(find.text('تعديل الملف الشخصي'), findsOneWidget);
    expect(find.text('تسجيل الخروج'), findsOneWidget);
  });

  testWidgets('Parent Notifications renders localized empty state', (
    tester,
  ) async {
    await tester.pumpWidget(
      _localizedTestApp(
        locale: const Locale('en'),
        home: const ParentNotificationsScreen(),
        extraOverrides: [
          parentNotificationsProvider.overrideWith((ref) {
            return _ImmediateParentNotificationsNotifier(
              ref,
              ref.watch(parentDashboardRepositoryProvider),
              const ParentNotificationsState(isLoading: false, items: []),
            );
          }),
        ],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Notifications'), findsOneWidget);
    expect(find.text('No notifications yet.'), findsOneWidget);
  });

  testWidgets('Parent Notifications renders Arabic empty state', (
    tester,
  ) async {
    await tester.pumpWidget(
      _localizedTestApp(
        locale: const Locale('ar'),
        home: const ParentNotificationsScreen(),
        extraOverrides: [
          parentNotificationsProvider.overrideWith((ref) {
            return _ImmediateParentNotificationsNotifier(
              ref,
              ref.watch(parentDashboardRepositoryProvider),
              const ParentNotificationsState(isLoading: false, items: []),
            );
          }),
        ],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('الإشعارات'), findsOneWidget);
    expect(find.text('لا توجد إشعارات بعد.'), findsOneWidget);
  });

  testWidgets('Parent Notifications keeps backend title unchanged', (
    tester,
  ) async {
    await tester.pumpWidget(
      _localizedTestApp(
        locale: const Locale('ar'),
        home: const ParentNotificationsScreen(),
        extraOverrides: [
          parentNotificationsProvider.overrideWith((ref) {
            return _ImmediateParentNotificationsNotifier(
              ref,
              ref.watch(parentDashboardRepositoryProvider),
              const ParentNotificationsState(
                isLoading: false,
                unreadCount: 1,
                items: [
                  ParentNotificationItem(
                    id: 'n-1',
                    title: 'New report available',
                    message: 'Weekly report is ready to view.',
                    isRead: false,
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('New report available'), findsOneWidget);
    expect(find.text('Weekly report is ready to view.'), findsOneWidget);
    expect(find.text('تحديد الكل كمقروء'), findsOneWidget);
  });

  testWidgets('Edit Parent Profile renders localized form labels', (
    tester,
  ) async {
    await tester.pumpWidget(
      _localizedTestApp(
        locale: const Locale('en'),
        home: const EditParentProfileScreen(),
        extraOverrides: [
          parentEditProfileProvider.overrideWith((ref) {
            return _ImmediateParentEditProfileNotifier(
              ref,
              ref.watch(parentProfileRepositoryProvider),
              const ParentEditProfileState(
                isLoading: false,
                fullName: 'Sarah Ahmed',
                phone: '+966501234567',
                address: 'Riyadh',
              ),
            );
          }),
        ],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Edit Profile'), findsOneWidget);
    expect(find.text('Personal Information'), findsOneWidget);
    expect(find.text('Parent Details'), findsOneWidget);
    expect(find.text('Save Changes'), findsOneWidget);
    expect(find.text('Cancel'), findsOneWidget);
  });
}
