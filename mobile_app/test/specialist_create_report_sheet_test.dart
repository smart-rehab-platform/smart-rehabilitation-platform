import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/auth/models/auth_user.dart';
import 'package:mobile_app/features/auth/providers/auth_provider.dart';
import 'package:mobile_app/features/dashboard/models/specialist_ai_report_generation.dart';
import 'package:mobile_app/features/dashboard/models/specialist_feature_models.dart';
import 'package:mobile_app/features/dashboard/models/specialist_regular_report_creation.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_create_report_sheet.dart';
import 'package:mobile_app/features/dashboard/providers/specialist_features_provider.dart';
import 'package:mobile_app/features/dashboard/providers/specialist_reports_provider.dart';
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

class _RecordingReportsNotifier extends SpecialistReportsNotifier {
  _RecordingReportsNotifier(super.ref, super.repository, super.patientId);

  final List<({
    String patientId,
    SpecialistRegularReportType reportType,
    String? title,
    String? summary,
  })> createCalls = [];

  bool createResult = true;
  String? errorToSet;

  @override
  Future<void> initialize() async {}

  @override
  Future<void> refresh() async {}

  @override
  Future<bool> generateAiReport({
    required String patientId,
    required SpecialistAiReportType type,
    required DateTime periodStart,
    required DateTime periodEnd,
  }) async {
    fail('AI generation must not be called from Create Report');
  }

  @override
  Future<bool> createRegularReport({
    required String patientId,
    required SpecialistRegularReportType reportType,
    String? title,
    String? summary,
  }) async {
    if (state.isCreatingRegularReport) {
      return false;
    }
    createCalls.add((
      patientId: patientId,
      reportType: reportType,
      title: title,
      summary: summary,
    ));
    if (errorToSet != null) {
      state = state.copyWith(regularCreationError: errorToSet);
      return false;
    }
    return createResult;
  }
}

class _Harness extends ConsumerWidget {
  const _Harness();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: TextButton(
        onPressed: () => showSpecialistCreateReportSheet(
          context: context,
          ref: ref,
        ),
        child: const Text('open'),
      ),
    );
  }
}

List<Override> _overrides({
  required _RecordingReportsNotifier Function(Ref) reportsBuilder,
  List<SpecialistPatientItem> patients = const [
    SpecialistPatientItem(id: 'patient-1', name: 'Omar'),
  ],
}) {
  return [
    authProvider.overrideWith((ref) {
      return _ImmediateAuthNotifier(
        ref.watch(authRepositoryProvider),
        ref.watch(tokenStorageProvider),
        const AuthState(
          isInitializing: false,
          token: 'test-token',
          user: AuthUser(
            id: 'specialist-1',
            fullName: 'Dr. Test',
            email: 'specialist@example.com',
            role: 'specialist',
          ),
        ),
      );
    }),
    specialistPatientsProvider.overrideWith((ref) {
      return _ImmediateSpecialistPatientsNotifier(
        ref,
        ref.watch(specialistFeaturesRepositoryProvider),
        SpecialistListState(isLoading: false, items: patients),
      );
    }),
    specialistReportsProvider(null).overrideWith(reportsBuilder),
  ];
}

Future<_RecordingReportsNotifier> _openSheet(
  WidgetTester tester, {
  required _RecordingReportsNotifier Function(Ref) reportsBuilder,
  List<SpecialistPatientItem>? patients,
}) async {
  tester.view.physicalSize = const Size(800, 1400);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);

  late _RecordingReportsNotifier notifier;
  await tester.pumpWidget(
    ProviderScope(
      overrides: _overrides(
        reportsBuilder: (ref) {
          notifier = reportsBuilder(ref);
          return notifier;
        },
        patients: patients ??
            const [SpecialistPatientItem(id: 'patient-1', name: 'Omar')],
      ),
      child: const MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: _Harness(),
      ),
    ),
  );
  await tester.tap(find.text('open'));
  await tester.pumpAndSettle();
  return notifier;
}

Future<void> _selectPatient(WidgetTester tester, {String name = 'Omar'}) async {
  await tester.tap(find.text('Select patient'));
  await tester.pumpAndSettle();
  await tester.tap(find.text(name));
  await tester.pumpAndSettle();
}

