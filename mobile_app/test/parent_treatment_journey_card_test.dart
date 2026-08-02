import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/models/parent_dashboard_models.dart';
import 'package:mobile_app/features/dashboard/widgets/parent_treatment_journey_card.dart';
import 'package:mobile_app/features/dashboard/widgets/parent_treatment_journey_helpers.dart';

ParentTreatmentJourney _sampleJourney({
  String trend = 'improving',
  double? currentScore = 78.5,
  double? scoreChange = 16.5,
  List<ParentTreatmentJourneyPoint>? chartPoints,
}) {
  return ParentTreatmentJourney(
    patientId: 'child-1',
    period: 'weekly',
    treatmentStart: DateTime(2026, 1, 15),
    treatmentEnd: DateTime(2026, 7, 30),
    startingScore: 62,
    currentScore: currentScore,
    scoreChange: scoreChange,
    overallImprovement: 26.61,
    trend: trend,
    dataSource: 'progress_snapshots',
    chartPoints: chartPoints ??
        [
          ParentTreatmentJourneyPoint(
            date: DateTime(2026, 1, 19),
            score: 62,
            exercisesCompleted: 3,
          ),
          ParentTreatmentJourneyPoint(
            date: DateTime(2026, 1, 26),
            score: 70,
            exercisesCompleted: 4,
          ),
          ParentTreatmentJourneyPoint(
            date: DateTime(2026, 2, 2),
            score: 78.5,
            exercisesCompleted: 5,
          ),
        ],
  );
}

Widget _wrap(Widget child, {Size size = const Size(360, 640)}) {
  return MaterialApp(
    home: MediaQuery(
      data: MediaQueryData(size: size),
      child: Scaffold(
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: child,
        ),
      ),
    ),
  );
}

void main() {
  group('ParentTreatmentJourneyCard', () {
    testWidgets('shows loading state', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const ParentTreatmentJourneyCard(
            journey: null,
            isLoading: true,
            onTap: _noop,
          ),
        ),
      );

      expect(find.text('Treatment Journey'), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('shows journey with multiple chart points', (tester) async {
      await tester.pumpWidget(
        _wrap(
          ParentTreatmentJourneyCard(
            journey: _sampleJourney(),
            isLoading: false,
            onTap: () {},
          ),
        ),
      );

      expect(find.text('Current Progress'), findsOneWidget);
      expect(find.text('79%'), findsOneWidget);
      expect(find.text('+17 points'), findsOneWidget);
      expect(find.text('Improving'), findsOneWidget);
      expect(
        find.byWidgetPredicate(
          (widget) =>
              widget is CustomPaint &&
              widget.painter is TreatmentJourneySparklinePainter,
        ),
        findsOneWidget,
      );
    });

    testWidgets('shows one chart point', (tester) async {
      await tester.pumpWidget(
        _wrap(
          ParentTreatmentJourneyCard(
            journey: _sampleJourney(
              currentScore: 72,
              chartPoints: [
                ParentTreatmentJourneyPoint(
                  date: DateTime(2026, 2, 2),
                  score: 72,
                  exercisesCompleted: 2,
                ),
              ],
            ),
            isLoading: false,
            onTap: () {},
          ),
        ),
      );

      expect(find.text('72%'), findsOneWidget);
      expect(
        find.byWidgetPredicate(
          (widget) =>
              widget is CustomPaint &&
              widget.painter is TreatmentJourneySparklinePainter,
        ),
        findsOneWidget,
      );
    });

    testWidgets('shows empty chart points state', (tester) async {
      await tester.pumpWidget(
        _wrap(
          ParentTreatmentJourneyCard(
            journey: _sampleJourney(chartPoints: const []),
            isLoading: false,
            onTap: () {},
          ),
        ),
      );

      expect(
        find.text('Progress will appear after exercises are reviewed.'),
        findsOneWidget,
      );
      expect(find.text('79%'), findsNothing);
    });

    testWidgets('shows improving trend', (tester) async {
      await tester.pumpWidget(
        _wrap(
          ParentTreatmentJourneyCard(
            journey: _sampleJourney(trend: 'improving'),
            isLoading: false,
            onTap: () {},
          ),
        ),
      );

      expect(find.text('Improving'), findsOneWidget);
    });

    testWidgets('shows stable trend', (tester) async {
      await tester.pumpWidget(
        _wrap(
          ParentTreatmentJourneyCard(
            journey: _sampleJourney(trend: 'stable'),
            isLoading: false,
            onTap: () {},
          ),
        ),
      );

      expect(find.text('Stable'), findsOneWidget);
    });

    testWidgets('maps declining trend to Needs Attention', (tester) async {
      await tester.pumpWidget(
        _wrap(
          ParentTreatmentJourneyCard(
            journey: _sampleJourney(trend: 'declining'),
            isLoading: false,
            onTap: () {},
          ),
        ),
      );

      expect(find.text('Needs Attention'), findsOneWidget);
    });

    testWidgets('shows error state and retry action', (tester) async {
      var retried = false;

      await tester.pumpWidget(
        _wrap(
          ParentTreatmentJourneyCard(
            journey: null,
            isLoading: false,
            error: 'Network failure',
            onTap: () {},
            onRetry: () => retried = true,
          ),
        ),
      );

      expect(find.text('Couldn\'t load treatment progress.'), findsOneWidget);
      expect(find.text('Network failure'), findsNothing);
      await tester.tap(find.text('Retry'));
      expect(retried, isTrue);
    });

    testWidgets('tap invokes navigation callback', (tester) async {
      var tapped = false;

      await tester.pumpWidget(
        _wrap(
          ParentTreatmentJourneyCard(
            journey: _sampleJourney(),
            isLoading: false,
            onTap: () => tapped = true,
          ),
        ),
      );

      await tester.tap(find.text('View details'));
      expect(tapped, isTrue);
    });

    testWidgets('does not overflow on a narrow screen', (tester) async {
      await tester.pumpWidget(
        _wrap(
          ParentTreatmentJourneyCard(
            journey: _sampleJourney(),
            isLoading: false,
            onTap: () {},
          ),
          size: const Size(320, 640),
        ),
      );

      expect(tester.takeException(), isNull);
      expect(find.text('Treatment Journey'), findsOneWidget);
    });
  });

  group('treatment journey helpers', () {
    test('trend label mapping', () {
      expect(treatmentJourneyTrendLabel('improving'), 'Improving');
      expect(treatmentJourneyTrendLabel('stable'), 'Stable');
      expect(treatmentJourneyTrendLabel('declining'), 'Needs Attention');
    });

    test('preview scores use last five points', () {
      final points = List.generate(
        7,
        (index) => ParentTreatmentJourneyPoint(
          date: DateTime(2026, 1, index + 1),
          score: index.toDouble(),
        ),
      );

      expect(
        treatmentJourneyPreviewScores(points),
        [2, 3, 4, 5, 6],
      );
    });
  });
}

void _noop() {}
