import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../models/parent_dashboard_models.dart';
import 'dashboard_layout.dart';
import 'dashboard_surface_card.dart';

class ParentChildSwitcher extends StatelessWidget {
  const ParentChildSwitcher({
    super.key,
    required this.children,
    required this.selectedChildId,
    required this.onSelected,
  });

  final List<ParentChild> children;
  final String? selectedChildId;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    if (children.isEmpty) {
      return DashboardSurfaceCard(
        child: Text(
          'No linked children yet. Add a child from the specialist portal.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
              ),
        ),
      );
    }

    return SizedBox(
      height: context.dashSpacing * 2.2,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: children.length,
        separatorBuilder: (_, __) => SizedBox(width: context.dashSpacing * 0.5),
        itemBuilder: (context, index) {
          final child = children[index];
          final isSelected = child.id == selectedChildId;

          return FilterChip(
            label: Text(child.name),
            selected: isSelected,
            onSelected: (_) => onSelected(child.id),
            selectedColor: DashboardColors.purpleSoft,
            checkmarkColor: DashboardColors.primary,
            labelStyle: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: isSelected
                      ? DashboardColors.primary
                      : DashboardColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
            side: BorderSide(
              color: isSelected
                  ? DashboardColors.primary
                  : DashboardColors.border,
            ),
          );
        },
      ),
    );
  }
}

class ParentAiInsightCard extends StatelessWidget {
  const ParentAiInsightCard({super.key, required this.insight});

  final ParentAiInsight insight;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      tint: DashboardColors.primary,
      padding: EdgeInsets.all(context.dashSpacing),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.all(context.dashSpacing * 0.45),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [DashboardColors.primary, Color(0xFF8E7CFF)],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.auto_awesome_rounded,
              color: Colors.white,
              size: context.dashSpacing * 0.6,
            ),
          ),
          SizedBox(width: context.dashSpacing * 0.75),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'AI Daily Insight',
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: DashboardColors.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.25),
                Text(
                  insight.message,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: DashboardColors.textPrimary,
                    height: 1.4,
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

class ParentStreakCard extends StatelessWidget {
  const ParentStreakCard({super.key, required this.streakInfo});

  final ParentStreakInfo streakInfo;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final total = streakInfo.totalToday;
    final completed = streakInfo.completedToday;

    return DashboardSurfaceCard(
      tint: DashboardColors.accent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.local_fire_department_rounded,
                color: DashboardColors.accent,
                size: context.dashSpacing * 0.65,
              ),
              SizedBox(width: context.dashSpacing * 0.4),
              Text(
                total == 0
                    ? 'No tasks assigned today'
                    : '$completed/$total tasks completed today',
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: streakInfo.completionRatio.clamp(0, 1),
              minHeight: context.dashSpacing * 0.2,
              backgroundColor: DashboardColors.border,
              color: DashboardColors.accent,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.45),
          Text(
            '${streakInfo.streakDays}-day rehab streak',
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class ParentAttentionAlertCard extends StatelessWidget {
  const ParentAttentionAlertCard({super.key, required this.alert});

  final ParentAttentionAlert alert;

  @override
  Widget build(BuildContext context) {
    final color = alert.severity == 'high'
        ? DashboardColors.highPriority
        : DashboardColors.warning;

    return DashboardSurfaceCard(
      tint: color,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.warning_amber_rounded,
            color: color,
            size: context.dashSpacing * 0.65,
          ),
          SizedBox(width: context.dashSpacing * 0.6),
          Expanded(
            child: Text(
              alert.message,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: DashboardColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class ParentNextActionButton extends StatelessWidget {
  const ParentNextActionButton({
    super.key,
    required this.action,
    required this.onPressed,
  });

  final ParentNextAction action;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: DashboardColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.75),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        child: Text(
          action.label,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
        ),
      ),
    );
  }
}

class ParentFeedbackCard extends StatelessWidget {
  const ParentFeedbackCard({super.key, required this.feedback});

  final ParentSpecialistFeedback feedback;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Latest Specialist Feedback',
            style: theme.textTheme.labelLarge?.copyWith(
              color: DashboardColors.primary,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.45),
          Text(
            '${feedback.specialistName}: ${feedback.message}',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textPrimary,
              height: 1.4,
            ),
          ),
          if (feedback.exerciseTitle != null) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              feedback.exerciseTitle!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class ParentSpeechAnalysisCard extends StatelessWidget {
  const ParentSpeechAnalysisCard({super.key, required this.summary});

  final ParentSpeechSummary summary;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final overall = summary.overallScore?.round();
    final delta = summary.deltaFromPrevious;

    return DashboardSurfaceCard(
      tint: DashboardColors.accent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Speech Analysis',
            style: theme.textTheme.labelLarge?.copyWith(
              color: DashboardColors.accent,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.45),
          if (overall != null)
            Text(
              'Last pronunciation score: $overall%',
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
          if (delta != null) ...[
            SizedBox(height: context.dashSpacing * 0.25),
            Text(
              '${delta >= 0 ? '+' : ''}${delta.round()}% from previous attempt',
              style: theme.textTheme.bodySmall?.copyWith(
                color: delta >= 0 ? DashboardColors.success : DashboardColors.highPriority,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.5),
          Wrap(
            spacing: context.dashSpacing * 0.5,
            runSpacing: context.dashSpacing * 0.35,
            children: [
              if (summary.pronunciationScore != null)
                _ScoreChip(
                  label: 'Pronunciation',
                  value: summary.pronunciationScore!.round(),
                ),
              if (summary.fluencyScore != null)
                _ScoreChip(
                  label: 'Fluency',
                  value: summary.fluencyScore!.round(),
                ),
              if (summary.overallScore != null)
                _ScoreChip(
                  label: 'Overall',
                  value: summary.overallScore!.round(),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ScoreChip extends StatelessWidget {
  const _ScoreChip({required this.label, required this.value});

  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.55,
        vertical: context.dashSpacing * 0.25,
      ),
      decoration: BoxDecoration(
        color: DashboardColors.tealSoft,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        '$label: $value%',
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}

class DashboardLoadingCard extends StatelessWidget {
  const DashboardLoadingCard({super.key, this.message = 'Loading dashboard...'});

  final String message;

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
          SizedBox(width: context.dashSpacing * 0.75),
          Expanded(
            child: Text(
              message,
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

class DashboardErrorCard extends StatelessWidget {
  const DashboardErrorCard({
    super.key,
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return DashboardSurfaceCard(
      tint: DashboardColors.highPriority,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.textPrimary,
                ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          TextButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}

class DashboardEmptyCard extends StatelessWidget {
  const DashboardEmptyCard({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return DashboardSurfaceCard(
      child: Text(
        message,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
      ),
    );
  }
}
