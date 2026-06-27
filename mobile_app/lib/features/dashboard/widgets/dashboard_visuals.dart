import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import 'dashboard_layout.dart';

/// Donut-style progress ring used on the Parent dashboard.
class DashboardProgressRing extends StatelessWidget {
  const DashboardProgressRing({
    super.key,
    required this.label,
    required this.progress,
    required this.color,
  });

  final String label;
  final double progress;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = context.dashboardSize.width * 0.22;

    return Column(
      children: [
        SizedBox(
          width: size,
          height: size,
          child: Stack(
            alignment: Alignment.center,
            children: [
              CustomPaint(
                size: Size.square(size),
                painter: _RingPainter(
                  progress: progress,
                  color: color,
                  trackColor: DashboardColors.border,
                ),
              ),
              Text(
                '${(progress * 100).round()}%',
                style: theme.textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: DashboardColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.4),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.w600,
            color: DashboardColors.textSecondary,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter({
    required this.progress,
    required this.color,
    required this.trackColor,
  });

  final double progress;
  final Color color;
  final Color trackColor;

  @override
  void paint(Canvas canvas, Size size) {
    final stroke = size.width * 0.08;
    final rect = Offset.zero & size;
    final start = -math.pi / 2;

    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round;

    final progressPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(rect.deflate(stroke / 2), 0, math.pi * 2, false, trackPaint);
    canvas.drawArc(
      rect.deflate(stroke / 2),
      start,
      math.pi * 2 * progress.clamp(0, 1),
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.color != color;
}

class DashboardPriorityBadge extends StatelessWidget {
  const DashboardPriorityBadge({super.key, required this.label});

  final String label;

  Color get _color => switch (label.toLowerCase()) {
        'high' => DashboardColors.highPriority,
        'medium' => DashboardColors.mediumPriority,
        _ => DashboardColors.lowPriority,
      };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.45,
        vertical: context.dashSpacing * 0.15,
      ),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: _color,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class DashboardLinearProgressTile extends StatelessWidget {
  const DashboardLinearProgressTile({
    super.key,
    required this.name,
    required this.progress,
    required this.avatarColor,
  });

  final String name;
  final double progress;
  final Color avatarColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      children: [
        CircleAvatar(
          radius: context.dashSpacing * 0.55,
          backgroundColor: avatarColor.withValues(alpha: 0.18),
            child: Text(
              dashboardAvatarLetter(name, fallback: 'P'),
            style: theme.textTheme.labelLarge?.copyWith(
              color: avatarColor,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        SizedBox(width: context.dashSpacing * 0.6),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      name,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: DashboardColors.textPrimary,
                      ),
                    ),
                  ),
                  Text(
                    '${(progress * 100).round()}%',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: DashboardColors.accent,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(width: context.dashSpacing * 0.15),
                  Icon(
                    Icons.trending_up_rounded,
                    size: context.dashSpacing * 0.45,
                    color: DashboardColors.success,
                  ),
                ],
              ),
              SizedBox(height: context.dashSpacing * 0.35),
              ClipRRect(
                borderRadius: BorderRadius.circular(999),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: context.dashSpacing * 0.18,
                  backgroundColor: DashboardColors.border,
                  color: DashboardColors.accent,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class DashboardSimpleBarChart extends StatelessWidget {
  const DashboardSimpleBarChart({
    super.key,
    required this.labels,
    required this.usersValues,
    required this.patientsValues,
  });

  final List<String> labels;
  final List<double> usersValues;
  final List<double> patientsValues;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final maxValue = [
      ...usersValues,
      ...patientsValues,
      1.0,
    ].reduce(math.max);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            _LegendDot(color: DashboardColors.primary, label: 'Users'),
            SizedBox(width: context.dashSpacing),
            _LegendDot(color: DashboardColors.accent, label: 'Patients'),
          ],
        ),
        SizedBox(height: context.dashSpacing),
        SizedBox(
          height: context.dashboardSize.height * 0.18,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(labels.length, (index) {
              final userHeight = usersValues[index] / maxValue;
              final patientHeight = patientsValues[index] / maxValue;

              return Expanded(
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: context.dashSpacing * 0.15,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              child: _Bar(
                                heightFactor: userHeight,
                                color: DashboardColors.primary,
                              ),
                            ),
                            SizedBox(width: context.dashSpacing * 0.15),
                            Expanded(
                              child: _Bar(
                                heightFactor: patientHeight,
                                color: DashboardColors.accent,
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.35),
                      Text(
                        labels[index],
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: DashboardColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

class _LegendDot extends StatelessWidget {
  const _LegendDot({required this.color, required this.label});

  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: context.dashSpacing * 0.35,
          height: context.dashSpacing * 0.35,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        SizedBox(width: context.dashSpacing * 0.25),
        Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
        ),
      ],
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({required this.heightFactor, required this.color});

  final double heightFactor;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final maxHeight = constraints.maxHeight.isFinite && constraints.maxHeight > 0
            ? constraints.maxHeight
            : context.dashSpacing * 4;
        final barHeight = maxHeight * heightFactor.clamp(0.08, 1);

        return Align(
          alignment: Alignment.bottomCenter,
          child: Container(
            height: barHeight,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      },
    );
  }
}
