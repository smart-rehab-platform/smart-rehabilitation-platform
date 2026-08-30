import 'package:flutter/material.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../models/parent_dashboard_models.dart';
import 'dashboard_layout.dart';
import 'dashboard_surface_card.dart';
import 'parent_treatment_journey_helpers.dart';

class ParentTreatmentJourneyChart extends StatefulWidget {
  const ParentTreatmentJourneyChart({
    super.key,
    required this.points,
    required this.period,
    this.selectedIndex,
    this.onSelectedIndexChanged,
    this.isLoading = false,
    this.localeName = 'en',
  });

  final List<ParentTreatmentJourneyPoint> points;
  final String period;
  final int? selectedIndex;
  final ValueChanged<int>? onSelectedIndexChanged;
  final bool isLoading;
  final String localeName;

  @override
  State<ParentTreatmentJourneyChart> createState() =>
      _ParentTreatmentJourneyChartState();
}

class _ParentTreatmentJourneyChartState extends State<ParentTreatmentJourneyChart> {
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = _resolveInitialIndex();
  }

  @override
  void didUpdateWidget(covariant ParentTreatmentJourneyChart oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.points.isEmpty) {
      _selectedIndex = 0;
      return;
    }

    if (oldWidget.points.length != widget.points.length ||
        oldWidget.period != widget.period) {
      _selectedIndex = _resolveInitialIndex();
    } else if (_selectedIndex >= widget.points.length) {
      _selectedIndex = widget.points.length - 1;
    }
  }

  int _resolveInitialIndex() {
    if (widget.selectedIndex != null &&
        widget.selectedIndex! >= 0 &&
        widget.selectedIndex! < widget.points.length) {
      return widget.selectedIndex!;
    }

    return widget.points.isEmpty ? 0 : widget.points.length - 1;
  }

  void _handleTap(TapUpDetails details, BoxConstraints constraints) {
    if (widget.points.isEmpty) {
      return;
    }

    final size = Size(constraints.maxWidth, constraints.maxHeight);
    final scores = widget.points.map((point) => point.score).toList();
    final index = findNearestChartPointIndex(
      localPosition: details.localPosition,
      size: size,
      scores: scores,
    );

    if (index < 0 || index >= widget.points.length) {
      return;
    }

    setState(() => _selectedIndex = index);
    widget.onSelectedIndexChanged?.call(index);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    if (widget.points.isEmpty) {
      return _ChartEmptyState(l10n: l10n);
    }

    final selectedPoint = widget.points[_selectedIndex.clamp(
      0,
      widget.points.length - 1,
    )];
    final selectedScore = formatTreatmentJourneyPercent(selectedPoint.score);
    final selectedDate = localizedFormatTreatmentJourneyDisplayDate(
      widget.localeName,
      selectedPoint.date,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Stack(
          children: [
            LayoutBuilder(
              builder: (context, constraints) {
                return GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTapUp: (details) => _handleTap(details, constraints),
                  child: SizedBox(
                    height: context.dashSpacing * 11 + 45,
                    width: double.infinity,
                    child: CustomPaint(
                      painter: TreatmentJourneyLineChartPainter(
                        points: widget.points,
                        period: widget.period,
                        selectedIndex: _selectedIndex,
                        localeName: widget.localeName,
                      ),
                    ),
                  ),
                );
              },
            ),
            if (widget.isLoading)
              Positioned.fill(
                child: ColoredBox(
                  color: DashboardColors.surface.withValues(alpha: 0.55),
                  child: const Center(
                    child: SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                ),
              ),
          ],
        ),
        SizedBox(height: context.dashSpacing * 0.3),
        Semantics(
          label: l10n.parentTreatmentJourneyChartSelectedPointAria(
            selectedScore,
            selectedDate,
          ),
          child: _SelectedPointDetails(
            point: selectedPoint,
            localeName: widget.localeName,
          ),
        ),
      ],
    );
  }
}

class _SelectedPointDetails extends StatelessWidget {
  const _SelectedPointDetails({
    required this.point,
    required this.localeName,
  });

  final ParentTreatmentJourneyPoint point;
  final String localeName;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      tint: DashboardColors.brandCyan,
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.75,
        vertical: context.dashSpacing * 0.65,
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final useCompact = constraints.maxWidth < 360;
          final scoreChip = _DetailChip(
            label: l10n.parentTreatmentJourneyChartScore,
            value: formatTreatmentJourneyPercent(point.score),
            emphasized: true,
          );
          final dateChip = _DetailChip(
            label: l10n.parentTreatmentJourneyChartDate,
            value: localizedFormatTreatmentJourneyDisplayDate(
              localeName,
              point.date,
            ),
          );
          final exercisesChip = _DetailChip(
            label: l10n.parentTreatmentJourneyChartExercises,
            value: '${point.exercisesCompleted}',
          );
          final improvementChip = _DetailChip(
            label: l10n.parentTreatmentJourneyChartImprovement,
            value: formatTreatmentJourneyImprovement(
              point.improvementPercentage,
            ),
          );

          if (useCompact) {
            return Column(
              children: [
                Row(
                  children: [
                    Expanded(child: scoreChip),
                    SizedBox(width: context.dashSpacing * 0.35),
                    Expanded(child: dateChip),
                  ],
                ),
                SizedBox(height: context.dashSpacing * 0.35),
                Row(
                  children: [
                    Expanded(child: exercisesChip),
                    SizedBox(width: context.dashSpacing * 0.35),
                    Expanded(child: improvementChip),
                  ],
                ),
              ],
            );
          }

          return Row(
            children: [
              Expanded(child: scoreChip),
              Expanded(child: dateChip),
              Expanded(child: exercisesChip),
              Expanded(child: improvementChip),
            ],
          );
        },
      ),
    );
  }
}

