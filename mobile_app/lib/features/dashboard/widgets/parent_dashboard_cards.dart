import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../models/parent_dashboard_models.dart';
import 'dashboard_layout.dart';
import 'dashboard_profile_avatar.dart';
import 'dashboard_surface_card.dart';

class ParentChildSwitcher extends StatefulWidget {
  const ParentChildSwitcher({
    super.key,
    required this.children,
    required this.selectedPatientId,
    required this.onSelected,
    this.compact = false,
  });

  final List<ParentChild> children;
  final String? selectedPatientId;
  final ValueChanged<String> onSelected;
  final bool compact;

  @override
  State<ParentChildSwitcher> createState() => _ParentChildSwitcherState();
}

class _ParentChildSwitcherState extends State<ParentChildSwitcher> {
  final MenuController _menuController = MenuController();

  ParentChild? _selectedChild() {
    final selectedId = widget.selectedPatientId?.trim();
    if (selectedId == null || selectedId.isEmpty) {
      return widget.children.isNotEmpty ? widget.children.first : null;
    }
    for (final child in widget.children) {
      if (child.id == selectedId) {
        return child;
      }
    }
    return widget.children.isNotEmpty ? widget.children.first : null;
  }

  Future<void> _openBottomSheetSelector(BuildContext context) async {
    if (widget.children.isEmpty) {
      return;
    }

    final selectedId = widget.selectedPatientId?.trim();
    final pickedId = await showModalBottomSheet<String>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: EdgeInsets.fromLTRB(
                  context.dashSpacing,
                  context.dashSpacing * 0.25,
                  context.dashSpacing,
                  context.dashSpacing * 0.35,
                ),
                child: Text(
                  'Select Child',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: DashboardColors.textPrimary,
                  ),
                ),
              ),
              for (final child in widget.children)
                ListTile(
                  title: Text(
                    child.name,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: child.id == selectedId
                          ? FontWeight.w700
                          : FontWeight.w500,
                      color: child.id == selectedId
                          ? DashboardColors.brandCyan
                          : DashboardColors.textPrimary,
                    ),
                  ),
                  trailing: child.id == selectedId
                      ? const Icon(
                          Icons.check_rounded,
                          color: DashboardColors.brandCyan,
                        )
                      : null,
                  onTap: () => Navigator.of(context).pop(child.id),
                ),
              SizedBox(height: context.dashSpacing * 0.35),
            ],
          ),
        );
      },
    );

    if (pickedId != null && pickedId.isNotEmpty && pickedId != selectedId) {
      widget.onSelected(pickedId);
    }
  }

  Widget _buildSelectorControl({
    required BuildContext context,
    required ParentChild selected,
    required VoidCallback onTap,
  }) {
    return Semantics(
      button: true,
      label: 'Select child, currently ${selected.name}',
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            width: widget.compact ? null : double.infinity,
            padding: EdgeInsets.symmetric(
              horizontal: context.dashSpacing * 0.85,
              vertical: context.dashSpacing * 0.6,
            ),
            decoration: BoxDecoration(
              color: DashboardColors.brandSoft.withValues(alpha: 0.35),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: DashboardColors.brandCyan.withValues(alpha: 0.45),
              ),
            ),
            child: Row(
              mainAxisSize: widget.compact ? MainAxisSize.min : MainAxisSize.max,
              children: [
                widget.compact
                    ? Flexible(
                        child: Text(
                          selected.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: DashboardColors.brandCyan,
                          ),
                        ),
                      )
                    : Expanded(
                        child: Text(
                          selected.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: DashboardColors.brandCyan,
                          ),
                        ),
                      ),
                const Icon(
                  Icons.keyboard_arrow_down_rounded,
                  color: DashboardColors.brandCyan,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildCompactMenuItems(BuildContext context) {
    final selectedId = widget.selectedPatientId?.trim();

    return widget.children.map((child) {
      final isSelected = child.id == selectedId;

      return MenuItemButton(
        style: ButtonStyle(
          minimumSize: const WidgetStatePropertyAll(Size.fromHeight(40)),
          padding: WidgetStatePropertyAll(
            EdgeInsets.symmetric(
              horizontal: context.dashSpacing * 0.65,
              vertical: context.dashSpacing * 0.25,
            ),
          ),
          foregroundColor: WidgetStatePropertyAll(
            isSelected ? DashboardColors.brandCyan : DashboardColors.textPrimary,
          ),
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.hovered) ||
                states.contains(WidgetState.pressed)) {
              return DashboardColors.brandSoft.withValues(alpha: 0.35);
            }
            return Colors.transparent;
          }),
          overlayColor: WidgetStatePropertyAll(
            DashboardColors.brandSoft.withValues(alpha: 0.2),
          ),
        ),
        onPressed: () {
          if (!isSelected) {
            widget.onSelected(child.id);
          }
          _menuController.close();
        },
        child: Row(
          children: [
            SizedBox(
              width: 20,
              child: isSelected
                  ? const Icon(
                      Icons.check_rounded,
                      size: 18,
                      color: DashboardColors.brandCyan,
                    )
                  : null,
            ),
            SizedBox(width: context.dashSpacing * 0.25),
            Expanded(
              child: Text(
                child.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected
                      ? DashboardColors.brandCyan
                      : DashboardColors.textPrimary,
                ),
              ),
            ),
          ],
        ),
      );
    }).toList();
  }

  Widget _buildCompactDropdown(BuildContext context, ParentChild selected) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final menuWidth = constraints.maxWidth.isFinite && constraints.maxWidth > 0
            ? constraints.maxWidth
            : 160.0;

        return MenuAnchor(
          controller: _menuController,
          alignmentOffset: const Offset(0, 6),
          style: MenuStyle(
            alignment: AlignmentDirectional.topEnd,
            backgroundColor: const WidgetStatePropertyAll(Colors.white),
            elevation: const WidgetStatePropertyAll(6),
            shadowColor: WidgetStatePropertyAll(
              Colors.black.withValues(alpha: 0.12),
            ),
            surfaceTintColor: const WidgetStatePropertyAll(Colors.white),
            padding: WidgetStatePropertyAll(
              EdgeInsets.symmetric(vertical: context.dashSpacing * 0.2),
            ),
            minimumSize: WidgetStatePropertyAll(Size(menuWidth, 0)),
            maximumSize: WidgetStatePropertyAll(Size(menuWidth, 240)),
            shape: WidgetStatePropertyAll(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(
                  color: DashboardColors.border.withValues(alpha: 0.85),
                ),
              ),
            ),
          ),
          menuChildren: _buildCompactMenuItems(context),
          builder: (context, controller, child) {
            return _buildSelectorControl(
              context: context,
              selected: selected,
              onTap: () {
                if (controller.isOpen) {
                  controller.close();
                } else {
                  controller.open();
                }
              },
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.children.isEmpty) {
      return const SizedBox.shrink();
    }

    final selected = _selectedChild();
    if (selected == null) {
      return const SizedBox.shrink();
    }

    if (widget.compact) {
      return _buildCompactDropdown(context, selected);
    }

    return _buildSelectorControl(
      context: context,
      selected: selected,
      onTap: () => _openBottomSheetSelector(context),
    );
  }
}

