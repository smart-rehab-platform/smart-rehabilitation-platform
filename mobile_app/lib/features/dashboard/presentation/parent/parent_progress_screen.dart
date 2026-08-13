import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/parent_dashboard_models.dart';
import '../../providers/parent_dashboard_provider.dart';
import '../../providers/parent_features_provider.dart';
import '../../widgets/dashboard_components.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_page_scaffold.dart';
import '../../widgets/parent_treatment_journey_chart.dart';
import '../../widgets/parent_treatment_journey_helpers.dart';
import '../../widgets/treatment_journey_icons.dart';

class ParentProgressScreen extends ConsumerStatefulWidget {
  const ParentProgressScreen({super.key, required this.childId});

  final String childId;

  @override
  ConsumerState<ParentProgressScreen> createState() =>
      _ParentProgressScreenState();
}

class _ParentProgressScreenState extends ConsumerState<ParentProgressScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentProgressProvider(widget.childId).notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentProgressProvider(widget.childId));
    final dashboard = ref.watch(parentDashboardProvider);
    ParentChild? child;
    for (final item in dashboard.children) {
      if (item.id == widget.childId) {
        child = item;
        break;
      }
    }

    final journey = state.treatmentJourney;
    final hasJourneyChart = journey?.hasData ?? false;

    return ParentPageScaffold(
      title: 'Treatment Journey',
      showBackButton: true,
      body: RefreshIndicator(
        onRefresh: () =>
            ref.read(parentProgressProvider(widget.childId).notifier).refresh(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (child != null) ...[
                Row(
                  children: [
                    DashboardProfileAvatar(
                      initials: dashboardInitials(child.name, fallback: 'CH'),
                      imageUrl: child.profileImageUrl,
                      radius: 18,
                    ),
                    SizedBox(width: context.dashSpacing * 0.55),
                    Expanded(
                      child: Text(
                        child.name,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: DashboardColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: context.dashSpacing * 0.35),
              ],
              Text(
                'See how your child\'s progress has changed over time',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.textSecondary,
                  height: 1.35,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.85),
              _JourneyPeriodSelector(
                selectedPeriod: state.selectedJourneyPeriod,
                onSelected: (period) => ref
                    .read(parentProgressProvider(widget.childId).notifier)
                    .changeJourneyPeriod(widget.childId, period),
              ),
              SizedBox(height: context.dashSpacing * 0.85),
              if (state.journeyError != null) ...[
                _JourneyErrorBanner(
                  onRetry: () => ref
                      .read(parentProgressProvider(widget.childId).notifier)
                      .loadTreatmentJourney(
                        widget.childId,
                        period: state.selectedJourneyPeriod,
                      ),
                ),
                SizedBox(height: context.dashSpacing * 0.75),
              ],
              if (state.isJourneyLoading && journey == null)
                const _JourneySummarySkeleton()
              else
                _JourneySummarySection(journey: journey),
              SizedBox(height: context.dashSpacing * 0.4),
              Semantics(
                label: hasJourneyChart
                    ? 'Treatment progress chart with ${journey!.chartPoints.length} points'
                    : 'Treatment progress chart, no data yet',
                child: ParentTreatmentJourneyChart(
                  points: journey?.chartPoints ?? const [],
                  period: state.selectedJourneyPeriod,
                  isLoading: state.isJourneyLoading && journey != null,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.55),
              _JourneyInterpretationCard(journey: journey),
              if (journey?.treatmentStart != null ||
                  journey?.treatmentEnd != null) ...[
                SizedBox(height: context.dashSpacing * 0.5),
                _TreatmentPeriodInfo(
                  start: journey?.treatmentStart,
                  end: journey?.treatmentEnd,
                ),
              ],
              SizedBox(height: context.dashSpacing * 1.1),
              _SupportingProgressSections(state: state, childId: widget.childId),
              SizedBox(height: context.dashSpacing),
            ],
          ),
        ),
      ),
    );
  }
}

class _JourneyPeriodSelector extends StatelessWidget {
  const _JourneyPeriodSelector({
    required this.selectedPeriod,
    required this.onSelected,
  });

  final String selectedPeriod;
  final ValueChanged<String> onSelected;

