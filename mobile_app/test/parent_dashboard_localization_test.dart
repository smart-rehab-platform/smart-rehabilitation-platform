import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/locale/locale_provider.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/case_intake/providers/case_categories_provider.dart';
import 'package:mobile_app/features/case_intake/providers/parent_case_intake_provider.dart';
import 'package:mobile_app/features/dashboard/presentation/parent_dashboard_screen.dart';
import 'package:mobile_app/features/dashboard/providers/communication_list_provider.dart';
import 'package:mobile_app/features/dashboard/providers/parent_dashboard_provider.dart';
import 'package:mobile_app/features/dashboard/providers/parent_features_provider.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

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

class _ImmediateParentDashboardNotifier extends ParentDashboardNotifier {
  _ImmediateParentDashboardNotifier(
    super.ref,
    super.repository,
    super.authRepository,
    ParentDashboardState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}

  @override
  Future<void> refresh() async {}

  @override
  Future<void> refreshUnreadCount() async {}
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

  @override
  Future<void> refreshRequests() async {}
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

Widget _parentDashboardTestApp({
  Locale locale = const Locale('en'),
  ParentDashboardState? dashboardState,
}) {
  const user = AuthUser(
    id: 'parent-1',
    fullName: 'Sarah Ahmed',
    email: 'parent@example.com',
    role: 'parent',
  );

  final resolvedDashboardState =
      dashboardState ??
      const ParentDashboardState(isLoading: false, user: user, children: []);

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
            user: user,
          ),
        );
      }),
      parentDashboardProvider.overrideWith((ref) {
        return _ImmediateParentDashboardNotifier(
          ref,
          ref.watch(parentDashboardRepositoryProvider),
          ref.watch(authRepositoryProvider),
          resolvedDashboardState,
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
      parentNotificationsProvider.overrideWith((ref) {
        return _ImmediateParentNotificationsNotifier(
          ref,
          ref.watch(parentDashboardRepositoryProvider),
          const ParentNotificationsState(),
        );
      }),
    ],
    child: MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: const ParentDashboardScreen(),
    ),
  );
}

void main() {
  testWidgets('Parent dashboard renders English labels without children', (
    tester,
  ) async {
    await tester.pumpWidget(_parentDashboardTestApp());
    await tester.pumpAndSettle();

    expect(find.text('Welcome back, Sarah Ahmed'), findsOneWidget);
    expect(find.text("Start Your Child's Follow-Up Journey"), findsOneWidget);
    expect(find.text("Today's Tasks"), findsOneWidget);
    expect(find.text('See all'), findsWidgets);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Patients'), findsOneWidget);
    expect(find.text('Exercises'), findsOneWidget);
    expect(find.text('Reports'), findsOneWidget);
    expect(find.text('More'), findsOneWidget);
    expect(find.text('Smart Rehabilitation Platform'), findsOneWidget);
  });

  testWidgets('Parent dashboard renders Arabic labels without children', (
    tester,
  ) async {
    await tester.pumpWidget(
      _parentDashboardTestApp(locale: const Locale('ar')),
    );
    await tester.pumpAndSettle();

    expect(find.text('مرحباً بعودتك، Sarah Ahmed'), findsOneWidget);
    expect(find.text('ابدأ رحلة متابعة طفلك'), findsOneWidget);
    expect(find.text('مهام اليوم'), findsOneWidget);
    expect(find.text('عرض الكل'), findsWidgets);
    expect(find.text('الرئيسية'), findsOneWidget);
    expect(find.text('المرضى'), findsOneWidget);
    expect(find.text('التمارين'), findsOneWidget);
    expect(find.text('التقارير'), findsOneWidget);
    expect(find.text('المزيد'), findsOneWidget);
  });
}
