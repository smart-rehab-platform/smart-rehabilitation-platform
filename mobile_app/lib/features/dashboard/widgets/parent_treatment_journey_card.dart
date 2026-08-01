import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../models/parent_dashboard_models.dart';
import 'dashboard_layout.dart';
import 'dashboard_surface_card.dart';
import 'parent_treatment_journey_helpers.dart';
import 'treatment_journey_icons.dart';

class ParentTreatmentJourneyCard extends StatelessWidget {
  const ParentTreatmentJourneyCard({
    super.key,
    required this.journey,
    required this.isLoading,
    this.error,
    required this.onTap,
    this.onRetry,
  });

  final ParentTreatmentJourney? journey;
  final bool isLoading;
  final String? error;
  final VoidCallback onTap;
  final VoidCallback? onRetry;

  bool get _hasChartData => journey?.hasData ?? false;

  @override
  Widget build(BuildContext context) {
    final summaryLabel = _buildSemanticsLabel();

    return Semantics(
      button: true,
      label: summaryLabel,
      child: DashboardSurfaceCard(
        tint: DashboardColors.brandCyan,
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _Header(onTap: onTap),
            SizedBox(height: context.dashSpacing * 0.55),
            if (isLoading)
              _LoadingBody()
            else if (error != null)
              _ErrorBody(onRetry: onRetry)
            else if (!_hasChartData)
              const _EmptyBody()
            else
              _LoadedBody(journey: journey!),
          ],
        ),
      ),
    );
  }

  String _buildSemanticsLabel() {
    if (isLoading) {
      return 'Treatment Journey, loading progress';
    }
    if (error != null) {
      return 'Treatment Journey, could not load treatment progress';
    }
    if (!_hasChartData) {
      return 'Treatment Journey, progress will appear after exercises are reviewed';
    }

    final current = journey!.currentScore?.round();
    final trend = treatmentJourneyTrendLabel(journey!.trend);
    return 'Treatment Journey, current progress ${current ?? 0} percent, $trend';
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: EdgeInsets.all(context.dashSpacing * 0.4),
          decoration: BoxDecoration(
            color: DashboardColors.brandSoft,
            shape: BoxShape.circle,
          ),
          child: Image.asset(
            TreatmentJourneyIcons.chartAreaLine,
            width: context.dashSpacing * 0.75,
            height: context.dashSpacing * 0.75,
            color: DashboardColors.brandCyan,
            colorBlendMode: BlendMode.srcIn,
          ),
        ),
        SizedBox(width: context.dashSpacing * 0.65),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Treatment Journey',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: DashboardColors.textPrimary,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.15),
              Text(
                'Progress throughout the treatment period',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textSecondary,
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
        TextButton(
          onPressed: onTap,
          style: TextButton.styleFrom(
            foregroundColor: DashboardColors.brandCyan,
            padding: EdgeInsets.symmetric(
              horizontal: context.dashSpacing * 0.25,
            ),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'View details',
                style: theme.textTheme.labelMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                size: context.dashSpacing * 0.65,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _LoadingBody extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          height: context.dashSpacing * 2,
          decoration: BoxDecoration(
            color: DashboardColors.brandSoft.withValues(alpha: 0.55),
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.45),
        SizedBox(
          height: context.dashSpacing * 3.4,
          child: Center(
            child: SizedBox(
              width: context.dashSpacing * 0.85,
              height: context.dashSpacing * 0.85,
              child: const CircularProgressIndicator(strokeWidth: 2),
            ),
          ),
        ),
      ],
    );
  }
}

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({this.onRetry});

  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Couldn\'t load treatment progress.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: DashboardColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        if (onRetry != null) ...[
          SizedBox(height: context.dashSpacing * 0.35),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton(
              onPressed: onRetry,
              style: TextButton.styleFrom(
                foregroundColor: DashboardColors.brandCyan,
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: const Text('Retry'),
            ),
          ),
        ],
      ],
    );
  }
}

class _EmptyBody extends StatelessWidget {
  const _EmptyBody();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        Icon(
          Icons.show_chart_rounded,
          color: DashboardColors.textMuted.withValues(alpha: 0.8),
          size: context.dashSpacing * 1.4,
        ),
        SizedBox(height: context.dashSpacing * 0.45),
        Text(
          'Progress will appear after exercises are reviewed.',
          textAlign: TextAlign.center,
          style: theme.textTheme.bodySmall?.copyWith(
            color: DashboardColors.textSecondary,
            height: 1.4,
          ),
        ),
      ],
    );
  }
}