/// Primary dashboard focus card for the selected child.
class ParentDashboardHeroCard extends StatelessWidget {
  const ParentDashboardHeroCard({
    super.key,
    required this.childName,
    required this.progress,
    required this.onViewDetails,
    this.profileImageUrl,
    this.categoryLabel,
    required this.upcomingSessionLabel,
    this.improvementLabel,
  });

  final String childName;
  final String? profileImageUrl;
  final String? categoryLabel;
  final double progress;
  final String? improvementLabel;
  final String upcomingSessionLabel;
  final VoidCallback onViewDetails;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final normalized =
        (progress <= 1
                ? progress.clamp(0.0, 1.0)
                : (progress / 100).clamp(0.0, 1.0))
            .toDouble();
    final percentLabel = '${(normalized * 100).round()}%';
    final sectionGap = context.dashSpacing * 0.65;

    return DashboardSurfaceCard(
      tint: DashboardColors.brandCyan,
      padding: EdgeInsets.all(context.dashSpacing),
      decoration: BoxDecoration(
        color: DashboardColors.brandHeroBackground,
        borderRadius: DashboardDecorations.cardRadius,
        border: Border.all(color: DashboardColors.border.withValues(alpha: 0.55)),
        boxShadow: DashboardDecorations.heroCardShadow(DashboardColors.brandCyan),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              DashboardProfileAvatar(
                initials: dashboardInitials(childName, fallback: 'CH'),
                imageUrl: profileImageUrl,
                radius: 28,
              ),
              SizedBox(width: context.dashSpacing * 0.75),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      childName,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: DashboardColors.textPrimary,
                        height: 1.1,
                      ),
                    ),
                    if (categoryLabel != null &&
                        categoryLabel!.trim().isNotEmpty) ...[
                      SizedBox(height: context.dashSpacing * 0.2),
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: context.dashSpacing * 0.35,
                          vertical: context.dashSpacing * 0.12,
                        ),
                        decoration: BoxDecoration(
                          color: DashboardColors.brandSoft,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          categoryLabel!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: DashboardColors.brandCyan,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: sectionGap),
          Text(
            'Overall Progress',
            style: theme.textTheme.labelMedium?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.3),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: SizedBox(
                    height: 8,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Container(color: DashboardColors.border),
                        FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: normalized,
                          child: const DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: DashboardColors.brandProgressGradient,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              SizedBox(width: context.dashSpacing * 0.45),
              Text(
                percentLabel,
                style: theme.textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.brandCyan,
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.2),
          Text(
            'Keep going!',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
          SizedBox(height: sectionGap),
          Row(
            children: [
              Icon(
                Icons.calendar_today_outlined,
                size: context.dashSpacing * 0.45,
                color: DashboardColors.textSecondary,
              ),
              SizedBox(width: context.dashSpacing * 0.2),
              Text(
                'Next Session',
                style: theme.textTheme.labelMedium?.copyWith(
                  color: DashboardColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            upcomingSessionLabel,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: onViewDetails,
              style: TextButton.styleFrom(
                foregroundColor: DashboardColors.brandCyan,
                padding: EdgeInsets.symmetric(
                  horizontal: context.dashSpacing * 0.5,
                ),
              ),
              child: const Text('View Details →'),
            ),
          ),
        ],
      ),
    );
  }
}

