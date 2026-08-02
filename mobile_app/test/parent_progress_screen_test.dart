import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/data/parent_dashboard_repository.dart';
import 'package:mobile_app/features/dashboard/models/parent_dashboard_models.dart';
import 'package:mobile_app/features/dashboard/presentation/parent/parent_progress_screen.dart';
import 'package:mobile_app/features/dashboard/providers/parent_dashboard_provider.dart';
import 'package:mobile_app/features/dashboard/providers/parent_features_provider.dart';
import 'package:mobile_app/features/dashboard/widgets/parent_treatment_journey_chart.dart';

class _RecordingProgressNotifier extends ParentProgressNotifier {
  _RecordingProgressNotifier(
    super.repository,
    super.childId, {
    required ParentProgressState initialState,
  }) {
    state = initialState;
  }

  final periodChanges = <String>[];
  var loadCalls = 0;

  @override
  Future<void> initialize() async {}

  @override
  Future<void> changeJourneyPeriod(String patientId, String period) async {
    periodChanges.add(period);
    state = state.copyWith(selectedJourneyPeriod: period);
  }

  @override
  Future<void> loadTreatmentJourney(
    String patientId, {
    String? period,
  }) async {
    loadCalls += 1;
    state = state.copyWith(isJourneyLoading: false, journeyError: null);
  }
}

ParentTreatmentJourney _journey({
  String trend = 'improving',
  List<ParentTreatmentJourneyPoint>? chartPoints,
}) {
  return ParentTreatmentJourney(
    patientId: 'child-1',
    period: 'weekly',
    treatmentStart: DateTime(2026, 1, 15),
    treatmentEnd: DateTime(2026, 7, 30),
    startingScore: 62,
    currentScore: 79,
    scoreChange: 17,
    overallImprovement: 27.4,
    trend: trend,
    dataSource: 'progress_snapshots',
    chartPoints: chartPoints ??
        [
          ParentTreatmentJourneyPoint(
            date: DateTime(2026, 7, 6),
            score: 62,
            exercisesCompleted: 3,
          ),
          ParentTreatmentJourneyPoint(
            date: DateTime(2026, 7, 13),
            score: 70,
            exercisesCompleted: 4,
            improvementPercentage: 12.9,
          ),
          ParentTreatmentJourneyPoint(
            date: DateTime(2026, 7, 20),
            score: 79,
            exercisesCompleted: 5,
            improvementPercentage: 12.9,
          ),
        ],
  );
}

Widget _buildScreen({
  required ParentProgressState progressState,
  _RecordingProgressNotifier? notifier,
}) {
  final dio = Dio();
  final repository = ParentDashboardRepository(dio);
  final progressNotifier = notifier ??
      _RecordingProgressNotifier(
        repository,
        'child-1',
        initialState: progressState,
      );

  return ProviderScope(
    overrides: [
      parentDashboardRepositoryProvider.overrideWithValue(repository),
      parentProgressProvider('child-1').overrideWith((ref) => progressNotifier),
    ],
    child: const MaterialApp(
      home: ParentProgressScreen(childId: 'child-1'),
    ),
  );
}

