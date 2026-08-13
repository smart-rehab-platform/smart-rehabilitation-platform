import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/locale/locale_provider.dart';
import 'package:mobile_app/features/auth/data/auth_repository.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/dashboard/data/specialist_reports_repository.dart';
import 'package:mobile_app/features/dashboard/models/specialist_feature_models.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_reports_screen.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_screens.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_sessions_screen.dart';
import 'package:mobile_app/features/dashboard/providers/session_requests_provider.dart';
import 'package:mobile_app/features/dashboard/providers/specialist_features_provider.dart';
import 'package:mobile_app/features/dashboard/providers/specialist_reports_provider.dart';
import 'package:mobile_app/features/dashboard/providers/specialist_session_requests_provider.dart';
import 'package:mobile_app/features/dashboard/providers/specialist_sessions_provider.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

const _user = AuthUser(
  id: 'specialist-1',
  fullName: 'Dr. Layla Hassan',
  email: 'specialist@example.com',
  role: 'specialist',
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

class _ImmediateSpecialistPatientsNotifier extends SpecialistPatientsNotifier {
  _ImmediateSpecialistPatientsNotifier(
    super.ref,
    super.repository,
    SpecialistListState<SpecialistPatientItem> initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}

  @override
  Future<void> refresh() async {}
}

class _ImmediateSpecialistExercisesNotifier
    extends SpecialistExercisesNotifier {
  _ImmediateSpecialistExercisesNotifier(
    super.ref,
    super.repository,
    SpecialistListState<SpecialistExerciseItem> initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}

  @override
  Future<void> refresh() async {}
}

class _ImmediateSpecialistReportsNotifier extends SpecialistReportsNotifier {
  _ImmediateSpecialistReportsNotifier(
    Ref ref,
    SpecialistReportsRepository repository,
    String? patientId,
    SpecialistReportsState initialState,
  ) : super(ref, repository, patientId) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}

  @override
  Future<void> refresh() async {}
}

class _ImmediateSpecialistSessionsNotifier extends SpecialistSessionsNotifier {
  _ImmediateSpecialistSessionsNotifier(
    super.ref,
    super.repository,
    SpecialistSessionsState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}

  @override
  Future<void> refresh() async {}
}

class _ImmediateSpecialistSessionRequestsNotifier
    extends SpecialistSessionRequestsNotifier {
  _ImmediateSpecialistSessionRequestsNotifier(
    super.ref,
    super.repository,
    super.authRepository,
    SpecialistSessionRequestsState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}

  @override
  Future<void> refresh() async {}
}

