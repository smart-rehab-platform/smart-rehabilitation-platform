import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/models/parent_dashboard_models.dart';
import 'package:mobile_app/features/dashboard/widgets/parent_treatment_journey_helpers.dart';

void main() {
  group('treatment journey helpers', () {
    test('formatTreatmentJourneyPercent handles null and values', () {
      expect(formatTreatmentJourneyPercent(null), '—');
      expect(formatTreatmentJourneyPercent(62), '62%');
      expect(formatTreatmentJourneyPercent(62.4), '62%');
    });

    test('formatTreatmentJourneyScoreChange formats points', () {
      expect(formatTreatmentJourneyScoreChange(null), '—');
      expect(formatTreatmentJourneyScoreChange(16.5), '+17 points');
      expect(formatTreatmentJourneyScoreChange(-3.2), '-3 points');
    });

    test('clampTreatmentJourneyScore clamps to 0-100', () {
      expect(clampTreatmentJourneyScore(-5), 0);
      expect(clampTreatmentJourneyScore(120), 100);
      expect(clampTreatmentJourneyScore(72), 72);
    });

    test('calculateXAxisLabelIndices spaces labels', () {
      expect(calculateXAxisLabelIndices(2), [0, 1]);
      expect(calculateXAxisLabelIndices(10), [0, 3, 6, 9]);
      expect(calculateXAxisLabelIndices(0), isEmpty);
    });

    test('formatChartXAxisLabel varies by period', () {
      final date = DateTime(2026, 7, 20);
      expect(formatChartXAxisLabel(date, 'weekly'), 'Jul 20');
      expect(formatChartXAxisLabel(date, 'monthly'), 'Jul');
      expect(formatChartXAxisLabel(date, 'full'), 'Jul 26');
    });

    test('findNearestChartPointIndex selects closest point', () {
      const size = Size(200, 120);
      final scores = [50.0, 70.0, 90.0];
      final middle = computeChartPointPositions(size: size, scores: scores)[1];

      final index = findNearestChartPointIndex(
        localPosition: middle,
        size: size,
        scores: scores,
      );

      expect(index, 1);
    });

    test('buildTreatmentJourneyInterpretation maps trends', () {
      final improving = buildTreatmentJourneyInterpretation(
        ParentTreatmentJourney(
          patientId: '1',
          period: 'weekly',
          trend: 'improving',
          chartPoints: [
            ParentTreatmentJourneyPoint(
              date: DateTime(2026, 1, 1),
              score: 60,
            ),
            ParentTreatmentJourneyPoint(
              date: DateTime(2026, 1, 8),
              score: 70,
            ),
          ],
        ),
      );
      expect(improving.title, 'Progress is moving upward');

      final declining = buildTreatmentJourneyInterpretation(
        ParentTreatmentJourney(
          patientId: '1',
          period: 'weekly',
          trend: 'declining',
          chartPoints: [
            ParentTreatmentJourneyPoint(
              date: DateTime(2026, 1, 1),
              score: 70,
            ),
            ParentTreatmentJourneyPoint(
              date: DateTime(2026, 1, 8),
              score: 60,
            ),
          ],
        ),
      );
      expect(declining.title, 'Progress needs attention');

      final stable = buildTreatmentJourneyInterpretation(
        ParentTreatmentJourney(
          patientId: '1',
          period: 'weekly',
          trend: 'stable',
          chartPoints: [
            ParentTreatmentJourneyPoint(
              date: DateTime(2026, 1, 1),
              score: 70,
            ),
            ParentTreatmentJourneyPoint(
              date: DateTime(2026, 1, 8),
              score: 71,
            ),
          ],
        ),
      );
      expect(stable.title, 'Progress is currently stable');
    });

    test('single point uses neutral interpretation', () {
      final interpretation = buildTreatmentJourneyInterpretation(
        ParentTreatmentJourney(
          patientId: '1',
          period: 'weekly',
          trend: 'improving',
          chartPoints: [
            ParentTreatmentJourneyPoint(
              date: DateTime(2026, 1, 1),
              score: 70,
            ),
          ],
        ),
      );

      expect(
        interpretation.body,
        'More progress entries are needed to identify a trend.',
      );
    });

    test('formatTreatmentJourneyDateRange formats readable range', () {
      expect(
        formatTreatmentJourneyDateRange(
          DateTime(2026, 1, 15),
          DateTime(2026, 7, 30),
        ),
        'Jan 15, 2026 – Jul 30, 2026',
      );
    });
  });
}