class _LoadedBody extends StatelessWidget {
  const _LoadedBody({required this.journey});

  final ParentTreatmentJourney journey;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currentScore = journey.currentScore?.round() ?? 0;
    final scoreChangeLabel = formatTreatmentJourneyScoreChange(
      journey.scoreChange,
    );
    final trendLabel = treatmentJourneyTrendLabel(journey.trend);
    final previewScores = treatmentJourneyPreviewScores(journey.chartPoints);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Current Progress',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: DashboardColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.2),
                  Text(
                    '$currentScore%',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: DashboardColors.brandCyan,
                      height: 1,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.15),
                  Text(
                    scoreChangeLabel,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            _TrendBadge(label: trendLabel, trend: journey.trend),
          ],
        ),
        SizedBox(height: context.dashSpacing * 0.55),
        ExcludeSemantics(
          child: SizedBox(
            height: context.dashSpacing * 3.4,
            child: CustomPaint(
              painter: TreatmentJourneySparklinePainter(
                scores: previewScores,
                lineColor: DashboardColors.brandCyan,
                pointColor: DashboardColors.brandSecondaryBlue,
              ),
              child: const SizedBox.expand(),
            ),
          ),
        ),
      ],
    );
  }
}

class _TrendBadge extends StatelessWidget {
  const _TrendBadge({required this.label, required this.trend});

  final String label;
  final String trend;

  @override
  Widget build(BuildContext context) {
    final color = treatmentJourneyTrendColor(trend);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.55,
        vertical: context.dashSpacing * 0.28,
      ),
      decoration: BoxDecoration(
        color: treatmentJourneyTrendBackground(trend),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Text(
        label,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class TreatmentJourneySparklinePainter extends CustomPainter {
  TreatmentJourneySparklinePainter({
    required this.scores,
    required this.lineColor,
    required this.pointColor,
  });

  final List<double> scores;
  final Color lineColor;
  final Color pointColor;

  @override
  void paint(Canvas canvas, Size size) {
    if (scores.isEmpty || size.width <= 0 || size.height <= 0) {
      return;
    }

    final horizontalPadding = 8.0;
    final verticalPadding = 10.0;
    final plotWidth = math.max(size.width - horizontalPadding * 2, 1);
    final plotHeight = math.max(size.height - verticalPadding * 2, 1);

    final minScore = scores.reduce(math.min);
    final maxScore = scores.reduce(math.max);
    final range = maxScore - minScore;

    Offset pointAt(int index) {
      final x = scores.length == 1
          ? horizontalPadding + plotWidth / 2
          : horizontalPadding + (plotWidth * index / (scores.length - 1));

      final normalized = range == 0
          ? 0.5
          : (scores[index] - minScore) / range;

      final y = verticalPadding + plotHeight * (1 - normalized);
      return Offset(x, y);
    }

    final linePaint = Paint()
      ..color = lineColor
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final fillPaint = Paint()
      ..color = lineColor.withValues(alpha: 0.08)
      ..style = PaintingStyle.fill;

    final pointPaint = Paint()
      ..color = pointColor
      ..style = PaintingStyle.fill;

    final points = List.generate(scores.length, pointAt);

    if (points.length > 1) {
      final path = Path()..moveTo(points.first.dx, points.first.dy);
      for (var i = 1; i < points.length; i++) {
        path.lineTo(points[i].dx, points[i].dy);
      }

      final fillPath = Path.from(path)
        ..lineTo(points.last.dx, size.height)
        ..lineTo(points.first.dx, size.height)
        ..close();
      canvas.drawPath(fillPath, fillPaint);
      canvas.drawPath(path, linePaint);
    } else {
      final centerX = points.first.dx;
      const halfWidth = 12.0;
      canvas.drawLine(
        Offset(centerX - halfWidth, points.first.dy),
        Offset(centerX + halfWidth, points.first.dy),
        Paint()
          ..color = lineColor.withValues(alpha: 0.25)
          ..strokeWidth = 1.5
          ..strokeCap = StrokeCap.round,
      );
    }

    for (final point in points) {
      canvas.drawCircle(point, 3.5, pointPaint);
      canvas.drawCircle(
        point,
        5.5,
        Paint()
          ..color = Colors.white
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.5,
      );
    }
  }

  @override
  bool shouldRepaint(covariant TreatmentJourneySparklinePainter oldDelegate) {
    return oldDelegate.scores != scores ||
        oldDelegate.lineColor != lineColor ||
        oldDelegate.pointColor != pointColor;
  }
}