class _DetailChip extends StatelessWidget {
  const _DetailChip({
    required this.label,
    required this.value,
    this.emphasized = false,
  });

  final String label;
  final String value;
  final bool emphasized;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: theme.textTheme.labelSmall?.copyWith(
            color: DashboardColors.textMuted,
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.12),
        Text(
          value,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: emphasized
              ? theme.textTheme.titleSmall?.copyWith(
                  color: DashboardColors.textPrimary,
                  fontWeight: FontWeight.w800,
                  height: 1.1,
                )
              : theme.textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
        ),
      ],
    );
  }
}

class _ChartEmptyState extends StatelessWidget {
  const _ChartEmptyState({required this.l10n});

  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        children: [
          Icon(
            Icons.insights_outlined,
            color: DashboardColors.textMuted.withValues(alpha: 0.85),
            size: context.dashSpacing * 1.6,
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          Text(
            l10n.parentTreatmentJourneyChartEmptyTitle,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            l10n.parentTreatmentJourneyChartEmptyBody,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

class TreatmentJourneyLineChartPainter extends CustomPainter {
  TreatmentJourneyLineChartPainter({
    required this.points,
    required this.period,
    required this.selectedIndex,
    required this.localeName,
  });

  final List<ParentTreatmentJourneyPoint> points;
  final String period;
  final int selectedIndex;
  final String localeName;

  static const _yLabels = [100, 75, 50, 25, 0];

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty || size.width <= 0 || size.height <= 0) {
      return;
    }

    final plot = treatmentJourneyChartPlotRect(size);
    final scores = points.map((point) => clampTreatmentJourneyScore(point.score)).toList();
    final positions = computeChartPointPositions(size: size, scores: scores);

    final gridPaint = Paint()
      ..color = DashboardColors.border.withValues(alpha: 0.65)
      ..strokeWidth = 1;

    final textStyle = TextStyle(
      color: DashboardColors.textMuted,
      fontSize: 10,
      fontWeight: FontWeight.w600,
    );

    for (final label in _yLabels) {
      final y = plot.bottom - plot.height * (label / 100);
      canvas.drawLine(Offset(plot.left, y), Offset(plot.right, y), gridPaint);

      final painter = TextPainter(
        text: TextSpan(text: '$label', style: textStyle),
        textDirection: TextDirection.ltr,
      )..layout();

      painter.paint(
        canvas,
        Offset(
          plot.left - painter.width - 6,
          y - painter.height / 2,
        ),
      );
    }

    final labelIndices = calculateXAxisLabelIndices(points.length);
    for (final index in labelIndices) {
      final point = points[index];
      final label = localizedFormatChartXAxisLabel(
        localeName,
        point.date,
        period,
      );
      final painter = TextPainter(
        text: TextSpan(text: label, style: textStyle),
        textDirection: TextDirection.ltr,
      )..layout();

      final x = positions[index].dx - painter.width / 2;
      painter.paint(
        canvas,
        Offset(x.clamp(0, size.width - painter.width), plot.bottom + 6),
      );
    }

    if (positions.length > 1) {
      final fillPath = Path();
      fillPath.moveTo(positions.first.dx, plot.bottom);
      fillPath.lineTo(positions.first.dx, positions.first.dy);

      for (var i = 1; i < positions.length; i++) {
        final previous = positions[i - 1];
        final current = positions[i];
        final controlX = (previous.dx + current.dx) / 2;
        fillPath.cubicTo(
          controlX,
          previous.dy,
          controlX,
          current.dy,
          current.dx,
          current.dy,
        );
      }

      fillPath.lineTo(positions.last.dx, plot.bottom);
      fillPath.close();

      canvas.drawPath(
        fillPath,
        Paint()
          ..color = DashboardColors.brandCyan.withValues(alpha: 0.12)
          ..style = PaintingStyle.fill,
      );

      final linePath = Path()..moveTo(positions.first.dx, positions.first.dy);
      for (var i = 1; i < positions.length; i++) {
        final previous = positions[i - 1];
        final current = positions[i];
        final controlX = (previous.dx + current.dx) / 2;
        linePath.cubicTo(
          controlX,
          previous.dy,
          controlX,
          current.dy,
          current.dx,
          current.dy,
        );
      }

      canvas.drawPath(
        linePath,
        Paint()
          ..color = DashboardColors.brandCyan
          ..strokeWidth = 2.5
          ..style = PaintingStyle.stroke
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round,
      );
    } else if (positions.length == 1) {
      final center = positions.first;
      const baselineHalfWidth = 14.0;
      canvas.drawLine(
        Offset(center.dx - baselineHalfWidth, center.dy),
        Offset(center.dx + baselineHalfWidth, center.dy),
        Paint()
          ..color = DashboardColors.brandCyan.withValues(alpha: 0.24)
          ..strokeWidth = 1.5
          ..strokeCap = StrokeCap.round,
      );
    }

    for (var i = 0; i < positions.length; i++) {
      final isSelected = i == selectedIndex;
      final radius = isSelected ? 5.5 : 4.0;
      canvas.drawCircle(
        positions[i],
        radius + 2,
        Paint()
          ..color = Colors.white
          ..style = PaintingStyle.fill,
      );
      canvas.drawCircle(
        positions[i],
        radius,
        Paint()
          ..color = isSelected
              ? DashboardColors.brandSecondaryBlue
              : DashboardColors.brandCyan
          ..style = PaintingStyle.fill,
      );
    }
  }

  @override
  bool shouldRepaint(covariant TreatmentJourneyLineChartPainter oldDelegate) {
    return oldDelegate.points != points ||
        oldDelegate.period != period ||
        oldDelegate.selectedIndex != selectedIndex ||
        oldDelegate.localeName != localeName;
  }
}
