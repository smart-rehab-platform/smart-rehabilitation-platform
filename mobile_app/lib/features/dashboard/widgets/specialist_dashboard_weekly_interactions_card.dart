import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../l10n/app_localizations.dart';
import '../models/specialist_weekly_interactions_models.dart';
import 'dashboard_layout.dart';
import 'dashboard_surface_card.dart';

class SpecialistDashboardWeeklyInteractionsCard extends StatefulWidget {
  const SpecialistDashboardWeeklyInteractionsCard({
    super.key,
    this.data,
    this.isLoading = false,
    this.hasError = false,
    this.onPeriodChanged,
    this.onRetry,
  });

  final SpecialistWeeklyInteractionsData? data;
  final bool isLoading;
  final bool hasError;
  final ValueChanged<int>? onPeriodChanged;
  final VoidCallback? onRetry;

  @override
  State<SpecialistDashboardWeeklyInteractionsCard> createState() =>
      _SpecialistDashboardWeeklyInteractionsCardState();
}

class _SpecialistDashboardWeeklyInteractionsCardState
    extends State<SpecialistDashboardWeeklyInteractionsCard> {
  late int _weekOffset;

  @override
  void initState() {
    super.initState();
    _weekOffset = widget.data?.weekOffset ?? 0;
  }

  bool get _hasResolvedData =>
      widget.data != null && widget.data!.weekOffset == _weekOffset;

  bool get _showLoading =>
      widget.isLoading || (!_hasResolvedData && !widget.hasError);

  bool get _showError => widget.hasError && !_hasResolvedData && !widget.isLoading;

  bool get _showChart => _hasResolvedData && !widget.isLoading;

  @override
  void didUpdateWidget(
    covariant SpecialistDashboardWeeklyInteractionsCard oldWidget,
  ) {
    super.didUpdateWidget(oldWidget);
    final providerOffset = widget.data?.weekOffset;
    if (providerOffset != null && providerOffset != _weekOffset) {
      _weekOffset = providerOffset;
    }
  }

  String _periodLabel(AppLocalizations l10n) {
    return switch (_weekOffset) {
      0 => l10n.dateThisWeek,
      -1 => l10n.dateLastWeek,
      1 => l10n.adminSystemActivityNextWeek,
      < 0 => l10n.adminSystemActivityWeeksAgo(-_weekOffset),
      > 1 => '${_weekOffset} weeks ahead',
  _ => l10n.dateThisWeek,
    };
  }

  Future<void> _openDaySheet(
    BuildContext context,
    SpecialistWeeklyInteractionDay day,
    String fullDayLabel,
  ) async {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final patients = day.patientNames;

    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              context.dashSpacing,
              0,
              context.dashSpacing,
              context.dashSpacing,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  fullDayLabel,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.65),
                if (patients.isEmpty)
                  Padding(
                    padding: EdgeInsets.symmetric(
                      vertical: context.dashSpacing * 0.5,
                    ),
                    child: Text(
                      l10n.specialistDashboardNoInteractionsThisDay,
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  )
                else ...[
                  Text(
                    l10n.specialistDashboardInteractionPatientsCount(
                      patients.length,
                    ),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.45),
                  ConstrainedBox(
                    constraints: BoxConstraints(
                      maxHeight: MediaQuery.sizeOf(sheetContext).height * 0.45,
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      itemCount: patients.length,
                      separatorBuilder: (_, __) =>
                          SizedBox(height: context.dashSpacing * 0.25),
                      itemBuilder: (context, index) {
                        return Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '•',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: DashboardColors.brandCyan,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            SizedBox(width: context.dashSpacing * 0.35),
                            Expanded(
                              child: Text(
                                patients[index],
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: DashboardColors.textPrimary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final spacing = context.dashSpacing;
    final chartHeight = math.max(context.dashboardSize.height * 0.16, 136.0);

    return DashboardSurfaceCard(
      tint: DashboardColors.brandCyan,
      child: Column(
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
                      l10n.specialistDashboardWeeklyPatientInteractions,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: DashboardColors.textPrimary,
                      ),
                    ),
                    SizedBox(height: spacing * 0.2),
                    Text(
                      l10n.specialistDashboardWeeklyPatientInteractionsSubtitle,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(width: spacing * 0.5),
              _PeriodDropdown(
                label: _periodLabel(l10n),
                isLoading: widget.isLoading,
                weekOffset: _weekOffset,
                onSelected: (offset) {
                  if (offset == _weekOffset) {
                    return;
                  }
                  setState(() => _weekOffset = offset);
                  widget.onPeriodChanged?.call(offset);
                },
              ),
            ],
          ),
          SizedBox(height: spacing * 0.75),
          if (_showLoading)
            _LoadingBody(chartHeight: chartHeight)
          else if (_showError)
            _ErrorBody(onRetry: widget.onRetry)
          else if (_showChart)
            _ChartBody(
              data: widget.data!,
              weekOffset: _weekOffset,
              chartHeight: chartHeight,
              onDayTap: _openDaySheet,
            ),
        ],
      ),
    );
  }
}

class _ChartBody extends StatelessWidget {
  const _ChartBody({
    required this.data,
    required this.weekOffset,
    required this.chartHeight,
    required this.onDayTap,
  });

  final SpecialistWeeklyInteractionsData data;
  final int weekOffset;
  final double chartHeight;
  final Future<void> Function(
    BuildContext context,
    SpecialistWeeklyInteractionDay day,
    String fullDayLabel,
  ) onDayTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final localeName = Localizations.localeOf(context).toString();
    final spacing = context.dashSpacing;
    final today = DateTime.now();
    final normalizedToday = DateTime(today.year, today.month, today.day);
    final maxCount = data.days.fold<int>(
      0,
      (current, day) => math.max(current, day.count),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          l10n.specialistDashboardUniquePatientsThisWeek(
            data.weeklyUniquePatientCount,
          ),
          style: theme.textTheme.labelLarge?.copyWith(
            color: DashboardColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(height: spacing * 0.65),
        SizedBox(
          height: chartHeight,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(data.days.length, (index) {
              final day = data.days[index];
              final isToday = weekOffset == 0 &&
                  isSameCalendarDay(day.date, normalizedToday);
              final shortLabel =
                  DateFormat('EEE', localeName).format(day.date);
              final fullLabel =
                  DateFormat('EEEE', localeName).format(day.date);
              final heightFactor = _normalizedHeight(day.count, maxCount);
              final showValue = day.count > 0;

              return Expanded(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: spacing * 0.18),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (showValue)
                        Padding(
                          padding: EdgeInsets.only(bottom: spacing * 0.15),
                          child: Text(
                            '${day.count}',
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: isToday
                                  ? DashboardColors.brandCyan
                                  : DashboardColors.textSecondary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      Expanded(
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            final barWidth = constraints.maxWidth * 0.52;

                            return GestureDetector(
                              behavior: HitTestBehavior.opaque,
                              onTap: () => onDayTap(context, day, fullLabel),
                              child: Align(
                                alignment: Alignment.bottomCenter,
                                child: _InteractionBar(
                                  width: barWidth,
                                  heightFactor: heightFactor,
                                  isToday: isToday,
                                  animate: true,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      SizedBox(height: spacing * 0.3),
                      Text(
                        shortLabel,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: isToday
                              ? DashboardColors.brandCyan
                              : DashboardColors.textMuted,
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

  double _normalizedHeight(int value, int maxValue) {
    if (value <= 0 || maxValue <= 0) {
      return 0;
    }
    return (value / maxValue).clamp(0.12, 1);
  }
}

class _LoadingBody extends StatelessWidget {
  const _LoadingBody({required this.chartHeight});

  final double chartHeight;

  @override
  Widget build(BuildContext context) {
    final spacing = context.dashSpacing;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _SkeletonBox(height: spacing * 1.1, widthFactor: 0.55),
        SizedBox(height: spacing * 0.65),
        SizedBox(
          height: chartHeight,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(7, (index) {
              final barFactor = 0.35 + ((index % 3) * 0.18);
              return Expanded(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: spacing * 0.18),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Align(
                          alignment: Alignment.bottomCenter,
                          child: _SkeletonBox(
                            height: chartHeight * barFactor,
                            widthFactor: 0.52,
                          ),
                        ),
                      ),
                      SizedBox(height: spacing * 0.3),
                      _SkeletonBox(height: spacing * 0.55, widthFactor: 0.7),
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

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({this.onRetry});

  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final spacing = context.dashSpacing;

    return Padding(
      padding: EdgeInsets.symmetric(vertical: spacing * 0.35),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.specialistDashboardWeeklyInteractionsLoadFailed,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: spacing * 0.35),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton(
              onPressed: onRetry,
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(l10n.commonRetry),
            ),
          ),
        ],
      ),
    );
  }
}

class _SkeletonBox extends StatelessWidget {
  const _SkeletonBox({
    required this.height,
    this.widthFactor = 1,
  });

  final double height;
  final double widthFactor;

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
      widthFactor: widthFactor,
      child: Container(
        height: height,
        decoration: BoxDecoration(
          color: DashboardColors.brandSoft.withValues(alpha: 0.55),
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}

class _PeriodDropdown extends StatelessWidget {
  const _PeriodDropdown({
    required this.label,
    required this.isLoading,
    required this.weekOffset,
    required this.onSelected,
  });

  final String label;
  final bool isLoading;
  final int weekOffset;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return PopupMenuButton<int>(
      tooltip: l10n.adminSystemActivitySelectPeriod,
      enabled: !isLoading,
      offset: const Offset(0, 36),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      initialValue: weekOffset,
      onSelected: onSelected,
      itemBuilder: (context) {
        return [
          PopupMenuItem(value: 0, child: Text(l10n.dateThisWeek)),
          PopupMenuItem(value: -1, child: Text(l10n.dateLastWeek)),
          PopupMenuItem(
            value: -2,
            child: Text(l10n.adminSystemActivityWeeksAgo(2)),
          ),
        ];
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: DashboardColors.surface,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: DashboardColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isLoading) ...[
              const SizedBox(
                width: 12,
                height: 12,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: DashboardColors.brandCyan,
                ),
              ),
              const SizedBox(width: 8),
            ],
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 2),
            const Icon(
              Icons.expand_more_rounded,
              size: 16,
              color: DashboardColors.textMuted,
            ),
          ],
        ),
      ),
    );
  }
}

class _InteractionBar extends StatelessWidget {
  const _InteractionBar({
    required this.width,
    required this.heightFactor,
    required this.isToday,
    required this.animate,
  });

  final double width;
  final double heightFactor;
  final bool isToday;
  final bool animate;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final maxHeight =
            constraints.maxHeight.isFinite && constraints.maxHeight > 0
            ? constraints.maxHeight
            : context.dashSpacing * 4;
        final barHeight = heightFactor <= 0 ? 0.0 : maxHeight * heightFactor;
        final color = isToday
            ? DashboardColors.brandCyan
            : DashboardColors.brandCyan.withValues(alpha: 0.28);

        return Align(
          alignment: Alignment.bottomCenter,
          child: AnimatedContainer(
            duration: animate
                ? const Duration(milliseconds: 350)
                : Duration.zero,
            curve: Curves.easeOutCubic,
            width: width,
            height: barHeight,
            decoration: BoxDecoration(
              color: color,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(8),
              ),
              boxShadow: isToday
                  ? [
                      BoxShadow(
                        color: DashboardColors.brandCyan.withValues(alpha: 0.22),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ]
                  : null,
            ),
          ),
        );
      },
    );
  }
}
