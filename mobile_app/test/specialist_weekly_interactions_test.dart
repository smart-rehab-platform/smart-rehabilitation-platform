import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/locale/locale_provider.dart';
import 'package:mobile_app/features/auth/data/auth_repository.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/dashboard/data/specialist_dashboard_repository.dart';
import 'package:mobile_app/features/dashboard/data/specialist_features_repository.dart';
import 'package:mobile_app/features/dashboard/models/specialist_dashboard_models.dart';
import 'package:mobile_app/features/dashboard/models/specialist_weekly_interactions_models.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist_dashboard_screen.dart';
import 'package:mobile_app/features/dashboard/providers/specialist_dashboard_provider.dart';
import 'package:mobile_app/features/dashboard/providers/specialist_features_provider.dart';
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

class _ImmediateSpecialistDashboardNotifier
    extends SpecialistDashboardNotifier {
  _ImmediateSpecialistDashboardNotifier(
    Ref ref,
    SpecialistDashboardRepository repository,
    SpecialistFeaturesRepository featuresRepository,
    AuthRepository authRepository,
    SpecialistDashboardState initialState,
  ) : super(ref, repository, featuresRepository, authRepository) {
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

Widget _weeklyInteractionsTestApp({
  SpecialistDashboardState? dashboardState,
}) {
  final resolvedState =
      dashboardState ??
      const SpecialistDashboardState(
        isLoading: false,
        hasAssignedPatients: true,
        overview: SpecialistOverviewData(activeCases: 1),
      );

  return ProviderScope(
    overrides: [
      localeProvider.overrideWith((ref) {
        final notifier = LocaleNotifier(const TokenStorage());
        notifier.state = const Locale('en');
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
      specialistDashboardProvider.overrideWith((ref) {
        return _ImmediateSpecialistDashboardNotifier(
          ref,
          ref.watch(specialistDashboardRepositoryProvider),
          ref.watch(specialistFeaturesRepositoryForDashboardProvider),
          ref.watch(authRepositoryProvider),
          resolvedState,
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
      locale: const Locale('en'),
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: const SpecialistDashboardScreen(),
    ),
  );
}

SpecialistWeeklyInteractionsData _sampleWeek({required int weekOffset}) {
  return SpecialistWeeklyInteractionsData(
    weekOffset: weekOffset,
    totalUniquePatients: 1,
    days: [
      SpecialistWeeklyInteractionDay(
        date: DateTime(2026, 8, 4),
        patients: const [
          SpecialistWeeklyInteractionPatient(id: 'patient-1', name: 'Omar Hassan'),
        ],
      ),
      SpecialistWeeklyInteractionDay(
        date: DateTime(2026, 8, 5),
        patients: const [
          SpecialistWeeklyInteractionPatient(id: 'patient-1', name: 'Omar Hassan'),
        ],
      ),
    ],
  );
}

void main() {
  group('normalizeWeeklyInteractionsWeekOffset', () {
    test('preserves signed week offsets', () {
      expect(normalizeWeeklyInteractionsWeekOffset(0), 0);
      expect(normalizeWeeklyInteractionsWeekOffset(-1), -1);
      expect(normalizeWeeklyInteractionsWeekOffset(-2), -2);
      expect(normalizeWeeklyInteractionsWeekOffset(1), 1);
      expect(normalizeWeeklyInteractionsWeekOffset(-1), isNot(1));
    });
  });

  group('SpecialistWeeklyInteractionsData', () {
    test('counts unique patients per day and across the week', () {
      final data = SpecialistWeeklyInteractionsData(
        weekOffset: 0,
        days: [
          SpecialistWeeklyInteractionDay(
            date: DateTime(2026, 8, 4),
            patients: const [
              SpecialistWeeklyInteractionPatient(id: 'p1', name: 'Omar Hassan'),
              SpecialistWeeklyInteractionPatient(id: 'p2', name: 'Lina Ahmad'),
            ],
          ),
          SpecialistWeeklyInteractionDay(
            date: DateTime(2026, 8, 5),
            patients: const [
              SpecialistWeeklyInteractionPatient(id: 'p1', name: 'Omar Hassan'),
            ],
          ),
        ],
      );

      expect(data.days.first.count, 2);
      expect(data.days[1].count, 1);
      expect(data.weeklyUniquePatientCount, 2);
    });

    test('uses API totalUniquePatients when provided', () {
      final data = SpecialistWeeklyInteractionsData(
        weekOffset: -1,
        totalUniquePatients: 5,
        days: const [],
      );

      expect(data.weeklyUniquePatientCount, 5);
    });

    test('empty week factory shifts by signed weekOffset', () {
      final previousWeek = SpecialistWeeklyInteractionsData.empty(weekOffset: -1);
      final nextWeek = SpecialistWeeklyInteractionsData.empty(weekOffset: 1);
      final currentWeek = SpecialistWeeklyInteractionsData.empty(weekOffset: 0);

      expect(previousWeek.days.first.date.isBefore(currentWeek.days.first.date), isTrue);
      expect(nextWeek.days.first.date.isAfter(currentWeek.days.first.date), isTrue);
    });
  });

  group('Weekly interactions card states', () {
    testWidgets('loading state hides empty-week summary', (tester) async {
      await tester.pumpWidget(
        _weeklyInteractionsTestApp(
          dashboardState: const SpecialistDashboardState(
            isLoading: false,
            hasAssignedPatients: true,
            overview: SpecialistOverviewData(activeCases: 1),
            isWeeklyInteractionsLoading: true,
          ),
        ),
      );
      await tester.pump();

      expect(find.textContaining('unique patients this week'), findsNothing);
    });

    testWidgets('successful empty week shows zero summary', (tester) async {
      await tester.pumpWidget(
        _weeklyInteractionsTestApp(
          dashboardState: SpecialistDashboardState(
            isLoading: false,
            hasAssignedPatients: true,
            overview: const SpecialistOverviewData(activeCases: 1),
            weeklyInteractions: SpecialistWeeklyInteractionsData(
              weekOffset: 0,
              totalUniquePatients: 0,
              days: List.generate(
                7,
                (index) => SpecialistWeeklyInteractionDay(
                  date: DateTime(2026, 8, 4 + index),
                  patients: const [],
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('0 unique patients this week'), findsOneWidget);
    });

    testWidgets('error state shows retry without empty-week summary', (tester) async {
      await tester.pumpWidget(
        _weeklyInteractionsTestApp(
          dashboardState: const SpecialistDashboardState(
            isLoading: false,
            hasAssignedPatients: true,
            overview: SpecialistOverviewData(activeCases: 1),
            weeklyInteractionsErrorMessage: 'failed',
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Retry'), findsOneWidget);
      expect(find.textContaining('unique patients this week'), findsNothing);
    });

    testWidgets('resolved week data renders summary for previous week', (
      tester,
    ) async {
      await tester.pumpWidget(
        _weeklyInteractionsTestApp(
          dashboardState: SpecialistDashboardState(
            isLoading: false,
            hasAssignedPatients: true,
            overview: const SpecialistOverviewData(activeCases: 1),
            weeklyInteractions: _sampleWeek(weekOffset: -1),
            weeklyInteractionsWeekOffset: -1,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('1 unique patient this week'), findsOneWidget);
    });
  });
}
