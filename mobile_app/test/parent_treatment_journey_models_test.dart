import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/models/parent_dashboard_models.dart';

void main() {
  group('ParentTreatmentJourneyPoint.fromMap', () {
    test('parses numeric score as int', () {
      final point = ParentTreatmentJourneyPoint.fromMap({
        'date': '2026-01-19',
        'period_start': '2026-01-13',
        'period_end': '2026-01-19',
        'score': 62,
        'exercises_completed': 3,
        'improvement_percentage': null,
      });

      expect(point.score, 62);
      expect(point.exercisesCompleted, 3);
      expect(point.improvementPercentage, isNull);
    });

    test('parses numeric score as string', () {
      final point = ParentTreatmentJourneyPoint.fromMap({
        'date': '2026-01-19',
        'score': '62.00',
        'exercises_completed': '3',
        'improvement_percentage': '10.48',
      });

      expect(point.score, 62);
      expect(point.exercisesCompleted, 3);
      expect(point.improvementPercentage, 10.48);
    });

    test('throws for missing score', () {
      expect(
        () => ParentTreatmentJourneyPoint.fromMap({
          'date': '2026-01-19',
        }),
        throwsFormatException,
      );
    });
  });

  group('ParentTreatmentJourney.fromMap', () {
    test('parses full valid response with numeric values', () {
      final journey = ParentTreatmentJourney.fromMap({
        'patient_id': 'patient-1',
        'period': 'weekly',
        'treatment_start': '2026-01-15',
        'treatment_end': '2026-07-30',
        'starting_score': 62,
        'current_score': 78.5,
        'score_change': 16.5,
        'overall_improvement': 26.61,
        'trend': 'improving',
        'data_source': 'progress_snapshots',
        'chart_points': [
          {
            'date': '2026-01-19',
            'period_start': '2026-01-13',
            'period_end': '2026-01-19',
            'score': 62,
            'exercises_completed': 3,
          },
          {
            'date': '2026-02-02',
            'period_start': '2026-01-27',
            'period_end': '2026-02-02',
            'score': '78.50',
            'exercises_completed': '5',
            'improvement_percentage': '14.60',
          },
        ],
      });

      expect(journey.patientId, 'patient-1');
      expect(journey.period, 'weekly');
      expect(journey.startingScore, 62);
      expect(journey.currentScore, 78.5);
      expect(journey.scoreChange, 16.5);
      expect(journey.overallImprovement, 26.61);
      expect(journey.trend, 'improving');
      expect(journey.dataSource, 'progress_snapshots');
      expect(journey.chartPoints, hasLength(2));
      expect(journey.hasData, isTrue);
      expect(journey.chartPoints.last.score, 78.5);
    });

    test('parses empty chart points safely', () {
      final journey = ParentTreatmentJourney.fromMap({
        'patient_id': 'patient-1',
        'period': 'monthly',
        'treatment_start': '2026-01-15',
        'treatment_end': '2026-07-30',
        'starting_score': null,
        'current_score': null,
        'score_change': null,
        'overall_improvement': null,
        'trend': 'stable',
        'data_source': 'exercise_reviews',
        'chart_points': [],
      });

      expect(journey.chartPoints, isEmpty);
      expect(journey.hasData, isFalse);
      expect(journey.startingScore, isNull);
      expect(journey.currentScore, isNull);
      expect(journey.trend, 'stable');
    });

    test('parses nullable summary scores as strings', () {
      final journey = ParentTreatmentJourney.fromMap({
        'patient_id': 'patient-1',
        'starting_score': '70.00',
        'current_score': '85.00',
        'score_change': '15.00',
        'overall_improvement': '21.43',
      });

      expect(journey.startingScore, 70);
      expect(journey.currentScore, 85);
      expect(journey.scoreChange, 15);
      expect(journey.overallImprovement, 21.43);
    });

    test('defaults missing optional fields', () {
      final journey = ParentTreatmentJourney.fromMap({});

      expect(journey.patientId, isEmpty);
      expect(journey.period, 'weekly');
      expect(journey.trend, 'stable');
      expect(journey.dataSource, isEmpty);
      expect(journey.chartPoints, isEmpty);
      expect(journey.treatmentStart, isNull);
      expect(journey.treatmentEnd, isNull);
    });

    test('skips invalid chart items without crashing', () {
      final journey = ParentTreatmentJourney.fromMap({
        'patient_id': 'patient-1',
        'chart_points': [
          {'date': '2026-01-19', 'score': 70},
          {'date': '2026-01-26'},
          'invalid',
          {
            'date': '2026-02-02',
            'score': '80.00',
            'exercises_completed': 2,
          },
        ],
      });

      expect(journey.chartPoints, hasLength(2));
      expect(journey.chartPoints.first.score, 70);
      expect(journey.chartPoints.last.score, 80);
    });
  });
}