class ParentCompactSummaryCard extends StatelessWidget {
  const ParentCompactSummaryCard({
    super.key,
    required this.title,
    required this.value,
    required this.footer,
    required this.icon,
    required this.iconBackground,
    required this.iconColor,
    this.backgroundColor = DashboardColors.surface,
    this.onTap,
  });

  final String title;
  final String value;
  final String footer;
  final IconData icon;
  final Color iconBackground;
  final Color iconColor;
  final Color backgroundColor;
  final VoidCallback? onTap;

  static double _cardHeight(BuildContext context) => context.dashSpacing * 5.6;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final spacing = context.dashSpacing;

    return SizedBox(
      height: _cardHeight(context),
      child: DashboardSurfaceCard(
        onTap: onTap,
        backgroundColor: backgroundColor,
        padding: EdgeInsets.symmetric(
          horizontal: spacing * 0.65,
          vertical: spacing * 0.55,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: EdgeInsets.all(spacing * 0.45),
              decoration: BoxDecoration(
                color: iconBackground,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: spacing * 0.52, color: iconColor),
            ),
            SizedBox(width: spacing * 0.55),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    value,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: DashboardColors.textPrimary,
                      height: 1.05,
                    ),
                  ),
                  SizedBox(height: spacing * 0.08),
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: DashboardColors.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: spacing * 0.1),
                  Text(
                    footer,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textMuted,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ParentTodaySummaryRow extends StatelessWidget {
  const ParentTodaySummaryRow({
    super.key,
    required this.tasksValue,
    required this.tasksSubtitle,
    required this.tasksStreakLabel,
    required this.sessionsValue,
    required this.sessionsSubtitle,
    this.onTasksTap,
    this.onSessionsTap,
  });

  final String tasksValue;
  final String tasksSubtitle;
  final String tasksStreakLabel;
  final String sessionsValue;
  final String sessionsSubtitle;
  final VoidCallback? onTasksTap;
  final VoidCallback? onSessionsTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final spacing = context.dashSpacing;
    final tasksFooter = tasksSubtitle;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                "Today's Summary",
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: DashboardColors.textMuted,
              size: spacing * 0.65,
            ),
          ],
        ),
        SizedBox(height: spacing * 0.45),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ParentCompactSummaryCard(
                title: 'Tasks',
                value: tasksValue,
                footer: tasksFooter,
                icon: Icons.task_alt_outlined,
                iconBackground: DashboardColors.tealSoft,
                iconColor: DashboardColors.accent,
                backgroundColor: DashboardColors.summaryTasksBackground,
                onTap: onTasksTap,
              ),
            ),
            SizedBox(width: spacing * 0.65),
            Expanded(
              child: ParentCompactSummaryCard(
                title: 'Session',
                value: sessionsValue,
                footer: sessionsSubtitle,
                icon: Icons.event_outlined,
                iconBackground: DashboardColors.blueSoft,
                iconColor: const Color(0xFF3B82F6),
                backgroundColor: DashboardColors.summarySessionsBackground,
                onTap: onSessionsTap,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class ParentLatestUpdatesSection extends StatelessWidget {
  const ParentLatestUpdatesSection({
    super.key,
    required this.reportTitle,
    this.reportSubtitle,
    this.onReportTap,
    this.feedback,
    this.onFeedbackTap,
  });

  final String reportTitle;
  final String? reportSubtitle;
  final VoidCallback? onReportTap;
  final ParentSpecialistFeedback? feedback;
  final VoidCallback? onFeedbackTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasReport = reportTitle.trim().isNotEmpty && reportTitle != '—';
    final hasFeedback = feedback != null;

    if (!hasReport && !hasFeedback) {
      return const DashboardEmptyCard(
        message: 'No recent reports or specialist feedback yet.',
      );
    }

    return Column(
      children: [
        if (hasReport)
          Padding(
            padding: EdgeInsets.only(bottom: context.dashSpacing * 0.55),
            child: DashboardSurfaceCard(
              onTap: onReportTap,
              child: Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(context.dashSpacing * 0.45),
                    decoration: BoxDecoration(
                      color: DashboardColors.amberSoft,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.insights_outlined,
                      color: DashboardColors.warning,
                      size: context.dashSpacing * 0.55,
                    ),
                  ),
                  SizedBox(width: context.dashSpacing * 0.65),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Weekly Progress Report',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: DashboardColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.12),
                        Text(
                          reportTitle,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: DashboardColors.textPrimary,
                          ),
                        ),
                        if (reportSubtitle != null &&
                            reportSubtitle!.trim().isNotEmpty) ...[
                          SizedBox(height: context.dashSpacing * 0.12),
                          Text(
                            reportSubtitle!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: DashboardColors.textSecondary,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  Icon(
                    Icons.chevron_right_rounded,
                    color: DashboardColors.textMuted,
                    size: context.dashSpacing * 0.55,
                  ),
                ],
              ),
            ),
          ),
        if (hasFeedback)
          DashboardSurfaceCard(
            onTap: onFeedbackTap,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: EdgeInsets.all(context.dashSpacing * 0.45),
                  decoration: BoxDecoration(
                    color: DashboardColors.brandSoft,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.rate_review_outlined,
                    color: DashboardColors.brandCyan,
                    size: context.dashSpacing * 0.55,
                  ),
                ),
                SizedBox(width: context.dashSpacing * 0.65),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Latest Specialist Feedback',
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: DashboardColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.12),
                      Text(
                        '${feedback!.specialistName}: ${feedback!.message}',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: DashboardColors.textPrimary,
                          height: 1.35,
                        ),
                      ),
                      if (feedback!.exerciseTitle != null) ...[
                        SizedBox(height: context.dashSpacing * 0.12),
                        Text(
                          feedback!.exerciseTitle!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: DashboardColors.textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right_rounded,
                  color: DashboardColors.textMuted,
                  size: context.dashSpacing * 0.55,
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class ParentChildProgressCard extends StatelessWidget {
  const ParentChildProgressCard({
    super.key,
    required this.child,
    required this.progress,
    required this.color,
  });

  final ParentChild child;
  final double progress;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final name = child.name.trim();
    if (name.isEmpty) {
      return const SizedBox.shrink();
    }

    final progressLabel = '${(progress * 100).round()}%';

    return DashboardSurfaceCard(
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.85,
        vertical: context.dashSpacing * 0.65,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          _CompactProgressRing(
            progress: progress,
            color: color,
            size: context.dashSpacing * 2.35,
            centerLabel: progressLabel,
          ),
          SizedBox(width: context.dashSpacing * 0.85),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.15),
                Text(
                  '$progressLabel overall progress',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                    fontWeight: FontWeight.w600,
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

class _CompactProgressRing extends StatelessWidget {
  const _CompactProgressRing({
    required this.progress,
    required this.color,
    required this.size,
    required this.centerLabel,
  });

  final double progress;
  final Color color;
  final double size;
  final String centerLabel;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              value: progress.clamp(0, 1),
              strokeWidth: size * 0.08,
              backgroundColor: DashboardColors.border,
              color: color,
            ),
          ),
          Text(
            centerLabel,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.textPrimary,
            ),
          ),
        ],
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
      tint: DashboardColors.brandCyan,
      padding: EdgeInsets.all(context.dashSpacing),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.all(context.dashSpacing * 0.45),
            decoration: BoxDecoration(
              gradient: DashboardColors.brandPrimaryGradient,
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
                    color: DashboardColors.brandCyan,
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
          backgroundColor: DashboardColors.brandCyan,
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
  const ParentFeedbackCard({super.key, required this.feedback, this.onTap});

  final ParentSpecialistFeedback feedback;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Latest Specialist Feedback',
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: DashboardColors.brandCyan,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                color: DashboardColors.textMuted,
                size: context.dashSpacing * 0.55,
              ),
            ],
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
          if (feedback.requiresRetry) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              'Retry required',
              style: theme.textTheme.labelMedium?.copyWith(
                color: DashboardColors.warning,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.45),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              'View Details',
              style: theme.textTheme.labelMedium?.copyWith(
                color: DashboardColors.brandCyan,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
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
                color: delta >= 0
                    ? DashboardColors.success
                    : DashboardColors.highPriority,
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
  const DashboardLoadingCard({
    super.key,
    this.message = 'Loading dashboard...',
  });

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

class ParentAiAssistantCard extends StatelessWidget {
  const ParentAiAssistantCard({super.key, required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      tint: DashboardColors.brandCyan,
      padding: EdgeInsets.all(context.dashSpacing),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: EdgeInsets.all(context.dashSpacing * 0.5),
                decoration: BoxDecoration(
                  color: DashboardColors.brandSoft,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  Icons.smart_toy_outlined,
                  color: DashboardColors.brandCyan,
                  size: context.dashSpacing * 0.75,
                ),
              ),
              SizedBox(width: context.dashSpacing * 0.65),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AI Assistant',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: DashboardColors.textPrimary,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.25),
                    Text(
                      'Need help understanding your child\'s progress?',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.15),
                    Text(
                      'Ask about exercises, reports, or daily guidance.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onTap,
              icon: const Icon(Icons.auto_awesome),
              label: const Text('Ask AI'),
              style: ElevatedButton.styleFrom(
                backgroundColor: DashboardColors.brandCyan,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(
                  vertical: context.dashSpacing * 0.65,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class DashboardEmptyCard extends StatelessWidget {
  const DashboardEmptyCard({super.key, required this.message, this.padding});

  final String message;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    return DashboardSurfaceCard(
      padding: padding,
      child: Text(
        message,
        style: Theme.of(
          context,
        ).textTheme.bodySmall?.copyWith(color: DashboardColors.textSecondary),
      ),
    );
  }
}
