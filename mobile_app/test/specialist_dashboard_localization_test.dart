import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/locale/locale_provider.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/auth/data/auth_repository.dart';
import 'package:mobile_app/features/dashboard/data/specialist_dashboard_repository.dart';
import 'package:mobile_app/features/dashboard/data/specialist_features_repository.dart';
import 'package:mobile_app/features/dashboard/models/specialist_dashboard_models.dart';
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

Widget _specialistDashboardTestApp({
  Locale locale = const Locale('en'),
  SpecialistDashboardState? dashboardState,
}) {
  final resolvedState =
      dashboardState ??
      const SpecialistDashboardState(
        isLoading: false,
        hasAssignedPatients: true,
        overview: SpecialistOverviewData(
          activeCases: 3,
          pendingReviews: 2,
          upcomingSessions: 1,
          treatmentPlans: 4,
        ),
        pendingReviews: [
          SpecialistPendingReview(
            id: 'review-1',
            patientName: 'Omar Ali',
            exerciseTitle: 'Speech Drill A',
          ),
        ],
        progress: [SpecialistPatientProgress(name: 'Omar Ali', progress: 0.72)],
      );

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
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: const SpecialistDashboardScreen(),
    ),
  );
}

void main() {
  testWidgets('Specialist dashboard renders English labels', (tester) async {
    await tester.pumpWidget(_specialistDashboardTestApp());
    await tester.pumpAndSettle();

    expect(find.text('Welcome back, Dr. Layla Hassan'), findsOneWidget);
    expect(find.text('Overview'), findsOneWidget);
    expect(find.text('Active Cases'), findsOneWidget);
    expect(find.text('Pending Reviews'), findsWidgets);
    expect(find.text("Today's Sessions"), findsOneWidget);
    expect(find.text('Treatment Plans'), findsOneWidget);
    expect(find.text('THIS WEEK'), findsOneWidget);
    expect(find.text('Recent Patient Progress'), findsOneWidget);
    expect(find.text('Omar Ali'), findsWidgets);
    expect(find.textContaining('Speech Drill A'), findsOneWidget);
  });

  testWidgets('Specialist dashboard renders Arabic labels', (tester) async {
    await tester.pumpWidget(
      _specialistDashboardTestApp(locale: const Locale('ar')),
    );
    await tester.pumpAndSettle();

    expect(find.text('مرحباً بعودتك، Dr. Layla Hassan'), findsOneWidget);
    expect(find.text('نظرة عامة'), findsOneWidget);
    expect(find.text('الحالات النشطة'), findsOneWidget);
    expect(find.text('بانتظار المراجعة'), findsWidgets);
    expect(find.text('جلسات اليوم'), findsOneWidget);
    expect(find.text('الخطط العلاجية'), findsOneWidget);
    expect(find.text('هذا الأسبوع'), findsOneWidget);
    expect(find.text('تقدم المرضى الأخير'), findsOneWidget);
    expect(find.text('Omar Ali'), findsWidgets);
    expect(find.textContaining('Speech Drill A'), findsOneWidget);
  });

  testWidgets('Specialist dashboard renders Arabic empty states', (
    tester,
  ) async {
    await tester.pumpWidget(
      _specialistDashboardTestApp(
        locale: const Locale('ar'),
        dashboardState: const SpecialistDashboardState(
          isLoading: false,
          hasAssignedPatients: false,
          overview: SpecialistOverviewData(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('لا توجد حالات نشطة معيّنة بعد.'), findsOneWidget);
    expect(find.text('لا توجد مراجعات معلّقة حالياً.'), findsOneWidget);
    expect(find.text('لا تتوفر بيانات تقدم بعد.'), findsOneWidget);
  });
}