void main() {
  group('ParentProgressScreen', () {
    testWidgets('weekly period selected by default', (tester) async {
      await tester.pumpWidget(
        _buildScreen(
          progressState: ParentProgressState(
            selectedJourneyPeriod: 'weekly',
            treatmentJourney: _journey(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Weekly'), findsOneWidget);
      expect(find.text('Started At'), findsOneWidget);
      expect(find.text('62%'), findsOneWidget);
      expect(find.text('Current Progress'), findsOneWidget);
      expect(find.text('79%'), findsWidgets);
    });

    testWidgets('changing to monthly calls provider method', (tester) async {
      final notifier = _RecordingProgressNotifier(
        ParentDashboardRepository(Dio()),
        'child-1',
        initialState: ParentProgressState(
          selectedJourneyPeriod: 'weekly',
          treatmentJourney: _journey(),
        ),
      );

      await tester.pumpWidget(
        _buildScreen(
          progressState: notifier.state,
          notifier: notifier,
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Monthly'));
      await tester.pumpAndSettle();

      expect(notifier.periodChanges, ['monthly']);
    });

    testWidgets('changing to full treatment calls full period', (tester) async {
      final notifier = _RecordingProgressNotifier(
        ParentDashboardRepository(Dio()),
        'child-1',
        initialState: ParentProgressState(
          selectedJourneyPeriod: 'weekly',
          treatmentJourney: _journey(),
        ),
      );

      await tester.pumpWidget(
        _buildScreen(progressState: notifier.state, notifier: notifier),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Full Treatment'));
      await tester.pumpAndSettle();

      expect(notifier.periodChanges, ['full']);
    });

    testWidgets('null scores display dash', (tester) async {
      await tester.pumpWidget(
        _buildScreen(
          progressState: ParentProgressState(
            treatmentJourney: ParentTreatmentJourney(
              patientId: 'child-1',
              period: 'weekly',
              chartPoints: const [],
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('—'), findsWidgets);
    });

    testWidgets('declining trend maps to Needs Attention', (tester) async {
      await tester.pumpWidget(
        _buildScreen(
          progressState: ParentProgressState(
            treatmentJourney: _journey(trend: 'declining'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Needs Attention'), findsOneWidget);
    });

    testWidgets('stable trend is shown', (tester) async {
      await tester.pumpWidget(
        _buildScreen(
          progressState: ParentProgressState(
            treatmentJourney: _journey(trend: 'stable'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Stable'), findsOneWidget);
    });

    testWidgets('improving trend is shown', (tester) async {
      await tester.pumpWidget(
        _buildScreen(
          progressState: ParentProgressState(
            treatmentJourney: _journey(trend: 'improving'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Improving'), findsOneWidget);
      expect(find.text('Progress is moving upward'), findsOneWidget);
    });

    testWidgets('multiple chart points render chart', (tester) async {
      await tester.pumpWidget(
        _buildScreen(
          progressState: ParentProgressState(treatmentJourney: _journey()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(ParentTreatmentJourneyChart), findsOneWidget);
      expect(find.text('Score'), findsOneWidget);
    });

    testWidgets('single chart point renders safely', (tester) async {
      await tester.pumpWidget(
        _buildScreen(
          progressState: ParentProgressState(
            treatmentJourney: _journey(
              chartPoints: [
                ParentTreatmentJourneyPoint(
                  date: DateTime(2026, 7, 20),
                  score: 72,
                  exercisesCompleted: 2,
                ),
              ],
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(ParentTreatmentJourneyChart), findsOneWidget);
      expect(find.text('72%'), findsWidgets);
    });

    testWidgets('empty chart state message', (tester) async {
      await tester.pumpWidget(
        _buildScreen(
          progressState: const ParentProgressState(
            treatmentJourney: ParentTreatmentJourney(
              patientId: 'child-1',
              period: 'weekly',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('No treatment progress yet'), findsOneWidget);
    });

    testWidgets('loading state shows summary skeleton', (tester) async {
      await tester.pumpWidget(
        _buildScreen(
          progressState: const ParentProgressState(
            isJourneyLoading: true,
          ),
        ),
      );
      await tester.pump();

      expect(find.text('Started At'), findsNothing);
      expect(find.text('Weekly'), findsOneWidget);
    });

    testWidgets('error and retry calls journey load', (tester) async {
      final notifier = _RecordingProgressNotifier(
        ParentDashboardRepository(Dio()),
        'child-1',
        initialState: const ParentProgressState(
          journeyError: 'hidden',
          selectedJourneyPeriod: 'monthly',
        ),
      );

      await tester.pumpWidget(
        _buildScreen(progressState: notifier.state, notifier: notifier),
      );
      await tester.pumpAndSettle();

      expect(
        find.text('Couldn\'t load the treatment journey.'),
        findsOneWidget,
      );
      await tester.tap(find.text('Retry'));
      await tester.pumpAndSettle();

      expect(notifier.loadCalls, 1);
    });

    testWidgets('treatment date range is shown', (tester) async {
      await tester.pumpWidget(
        _buildScreen(
          progressState: ParentProgressState(treatmentJourney: _journey()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Treatment period'), findsOneWidget);
      expect(find.text('Jan 15, 2026 – Jul 30, 2026'), findsOneWidget);
    });

    testWidgets('no overflow on narrow screen', (tester) async {
      await tester.binding.setSurfaceSize(const Size(320, 800));
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(
        _buildScreen(
          progressState: ParentProgressState(treatmentJourney: _journey()),
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.takeException(), isNull);
      expect(
        find.text('See how your child\'s progress has changed over time'),
        findsOneWidget,
      );
    });

    testWidgets('detailed progress section remains available', (tester) async {
      await tester.pumpWidget(
        _buildScreen(
          progressState: ParentProgressState(
            treatmentJourney: _journey(),
            weekly: const [
              ParentProgressSnapshot(
                period: 'weekly',
                exercisesCompleted: 4,
                averagePerformance: 80,
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Detailed Progress'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.textContaining('4 completed'),
        200,
      );
      expect(find.textContaining('4 completed'), findsOneWidget);
    });
  });
}