class _ImmediateSpecialistNotificationsNotifier
    extends SpecialistNotificationsNotifier {
  _ImmediateSpecialistNotificationsNotifier(
    super.ref,
    super.repository,
    SpecialistNotificationsState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> initialize() async {}
}

Widget _specialistShell({
  required Widget home,
  Locale locale = const Locale('en'),
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
      specialistNotificationsProvider.overrideWith((ref) {
        return _ImmediateSpecialistNotificationsNotifier(
          ref,
          ref.watch(specialistFeaturesRepositoryProvider),
          const SpecialistNotificationsState(),
        );
      }),
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
  testWidgets('Specialist More menu renders English labels', (tester) async {
    tester.view.physicalSize = const Size(800, 1200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      _specialistShell(home: const SpecialistMoreScreen()),
    );
    await tester.pumpAndSettle();

    expect(find.text('More'), findsOneWidget);
    expect(find.text('Assigned Case Requests'), findsOneWidget);
    expect(find.text('Messages'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
    expect(find.text('Notifications'), findsOneWidget);
    expect(find.text('Pending Reviews'), findsOneWidget);
    expect(find.text("Today's Sessions"), findsOneWidget);
    expect(find.text('Treatment Plans'), findsOneWidget);
    expect(find.text('Logout'), findsOneWidget);
    expect(find.text('Language'), findsOneWidget);
  });

  testWidgets('Specialist More menu renders Arabic labels', (tester) async {
    tester.view.physicalSize = const Size(800, 1200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      _specialistShell(
        locale: const Locale('ar'),
        home: const SpecialistMoreScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('المزيد'), findsOneWidget);
    expect(find.text('طلبات الحالات المكلّف بها'), findsOneWidget);
    expect(find.text('الرسائل'), findsOneWidget);
    expect(find.text('الملف الشخصي'), findsOneWidget);
    expect(find.text('الإشعارات'), findsOneWidget);
    expect(find.text('بانتظار المراجعة'), findsOneWidget);
    expect(find.text('جلسات اليوم'), findsOneWidget);
    expect(find.text('الخطط العلاجية'), findsOneWidget);
    expect(find.text('تسجيل الخروج'), findsOneWidget);
  });

  testWidgets('Specialist Exercises screen renders English chrome', (
    tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
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
          specialistExercisesProvider.overrideWith((ref) {
            return _ImmediateSpecialistExercisesNotifier(
              ref,
              ref.watch(specialistFeaturesRepositoryProvider),
              SpecialistListState(
                isLoading: false,
                items: [
                  SpecialistExerciseItem(
                    id: 'ex-1',
                    title: 'Speech Drill A',
                    category: 'Speech Articulation',
                  ),
                ],
              ),
            );
          }),
          specialistNotificationsProvider.overrideWith((ref) {
            return _ImmediateSpecialistNotificationsNotifier(
              ref,
              ref.watch(specialistFeaturesRepositoryProvider),
              const SpecialistNotificationsState(),
            );
          }),
        ],
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const SpecialistExercisesScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Exercise Library'), findsOneWidget);
    expect(find.text('All'), findsOneWidget);
    expect(find.text('Speech Drill A'), findsOneWidget);
    expect(find.text('Speech Articulation'), findsWidgets);
  });

  testWidgets('Specialist Reports screen renders English filters', (
    tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
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
          specialistReportsProvider(null).overrideWith((ref) {
            return _ImmediateSpecialistReportsNotifier(
              ref,
              ref.watch(specialistReportsRepositoryProvider),
              null,
              const SpecialistReportsState(isLoading: false, reports: []),
            );
          }),
          specialistNotificationsProvider.overrideWith((ref) {
            return _ImmediateSpecialistNotificationsNotifier(
              ref,
              ref.watch(specialistFeaturesRepositoryProvider),
              const SpecialistNotificationsState(),
            );
          }),
        ],
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const SpecialistReportsScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('No reports found.'), findsOneWidget);
    expect(find.text('Weekly'), findsOneWidget);
    expect(find.text('Monthly'), findsOneWidget);
    expect(find.text('Assessment'), findsOneWidget);
    expect(find.text('AI Reports'), findsOneWidget);
    expect(find.text('Create'), findsOneWidget);
    expect(find.text('Generate'), findsOneWidget);
  });

  testWidgets('Specialist Sessions screen renders English title and tabs', (
    tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
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
          specialistSessionsProvider.overrideWith((ref) {
            return _ImmediateSpecialistSessionsNotifier(
              ref,
              ref.watch(specialistFeaturesRepositoryProvider),
              const SpecialistSessionsState(isLoading: false, sessions: []),
            );
          }),
          specialistSessionRequestsProvider.overrideWith((ref) {
            return _ImmediateSpecialistSessionRequestsNotifier(
              ref,
              ref.watch(sessionRequestsRepositoryProvider),
              ref.watch(authRepositoryProvider),
              const SpecialistSessionRequestsState(isLoading: false),
            );
          }),
          specialistNotificationsProvider.overrideWith((ref) {
            return _ImmediateSpecialistNotificationsNotifier(
              ref,
              ref.watch(specialistFeaturesRepositoryProvider),
              const SpecialistNotificationsState(),
            );
          }),
        ],
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const SpecialistSessionsScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Sessions'), findsWidgets);
    expect(find.text('Requests'), findsOneWidget);
    expect(find.text('Calendar'), findsOneWidget);
    expect(find.text('List'), findsOneWidget);
    expect(find.text('No sessions found.'), findsOneWidget);
    expect(find.text('Schedule Session'), findsOneWidget);
  });

  testWidgets('Specialist Patients screen keeps dynamic patient names', (
    tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
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
          specialistPatientsProvider.overrideWith((ref) {
            return _ImmediateSpecialistPatientsNotifier(
              ref,
              ref.watch(specialistFeaturesRepositoryProvider),
              SpecialistListState(
                isLoading: false,
                items: [
                  SpecialistPatientItem(
                    id: 'p-1',
                    name: 'Omar Ali',
                    diagnosis: 'Articulation delay',
                  ),
                ],
              ),
            );
          }),
          specialistNotificationsProvider.overrideWith((ref) {
            return _ImmediateSpecialistNotificationsNotifier(
              ref,
              ref.watch(specialistFeaturesRepositoryProvider),
              const SpecialistNotificationsState(),
            );
          }),
        ],
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const SpecialistPatientsScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Patients'), findsOneWidget);
    expect(find.text('Omar Ali'), findsOneWidget);
    expect(find.text('Articulation delay'), findsOneWidget);
  });
}
