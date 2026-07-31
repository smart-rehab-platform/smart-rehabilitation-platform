import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../models/parent_dashboard_models.dart';

/// User-facing label for backend trend values.
String treatmentJourneyTrendLabel(String trend) {
  switch (trend.trim().toLowerCase()) {
    case 'improving':
      return 'Improving';
    case 'declining':
      return 'Needs Attention';
    case 'stable':
    default:
      return 'Stable';
  }
}

Color treatmentJourneyTrendColor(String trend) {
  switch (trend.trim().toLowerCase()) {
    case 'improving':
      return DashboardColors.success;
    case 'declining':
      return DashboardColors.warning;
    case 'stable':
    default:
      return DashboardColors.brandCyan;
  }
}

Color treatmentJourneyTrendBackground(String trend) {
  switch (trend.trim().toLowerCase()) {
    case 'improving':
      return DashboardColors.summaryTasksBackground;
    case 'declining':
      return DashboardColors.amberSoft;
    case 'stable':
    default:
      return DashboardColors.brandSoft;
  }
}

String formatTreatmentJourneyPercent(double? value) {
  if (value == null) {
    return '—';
  }

  return '${value.round()}%';
}

String formatTreatmentJourneyScoreChange(double? scoreChange) {
  if (scoreChange == null) {
    return '—';
  }

  final rounded = scoreChange.round();
  if (rounded > 0) {
    return '+$rounded points';
  }
  if (rounded < 0) {
    return '$rounded points';
  }
  return '0 points';
}

String formatTreatmentJourneyImprovement(double? improvementPercentage) {
  if (improvementPercentage == null) {
    return '—';
  }

  final rounded = improvementPercentage.round();
  if (rounded > 0) {
    return '+$rounded%';
  }
  if (rounded < 0) {
    return '$rounded%';
  }
  return '0%';
}

String formatTreatmentJourneyDisplayDate(DateTime? date) {
  if (date == null) {
    return '—';
  }

  return DateFormat('MMM d, yyyy').format(date);
}

String formatTreatmentJourneyDateRange(DateTime? start, DateTime? end) {
  if (start == null && end == null) {
    return '—';
  }

  if (start != null && end != null) {
    return '${DateFormat('MMM d, yyyy').format(start)} – ${DateFormat('MMM d, yyyy').format(end)}';
  }

  final single = start ?? end;
  return single == null ? '—' : DateFormat('MMM d, yyyy').format(single);
}

String formatChartXAxisLabel(DateTime date, String period) {
  switch (period) {
    case 'monthly':
      return DateFormat('MMM').format(date);
    case 'full':
      return DateFormat('MMM yy').format(date);
    case 'weekly':
    default:
      return DateFormat('MMM d').format(date);
  }
}

double clampTreatmentJourneyScore(double score) {
  return score.clamp(0, 100).toDouble();
}

List<int> calculateXAxisLabelIndices(
  int pointCount, {
  int maxLabels = 4,
}) {
  if (pointCount <= 0) {
    return const [];
  }

  if (pointCount <= maxLabels) {
    return List<int>.generate(pointCount, (index) => index);
  }

  final indices = <int>{0, pointCount - 1};
  final step = (pointCount - 1) / (maxLabels - 1);
  for (var i = 1; i < maxLabels - 1; i++) {
    indices.add((i * step).round());
  }

  final sorted = indices.toList()..sort();
  return sorted;
}

const EdgeInsets treatmentJourneyChartPadding = EdgeInsets.fromLTRB(
  8,
  8,
  12,
  4,
);

Rect treatmentJourneyChartPlotRect(Size size) {
  const leftAxisWidth = 28.0;
  const bottomAxisHeight = 22.0;

  return Rect.fromLTWH(
    leftAxisWidth,
    treatmentJourneyChartPadding.top,
    math.max(size.width - leftAxisWidth - treatmentJourneyChartPadding.right, 1),
    math.max(
      size.height - treatmentJourneyChartPadding.top - bottomAxisHeight,
      1,
    ),
  );
}

List<Offset> computeChartPointPositions({
  required Size size,
  required List<double> scores,
}) {
  if (scores.isEmpty) {
    return const [];
  }

  final plot = treatmentJourneyChartPlotRect(size);
  if (scores.length == 1) {
    return [Offset(plot.left + plot.width / 2, _yForScore(scores.first, plot))];
  }

  return List<Offset>.generate(scores.length, (index) {
    final x = plot.left + (plot.width * index / (scores.length - 1));
    return Offset(x, _yForScore(scores[index], plot));
  });
}

double _yForScore(double score, Rect plot) {
  final normalized = clampTreatmentJourneyScore(score) / 100;
  return plot.bottom - plot.height * normalized;
}

int findNearestChartPointIndex({
  required Offset localPosition,
  required Size size,
  required List<double> scores,
  double hitRadius = 28,
}) {
  final positions = computeChartPointPositions(size: size, scores: scores);
  if (positions.isEmpty) {
    return -1;
  }

  var nearestIndex = 0;
  var nearestDistance = double.infinity;

  for (var i = 0; i < positions.length; i++) {
    final distance = (positions[i] - localPosition).distance;
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = i;
    }
  }

  return nearestDistance <= hitRadius ? nearestIndex : nearestIndex;
}

List<double> treatmentJourneyPreviewScores(
  List<ParentTreatmentJourneyPoint> points, {
  int maxPoints = 5,
}) {
  if (points.isEmpty) {
    return const [];
  }

  final startIndex = points.length > maxPoints ? points.length - maxPoints : 0;
  return points.sublist(startIndex).map((point) => point.score).toList();
}

class TreatmentJourneyInterpretation {
  const TreatmentJourneyInterpretation({
    required this.title,
    required this.body,
  });

  final String title;
  final String body;
}

TreatmentJourneyInterpretation buildTreatmentJourneyInterpretation(
  ParentTreatmentJourney? journey,
) {
  if (journey == null || !journey.hasData) {
    return const TreatmentJourneyInterpretation(
      title: 'Building your journey',
      body: 'More progress entries are needed to identify a trend.',
    );
  }

  if (journey.chartPoints.length == 1) {
    return const TreatmentJourneyInterpretation(
      title: 'Early progress recorded',
      body: 'More progress entries are needed to identify a trend.',
    );
  }

  switch (journey.trend.trim().toLowerCase()) {
    case 'improving':
      return const TreatmentJourneyInterpretation(
        title: 'Progress is moving upward',
        body: 'The current score is higher than the starting score.',
      );
    case 'declining':
      return const TreatmentJourneyInterpretation(
        title: 'Progress needs attention',
        body:
            'The latest score is lower than the previous period. Review recent feedback or contact the specialist.',
      );
    case 'stable':
    default:
      return const TreatmentJourneyInterpretation(
        title: 'Progress is currently stable',
        body: 'Recent scores are staying within a similar range.',
      );
  }
}