Future<void> _submitCreate(WidgetTester tester) async {
  final submit = find.widgetWithText(ElevatedButton, 'Create Report');
  await tester.ensureVisible(submit);
  await tester.pumpAndSettle();
  await tester.tap(submit);
  await tester.pumpAndSettle();
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    final binding = TestWidgetsFlutterBinding.instance;
    binding.platformDispatcher.views.first.physicalSize = const Size(800, 1400);
    binding.platformDispatcher.views.first.devicePixelRatio = 1.0;
  });

  tearDown(() {
    final binding = TestWidgetsFlutterBinding.instance;
    binding.platformDispatcher.views.first.resetPhysicalSize();
    binding.platformDispatcher.views.first.resetDevicePixelRatio();
  });

  testWidgets('A Create Weekly invokes regular create with weekly', (
    tester,
  ) async {
    final notifier = await _openSheet(
      tester,
      reportsBuilder: (ref) => _RecordingReportsNotifier(
        ref,
        ref.watch(specialistReportsRepositoryProvider),
        null,
      ),
    );

    await _selectPatient(tester);
    await _submitCreate(tester);

    expect(notifier.createCalls, hasLength(1));
    expect(notifier.createCalls.single.patientId, 'patient-1');
    expect(
      notifier.createCalls.single.reportType,
      SpecialistRegularReportType.weekly,
    );
    expect(find.text('Report created successfully.'), findsOneWidget);
  });

  testWidgets('B Monthly maps correctly', (tester) async {
    final notifier = await _openSheet(
      tester,
      reportsBuilder: (ref) => _RecordingReportsNotifier(
        ref,
        ref.watch(specialistReportsRepositoryProvider),
        null,
      ),
    );

    await _selectPatient(tester);
    await tester.tap(find.text('Monthly'));
    await tester.pump();
    await _submitCreate(tester);

    expect(
      notifier.createCalls.single.reportType,
      SpecialistRegularReportType.monthly,
    );
  });

  testWidgets('C Assessment maps correctly', (tester) async {
    final notifier = await _openSheet(
      tester,
      reportsBuilder: (ref) => _RecordingReportsNotifier(
        ref,
        ref.watch(specialistReportsRepositoryProvider),
        null,
      ),
    );

    await _selectPatient(tester);
    await tester.tap(find.text('Assessment'));
    await tester.pump();
    await _submitCreate(tester);

    expect(
      notifier.createCalls.single.reportType,
      SpecialistRegularReportType.assessment,
    );
  });

  testWidgets('D Progress maps correctly', (tester) async {
    final notifier = await _openSheet(
      tester,
      reportsBuilder: (ref) => _RecordingReportsNotifier(
        ref,
        ref.watch(specialistReportsRepositoryProvider),
        null,
      ),
    );

    await _selectPatient(tester);
    await tester.tap(find.text('Progress'));
    await tester.pump();
    await _submitCreate(tester);

    expect(
      notifier.createCalls.single.reportType,
      SpecialistRegularReportType.progress,
    );
  });

  testWidgets('E Title and summary values pass through', (tester) async {
    final notifier = await _openSheet(
      tester,
      reportsBuilder: (ref) => _RecordingReportsNotifier(
        ref,
        ref.watch(specialistReportsRepositoryProvider),
        null,
      ),
    );

    await _selectPatient(tester);
    await tester.enterText(find.byType(TextField).at(0), 'Stored title');
    await tester.enterText(find.byType(TextField).at(1), 'Manual summary');
    await _submitCreate(tester);

    expect(notifier.createCalls.single.title, 'Stored title');
    expect(notifier.createCalls.single.summary, 'Manual summary');
  });

  testWidgets('I backend error stays on the sheet for retry', (tester) async {
    final notifier = await _openSheet(
      tester,
      reportsBuilder: (ref) {
        return _RecordingReportsNotifier(
          ref,
          ref.watch(specialistReportsRepositoryProvider),
          null,
        )..errorToSet = 'You do not have access to this patient.';
      },
    );

    await _selectPatient(tester);
    await tester.enterText(find.byType(TextField).at(0), 'Keep me');
    await _submitCreate(tester);

    expect(find.text('Create a clinical report for one of your assigned patients.'), findsOneWidget);
    expect(find.text('You do not have access to this patient.'), findsOneWidget);
    expect(find.text('Keep me'), findsOneWidget);
    expect(find.text('Report created successfully.'), findsNothing);
    expect(notifier.createCalls, hasLength(1));
  });

  testWidgets('J Create Report does not call AI generation', (tester) async {
    final notifier = await _openSheet(
      tester,
      reportsBuilder: (ref) => _RecordingReportsNotifier(
        ref,
        ref.watch(specialistReportsRepositoryProvider),
        null,
      ),
    );

    await _selectPatient(tester);
    await _submitCreate(tester);

    expect(notifier.createCalls, hasLength(1));
    expect(notifier.state.generationError, isNull);
    expect(notifier.state.isGeneratingAiReport, isFalse);
  });
}
