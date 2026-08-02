import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/core/locale/locale_provider.dart';
import 'package:mobile_app/features/auth/data/token_storage.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/dashboard/models/parent_dashboard_models.dart';
import 'package:mobile_app/features/dashboard/presentation/parent/parent_screens.dart';
import 'package:mobile_app/features/dashboard/providers/parent_dashboard_provider.dart';
import 'package:mobile_app/features/dashboard/providers/parent_features_provider.dart';
import 'package:mobile_app/features/exercises/presentation/parent_daily_tasks_screen.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

const _user = AuthUser(
  id: 'parent-1',
  fullName: 'Sarah Ahmed',
  email: 'parent@example.com',
  role: 'parent',
);

ParentChild _childWithAge() {
  final dob = DateTime(
    DateTime.now().year - 7,
    DateTime.now().month,
    DateTime.now().day,
  );
  return ParentChild(
    id: 'child-1',
    name: 'Omar Ali',
    dateOfBirth: dob,
    gender: 'male',
    progressPercent: 0.72,
  );
}

const _report = ParentReportItem(
  id: 'report-1',
  title: 'Weekly Progress Summary',
  reportType: 'weekly',
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
}

class _ImmediateParentExercisesNotifier extends ParentExercisesNotifier {
  _ImmediateParentExercisesNotifier(
    super.ref,
    super.repository,
    ParentExercisesState initialState,
  ) {
    state = initialState;
  }

  @override
  Future<void> loadForChild(String childId) async {}
}

Widget _parentTabsTestApp({
  required Locale locale,
  required Widget home,
  ParentDashboardState? dashboardState,
  ParentExercisesState? exercisesState,
}) {
  final resolvedDashboardState =
      dashboardState ??
      ParentDashboardState(
        isLoading: false,
        user: _user,
        children: [_childWithAge()],
        selectedPatientId: 'child-1',
        reports: const [_report],
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
      parentDashboardProvider.overrideWith((ref) {
        return _ImmediateParentDashboardNotifier(
          ref,
          ref.watch(parentDashboardRepositoryProvider),
          ref.watch(authRepositoryProvider),
          resolvedDashboardState,
        );
      }),
      parentExercisesProvider.overrideWith((ref) {
        return _ImmediateParentExercisesNotifier(
          ref,
          ref.watch(parentDashboardRepositoryProvider),
          exercisesState ??
              const ParentExercisesState(
                isLoading: false,
                dailyTasks: [],
                weeklyTasks: [],
                assignedExercises: [],
              ),
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
  testWidgets('Parent Children tab renders English labels', (tester) async {
    await tester.pumpWidget(
      _parentTabsTestApp(
        locale: const Locale('en'),
        home: const ParentChildrenScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Children'), findsWidgets);
    expect(find.text('Omar Ali'), findsOneWidget);
    expect(find.textContaining('yrs'), findsOneWidget);
    expect(find.textContaining('Male'), findsOneWidget);
    expect(find.textContaining('% progress'), findsOneWidget);
  });

  testWidgets('Parent Children tab renders Arabic labels', (tester) async {
    await tester.pumpWidget(
      _parentTabsTestApp(
        locale: const Locale('ar'),
        home: const ParentChildrenScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('الأطفال'), findsWidgets);
    expect(find.text('Omar Ali'), findsOneWidget);
    expect(find.textContaining('سنوات'), findsOneWidget);
    expect(find.textContaining('ذكر'), findsOneWidget);
    expect(find.textContaining('% تقدم'), findsOneWidget);
  });

  testWidgets('Parent Reports tab renders English labels', (tester) async {
    await tester.pumpWidget(
      _parentTabsTestApp(
        locale: const Locale('en'),
        home: const ParentReportsScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Reports'), findsWidgets);
    expect(find.text('Weekly Progress Summary'), findsOneWidget);
    expect(find.textContaining('Weekly'), findsWidgets);
    expect(find.text('Omar Ali'), findsWidgets);
  });

  testWidgets('Parent Reports tab renders Arabic empty state', (tester) async {
    await tester.pumpWidget(
      _parentTabsTestApp(
        locale: const Locale('ar'),
        home: const ParentReportsScreen(),
        dashboardState: ParentDashboardState(
          isLoading: false,
          user: _user,
          children: [_childWithAge()],
          selectedPatientId: 'child-1',
          reports: const [],
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('التقارير'), findsWidgets);
    expect(find.text('لا توجد تقارير متاحة لـ Omar Ali.'), findsOneWidget);
  });

  testWidgets('Parent Exercises tab renders English labels', (tester) async {
    await tester.pumpWidget(
      _parentTabsTestApp(
        locale: const Locale('en'),
        home: const ParentDailyTasksScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Exercises'), findsWidgets);
    expect(find.text('Exercises for Omar Ali'), findsOneWidget);
    expect(find.text('Daily'), findsOneWidget);
    expect(find.text('Weekly'), findsOneWidget);
    expect(find.text('Assigned'), findsOneWidget);
    expect(
      find.text('No daily tasks assigned for Omar Ali today.'),
      findsOneWidget,
    );
  });

  testWidgets('Parent Exercises tab renders Arabic labels', (tester) async {
    await tester.pumpWidget(
      _parentTabsTestApp(
        locale: const Locale('ar'),
        home: const ParentDailyTasksScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('التمارين'), findsWidgets);
    expect(find.text('تمارين Omar Ali'), findsOneWidget);
    expect(find.text('يومي'), findsOneWidget);
    expect(find.text('أسبوعي'), findsOneWidget);
    expect(find.text('التمارين المعيّنة'), findsOneWidget);
    expect(
      find.text('لا توجد مهام يومية معيّنة لـ Omar Ali اليوم.'),
      findsOneWidget,
    );
  });
}
