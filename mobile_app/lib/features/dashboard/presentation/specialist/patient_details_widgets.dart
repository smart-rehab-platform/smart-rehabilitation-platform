import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/specialist_patient_details_models.dart';
import '../../widgets/dashboard_components.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/dashboard_visuals.dart';
import '../../widgets/parent_dashboard_cards.dart';

class PatientDetailsHeader extends StatelessWidget {
  const PatientDetailsHeader({
    super.key,
    required this.patient,
    required this.diagnosis,
    required this.overallProgress,
  });

  final PatientProfile patient;
  final String? diagnosis;
  final double overallProgress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final ageLabel = patient.age != null ? '${patient.age} years' : '—';

    return DashboardSurfaceCard(
      child: Column(
        children: [
          CircleAvatar(
            radius: context.dashSpacing * 0.9,
            backgroundColor: DashboardColors.blueSoft,
            child: Text(
              dashboardAvatarLetter(patient.fullName),
              style: theme.textTheme.headlineSmall?.copyWith(
                color: const Color(0xFF3B82F6),
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          Text(
            patient.fullName,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: context.dashSpacing * 0.2),
          Text(
            'Age $ageLabel • ${diagnosis ?? 'No diagnosis recorded'}',
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              DashboardProgressRing(
                label: 'Overall Progress',
                progress: overallProgress.clamp(0, 1),
                color: DashboardColors.accent,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class PatientQuickStatsGrid extends StatelessWidget {
  const PatientQuickStatsGrid({
    super.key,
    required this.stats,
    this.onActiveGoalsTap,
    this.onAssignedExercisesTap,
    this.onPendingReviewsTap,
    this.onReportsTap,
  });

  final PatientQuickStats stats;
  final VoidCallback? onActiveGoalsTap;
  final VoidCallback? onAssignedExercisesTap;
  final VoidCallback? onPendingReviewsTap;
  final VoidCallback? onReportsTap;

  @override
  Widget build(BuildContext context) {
    return DashboardSummaryGrid(
      cards: [
        DashboardSummaryCard(
          label: 'Active Goals',
          value: '${stats.activeGoals}',
          icon: Icons.flag_outlined,
          iconBackground: DashboardColors.brandSoft,
          iconColor: DashboardColors.brandCyan,
          onTap: onActiveGoalsTap,
        ),
        DashboardSummaryCard(
          label: 'Assigned Exercises',
          value: '${stats.assignedExercises}',
          icon: Icons.fitness_center_outlined,
          iconBackground: DashboardColors.tealSoft,
          iconColor: DashboardColors.accent,
          onTap: onAssignedExercisesTap,
        ),
        DashboardSummaryCard(
          label: 'Pending Reviews',
          value: '${stats.pendingReviews}',
          icon: Icons.rate_review_outlined,
          iconBackground: DashboardColors.amberSoft,
          iconColor: DashboardColors.warning,
          onTap: onPendingReviewsTap,
        ),
        DashboardSummaryCard(
          label: 'Reports',
          value: '${stats.reports}',
          icon: Icons.description_outlined,
          iconBackground: DashboardColors.blueSoft,
          iconColor: const Color(0xFF3B82F6),
          onTap: onReportsTap,
        ),
      ],
    );
  }
}

class PatientTreatmentPlanCard extends StatelessWidget {
  const PatientTreatmentPlanCard({super.key, required this.plan});

  final PatientTreatmentPlan plan;

  static String _formatPlanStatus(String status) {
    if (status.isEmpty) {
      return status;
    }
    return status[0].toUpperCase() + status.substring(1);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFormat = DateFormat('MMM d, yyyy');

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  plan.title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
              ),
              DashboardPriorityBadge(
                label: _formatPlanStatus(plan.status),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          _InfoRow(
            label: 'Start date',
            value: plan.startDate != null
                ? dateFormat.format(plan.startDate!)
                : '—',
          ),
          SizedBox(height: context.dashSpacing * 0.2),
          _InfoRow(
            label: 'End date',
            value:
                plan.endDate != null ? dateFormat.format(plan.endDate!) : '—',
          ),
        ],
      ),
    );
  }
}

class PatientGoalCard extends StatelessWidget {
  const PatientGoalCard({
    super.key,
    required this.goal,
    this.showTargets = false,
  });

  final PatientGoalItem goal;
  final bool showTargets;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final progress = goal.isAchieved ? 1.0 : goal.completionPercentage.clamp(0, 1);
    final dateFormat = DateFormat('MMM d, yyyy');

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  goal.title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              if (goal.isAchieved)
                Padding(
                  padding: EdgeInsetsDirectional.only(end: context.dashSpacing * 0.35),
                  child: DashboardPriorityBadge(label: 'Achieved'),
                ),
              Text(
                goal.termLabel,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: DashboardColors.brandCyan,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          if (showTargets &&
              (goal.targetValue != null || goal.targetDate != null)) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            if (goal.targetValue != null)
              Text(
                'Target value: ${goal.targetValue!.toStringAsFixed(goal.targetValue! % 1 == 0 ? 0 : 1)}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textSecondary,
                ),
              ),
            if (goal.targetDate != null) ...[
              if (goal.targetValue != null)
                SizedBox(height: context.dashSpacing * 0.15),
              Text(
                'Target date: ${dateFormat.format(goal.targetDate!)}',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textSecondary,
                ),
              ),
            ],
          ],
          SizedBox(height: context.dashSpacing * 0.45),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: progress.toDouble(),
              minHeight: context.dashSpacing * 0.18,
              backgroundColor: DashboardColors.border,
              color: DashboardColors.accent,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            '${(progress * 100).round()}% complete',
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class PatientAssignedExerciseTile extends StatelessWidget {
  const PatientAssignedExerciseTile({
    super.key,
    required this.exercise,
    this.onTap,
  });

  final PatientAssignedExerciseItem exercise;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dueLabel = exercise.dueDate != null
        ? DateFormat('MMM d, yyyy').format(exercise.dueDate!)
        : 'No due date';

    return DashboardSurfaceCard(
      onTap: onTap,
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(context.dashSpacing * 0.4),
            decoration: BoxDecoration(
              color: DashboardColors.tealSoft,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.fitness_center_outlined,
              color: DashboardColors.accent,
              size: context.dashSpacing * 0.55,
            ),
          ),
          SizedBox(width: context.dashSpacing * 0.65),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exercise.exerciseTitle,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  exercise.category ?? '—',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
                Text(
                  'Due $dueLabel',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: DashboardColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          DashboardPriorityBadge(label: exercise.statusLabel),
          if (onTap != null) ...[
            SizedBox(width: context.dashSpacing * 0.25),
            const Icon(
              Icons.chevron_right_rounded,
              color: DashboardColors.textMuted,
            ),
          ],
        ],
      ),
    );
  }
}

class PatientSubmissionTile extends StatelessWidget {
  const PatientSubmissionTile({
    super.key,
    required this.submission,
    this.onTap,
  });

  final PatientSubmissionItem submission;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateLabel = submission.submittedAt != null
        ? DateFormat('MMM d, yyyy • h:mm a').format(submission.submittedAt!)
        : 'Recently';

    return DashboardSurfaceCard(
      onTap: onTap,
      child: Row(
        children: [
          Icon(
            _mediaIcon(submission.mediaTypeLabel),
            color: DashboardColors.brandCyan,
          ),
          SizedBox(width: context.dashSpacing * 0.65),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  submission.exerciseTitle,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  '${submission.mediaTypeLabel} • $dateLabel',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          DashboardPriorityBadge(label: submission.reviewStatus),
          if (onTap != null) ...[
            SizedBox(width: context.dashSpacing * 0.25),
            Icon(
              Icons.chevron_right_rounded,
              color: DashboardColors.textMuted,
            ),
          ],
        ],
      ),
    );
  }

  IconData _mediaIcon(String label) {
    return switch (label.toLowerCase()) {
      'audio' => Icons.mic_outlined,
      'video' => Icons.videocam_outlined,
      'image' => Icons.image_outlined,
      _ => Icons.attach_file_outlined,
    };
  }
}

class PatientNoteTile extends StatelessWidget {
  const PatientNoteTile({super.key, required this.note});

  final PatientSpecialistNote note;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateLabel = note.createdAt != null
        ? DateFormat('MMM d, yyyy • h:mm a').format(note.createdAt!)
        : 'Recently';

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  note.specialistName,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                dateLabel,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            note.note,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class PatientDetailsEmptySection extends StatelessWidget {
  const PatientDetailsEmptySection({
    super.key,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    if (actionLabel == null || onAction == null) {
      return DashboardEmptyCard(message: message);
    }

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.textSecondary,
                ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          OutlinedButton.icon(
            onPressed: onAction,
            icon: const Icon(Icons.add_rounded),
            label: Text(actionLabel!),
            style: OutlinedButton.styleFrom(
              foregroundColor: DashboardColors.brandCyan,
              side: const BorderSide(color: DashboardColors.brandCyan),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
          ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: DashboardColors.textPrimary,
              ),
        ),
      ],
    );
  }
}