  static const _options = [
    ('weekly', 'Weekly'),
    ('monthly', 'Monthly'),
    ('full', 'Full Treatment'),
  ];

  @override
  Widget build(BuildContext context) {
    return DashboardSurfaceCard(
      padding: EdgeInsets.all(context.dashSpacing * 0.35),
      child: Row(
        children: [
          for (final option in _options) ...[
            Expanded(
              child: _PeriodOption(
                label: option.$2,
                isSelected: selectedPeriod == option.$1,
                onTap: () => onSelected(option.$1),
              ),
            ),
            if (option.$1 != 'full')
              SizedBox(width: context.dashSpacing * 0.25),
          ],
        ],
      ),
    );
  }
}

class _PeriodOption extends StatelessWidget {
  const _PeriodOption({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Semantics(
      button: true,
      selected: isSelected,
      label: label,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: EdgeInsets.symmetric(
              vertical: context.dashSpacing * 0.45 + 4,
              horizontal: context.dashSpacing * 0.25,
            ),
            decoration: BoxDecoration(
              color: isSelected
                  ? DashboardColors.brandSoft
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected
                    ? DashboardColors.brandCyan.withValues(alpha: 0.45)
                    : Colors.transparent,
              ),
            ),
            alignment: Alignment.center,
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: theme.textTheme.labelMedium?.copyWith(
                color: isSelected
                    ? DashboardColors.brandCyan
                    : DashboardColors.textSecondary,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _JourneySummarySection extends StatelessWidget {
  const _JourneySummarySection({required this.journey});

  final ParentTreatmentJourney? journey;

  @override
  Widget build(BuildContext context) {
    final trend = journey?.trend ?? 'stable';

    return DashboardSurfaceCard(
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.75,
        vertical: context.dashSpacing * 0.75,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          LayoutBuilder(
            builder: (context, constraints) {
              final useStacked = constraints.maxWidth < 360;

              if (useStacked) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: _SummaryMetricBlock(
                            iconAsset: TreatmentJourneyIcons.currentLocation,
                            label: 'Started At',
                            value: formatTreatmentJourneyPercent(
                              journey?.startingScore,
                            ),
                            emphasis: _SummaryMetricEmphasis.secondary,
                          ),
                        ),
                        SizedBox(width: context.dashSpacing * 0.65),
                        Expanded(
                          child: _SummaryMetricBlock(
                            iconAsset: TreatmentJourneyIcons.target,
                            label: 'Current Progress',
                            value: formatTreatmentJourneyPercent(
                              journey?.currentScore,
                            ),
                            emphasis: _SummaryMetricEmphasis.primary,
                            trendLabel: treatmentJourneyTrendLabel(trend),
                            trend: trend,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: context.dashSpacing * 0.65),
                    _SummaryMetricBlock(
                      iconAsset: TreatmentJourneyIcons.trendingUp,
                      label: 'Score Change',
                      value: formatTreatmentJourneyScoreChange(
                        journey?.scoreChange,
                      ),
                      emphasis: _SummaryMetricEmphasis.tertiary,
                    ),
                  ],
                );
              }

              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _SummaryMetricBlock(
                          iconAsset: TreatmentJourneyIcons.currentLocation,
                          label: 'Started At',
                          value: formatTreatmentJourneyPercent(
                            journey?.startingScore,
                          ),
                          emphasis: _SummaryMetricEmphasis.secondary,
                        ),
                      ),
                      SizedBox(width: context.dashSpacing * 0.85),
                      Expanded(
                        child: _SummaryMetricBlock(
                          iconAsset: TreatmentJourneyIcons.target,
                          label: 'Current Progress',
                          value: formatTreatmentJourneyPercent(
                            journey?.currentScore,
                          ),
                          emphasis: _SummaryMetricEmphasis.primary,
                          trendLabel: treatmentJourneyTrendLabel(trend),
                          trend: trend,
                        ),
                      ),
                    ],
                  ),
                  Padding(
                    padding: EdgeInsets.symmetric(
                      vertical: context.dashSpacing * 0.65,
                    ),
                    child: Divider(
                      height: 1,
                      color: DashboardColors.border.withValues(alpha: 0.55),
                    ),
                  ),
                  _SummaryMetricBlock(
                    iconAsset: TreatmentJourneyIcons.trendingUp,
                    label: 'Score Change',
                    value: formatTreatmentJourneyScoreChange(
                      journey?.scoreChange,
                    ),
                    emphasis: _SummaryMetricEmphasis.tertiary,
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

enum _SummaryMetricEmphasis { primary, secondary, tertiary }

class _SummaryMetricBlock extends StatelessWidget {
  const _SummaryMetricBlock({
    required this.iconAsset,
    required this.label,
    required this.value,
    this.emphasis = _SummaryMetricEmphasis.secondary,
    this.trendLabel,
    this.trend,
  });

  final String iconAsset;
  final String label;
  final String value;
  final _SummaryMetricEmphasis emphasis;
  final String? trendLabel;
  final String? trend;

  TextStyle _valueStyle(ThemeData theme) {
    final baseSize = theme.textTheme.titleLarge?.fontSize ?? 22;

    switch (emphasis) {
      case _SummaryMetricEmphasis.primary:
        return theme.textTheme.titleLarge!.copyWith(
          fontWeight: FontWeight.w800,
          color: DashboardColors.textPrimary,
          height: 1,
        );
      case _SummaryMetricEmphasis.secondary:
        return theme.textTheme.titleLarge!.copyWith(
          fontSize: baseSize * 0.96,
          fontWeight: FontWeight.w700,
          color: DashboardColors.textPrimary,
          height: 1,
        );
      case _SummaryMetricEmphasis.tertiary:
        return theme.textTheme.titleMedium!.copyWith(
          fontSize: baseSize * 0.87,
          fontWeight: FontWeight.w700,
          color: DashboardColors.textSecondary,
          height: 1,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Semantics(
      label: trendLabel == null
          ? '$label $value'
          : '$label $value, Trend $trendLabel',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              TreatmentJourneyIconBadge(asset: iconAsset),
              SizedBox(width: context.dashSpacing * 0.45),
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: DashboardColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: _valueStyle(theme),
          ),
          if (trendLabel != null && trend != null) ...[
            SizedBox(height: context.dashSpacing * 0.28),
            Text(
              'Trend',
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textMuted,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.12),
            _TrendBadge(label: trendLabel!, trend: trend!),
          ],
        ],
      ),
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
        horizontal: context.dashSpacing * 0.65,
        vertical: context.dashSpacing * 0.35,
      ),
      decoration: BoxDecoration(
        color: treatmentJourneyTrendBackground(trend),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _JourneyInterpretationCard extends StatelessWidget {
  const _JourneyInterpretationCard({required this.journey});

  final ParentTreatmentJourney? journey;

  @override
  Widget build(BuildContext context) {
    final interpretation = buildTreatmentJourneyInterpretation(journey);
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      tint: DashboardColors.brandCyan,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TreatmentJourneyIconBadge(
                asset: TreatmentJourneyIcons.chartAreaLine,
                size: context.dashSpacing * 0.7,
              ),
              SizedBox(width: context.dashSpacing * 0.45),
              Expanded(
                child: Text(
                  interpretation.title,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            interpretation.body,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class _TreatmentPeriodInfo extends StatelessWidget {
  const _TreatmentPeriodInfo({required this.start, required this.end});

  final DateTime? start;
  final DateTime? end;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.75,
        vertical: context.dashSpacing * 0.65,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          TreatmentJourneyIconBadge(
            asset: TreatmentJourneyIcons.calendarEvent,
            size: context.dashSpacing * 0.75,
          ),
          SizedBox(width: context.dashSpacing * 0.55),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Treatment period',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: DashboardColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.15),
                Text(
                  formatTreatmentJourneyDateRange(start, end),
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: DashboardColors.textPrimary,
                    fontWeight: FontWeight.w700,
                    height: 1.25,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _JourneyErrorBanner extends StatelessWidget {
  const _JourneyErrorBanner({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return DashboardSurfaceCard(
      tint: DashboardColors.warning,
      child: Row(
        children: [
          Expanded(
            child: Text(
              'Couldn\'t load the treatment journey.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          TextButton(onPressed: onRetry, child: Text(l10n.commonRetry)),
        ],
      ),
    );
  }
}

class _JourneySummarySkeleton extends StatelessWidget {
  const _JourneySummarySkeleton();

  @override
  Widget build(BuildContext context) {
    return DashboardSurfaceCard(
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.75,
        vertical: context.dashSpacing * 0.75,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _SkeletonBox(height: context.dashSpacing * 7.5),
        ],
      ),
    );
  }
}

class _DetailedProgressLoading extends StatelessWidget {
  const _DetailedProgressLoading();

  @override
  Widget build(BuildContext context) {
    return DashboardSurfaceCard(
      child: Row(
        children: [
          SizedBox(
            width: context.dashSpacing * 0.75,
            height: context.dashSpacing * 0.75,
            child: const CircularProgressIndicator(strokeWidth: 2),
          ),
          SizedBox(width: context.dashSpacing * 0.65),
          Expanded(
            child: Text(
              'Loading detailed progress...',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SkeletonBox extends StatelessWidget {
  const _SkeletonBox({required this.height});

  final double height;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: DashboardColors.brandSoft.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }
}

class _MetricLine extends StatelessWidget {
  const _MetricLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.35),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

class _SupportingProgressSections extends ConsumerWidget {
  const _SupportingProgressSections({
    required this.state,
    required this.childId,
  });

  final ParentProgressState state;
  final String childId;

  bool get _hasDetailedProgress =>
      state.weekly.isNotEmpty ||
      state.daily.isNotEmpty ||
      state.monthly.isNotEmpty;

  bool get _hasPerformanceMetrics =>
      state.metrics.totalExercisesCompleted != null ||
      state.metrics.averagePerformance != null ||
      state.metrics.averageImprovement != null;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    if (state.isLoading) {
      return const _DetailedProgressLoading();
    }

    if (state.errorMessage != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          DashboardSectionHeader(title: 'Detailed Progress'),
          SizedBox(height: context.dashSpacing * 0.45),
          DashboardSurfaceCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Couldn\'t load detailed progress lists.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                TextButton(
                  onPressed: () => ref
                      .read(parentProgressProvider(childId).notifier)
                      .refresh(),
                  child: Text(l10n.commonRetry),
                ),
              ],
            ),
          ),
        ],
      );
    }

    if (!_hasDetailedProgress && !_hasPerformanceMetrics) {
      return Text(
        'More progress details will appear as therapy sessions continue.',
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: DashboardColors.textSecondary,
          height: 1.4,
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (_hasDetailedProgress) ...[
          DashboardSectionHeader(title: 'Detailed Progress'),
          SizedBox(height: context.dashSpacing * 0.45),
          _ProgressSection(title: 'Weekly', items: state.weekly),
          _ProgressSection(title: 'Daily', items: state.daily),
          _ProgressSection(title: 'Monthly', items: state.monthly),
        ],
        if (_hasPerformanceMetrics) ...[
          if (_hasDetailedProgress)
            SizedBox(height: context.dashSpacing * 0.65),
          DashboardSectionHeader(title: 'Performance Metrics'),
          SizedBox(height: context.dashSpacing * 0.45),
          DashboardSurfaceCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (state.metrics.totalExercisesCompleted != null)
                  _MetricLine(
                    label: 'Completed exercises',
                    value: '${state.metrics.totalExercisesCompleted}',
                  ),
                if (state.metrics.averagePerformance != null)
                  _MetricLine(
                    label: 'Average performance',
                    value: formatTreatmentJourneyPercent(
                      state.metrics.averagePerformance,
                    ),
                  ),
                if (state.metrics.averageImprovement != null)
                  _MetricLine(
                    label: 'Average improvement',
                    value: formatTreatmentJourneyPercent(
                      state.metrics.averageImprovement,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _ProgressSection extends StatelessWidget {
  const _ProgressSection({required this.title, required this.items});

  final String title;
  final List<ParentProgressSnapshot> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.35),
        ...items.map(
          (item) => Padding(
            padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
            child: DashboardSurfaceCard(
              child: Text(
                [
                  if (item.exercisesCompleted != null)
                    '${item.exercisesCompleted} completed',
                  if (item.improvementPercentage != null)
                    '${item.improvementPercentage!.round()}% improvement',
                  if (item.averagePerformance != null)
                    '${item.averagePerformance!.round()}% performance',
                ].join(' • '),
              ),
            ),
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.35),
      ],
    );
  }
}
