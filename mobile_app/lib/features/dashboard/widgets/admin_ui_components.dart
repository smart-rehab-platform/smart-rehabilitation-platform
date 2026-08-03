import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/constants/api_constants.dart';
import '../data/admin_dashboard_repository.dart';
import '../presentation/specialist/manage_goals_widgets.dart';
import 'dashboard_bottom_nav.dart';
import 'dashboard_components.dart';
import 'dashboard_layout.dart';
import 'dashboard_surface_card.dart';
import 'parent_dashboard_cards.dart';

class AdminSurfaceCard extends StatelessWidget {
  const AdminSurfaceCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.tint = DashboardColors.brandCyan,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final Color tint;

  @override
  Widget build(BuildContext context) {
    return DashboardSurfaceCard(
      padding: padding,
      onTap: onTap,
      tint: tint,
      child: child,
    );
  }
}

class AdminIconCircle extends StatelessWidget {
  const AdminIconCircle({
    super.key,
    required this.icon,
    required this.color,
    required this.background,
    this.size = 52,
    this.imageUrl,
  });

  final IconData icon;
  final Color color;
  final Color background;
  final double size;
  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    final resolvedUrl = ApiConstants.resolveProfileImageUrl(imageUrl);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: background, shape: BoxShape.circle),
      clipBehavior: Clip.antiAlias,
      child: resolvedUrl == null
          ? Icon(icon, color: color, size: size * 0.48)
          : Image.network(
              resolvedUrl,
              width: size,
              height: size,
              fit: BoxFit.cover,
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) {
                  return child;
                }

                return Center(
                  child: SizedBox(
                    width: size * 0.35,
                    height: size * 0.35,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: color,
                    ),
                  ),
                );
              },
              errorBuilder: (context, error, stackTrace) {
                return Icon(icon, color: color, size: size * 0.48);
              },
            ),
    );
  }
}

class AdminMetricCard extends StatelessWidget {
  const AdminMetricCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.iconColor,
    required this.iconBackground,
    this.subtitle,
    this.onTap,
  });

  final String label;
  final String value;
  final String? subtitle;
  final IconData icon;
  final Color iconColor;
  final Color iconBackground;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AdminSurfaceCard(
      onTap: onTap,
      tint: iconColor,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AdminIconCircle(
              icon: icon,
              color: iconColor,
              background: iconBackground,
              size: 48,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: DashboardColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: DashboardColors.textPrimary,
                      height: 1.1,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      subtitle!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AdminMetricGrid extends StatelessWidget {
  const AdminMetricGrid({super.key, required this.cards});

  final List<AdminMetricCard> cards;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final spacing = 14.0;
        final itemWidth = (constraints.maxWidth - spacing) / 2;

        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: cards
              .map((card) => SizedBox(width: itemWidth, child: card))
              .toList(),
        );
      },
    );
  }
}

class AdminSectionHeader extends StatelessWidget {
  const AdminSectionHeader({
    super.key,
    required this.title,
    this.actionLabel = 'See all',
    this.onActionTap,
  });

  final String title;
  final String actionLabel;
  final VoidCallback? onActionTap;

  @override
  Widget build(BuildContext context) {
    if (onActionTap == null) {
      return Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w700,
          color: DashboardColors.textPrimary,
        ),
      );
    }

    return DashboardSectionHeader(
      title: title,
      actionLabel: actionLabel,
      onActionTap: onActionTap,
    );
  }
}

class AdminPageTitle extends StatelessWidget {
  const AdminPageTitle({super.key, required this.title, this.subtitle});

  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: DashboardColors.textPrimary,
            height: 1.35,
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 6),
          Text(
            subtitle!,
            softWrap: true,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
        ],
      ],
    );
  }
}

class AdminErrorCard extends StatelessWidget {
  const AdminErrorCard({
    super.key,
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return DashboardErrorCard(message: message, onRetry: onRetry);
  }
}

class AdminEmptyCard extends StatelessWidget {
  const AdminEmptyCard({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return DashboardEmptyCard(message: message);
  }
}

class AdminLoadingCard extends StatelessWidget {
  const AdminLoadingCard({super.key, this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    return DashboardLoadingCard(message: message ?? 'Loading...');
  }
}

class AdminTableContainer extends StatelessWidget {
  const AdminTableContainer({super.key, required this.rows, this.onRowTaps});

  final List<Widget> rows;
  final List<VoidCallback?>? onRowTaps;

  @override
  Widget build(BuildContext context) {
    return AdminSurfaceCard(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: [
          for (var i = 0; i < rows.length; i++)
            AdminTableRow(
              index: i,
              onTap: onRowTaps != null && i < onRowTaps!.length
                  ? onRowTaps![i]
                  : null,
              child: rows[i],
            ),
        ],
      ),
    );
  }
}

class AdminTableRow extends StatelessWidget {
  const AdminTableRow({
    super.key,
    required this.index,
    required this.child,
    this.onTap,
  });

  final int index;
  final Widget child;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isAlt = index.isOdd;

    return Material(
      color: isAlt ? DashboardColors.purpleSoft : DashboardColors.surface,
      child: InkWell(
        onTap: onTap,
        hoverColor: DashboardColors.blueSoft,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: child,
        ),
      ),
    );
  }
}

class AdminSearchField extends StatelessWidget {
  const AdminSearchField({
    super.key,
    required this.hintText,
    required this.onChanged,
  });

  final String hintText;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return TextField(
      decoration: goalFieldDecoration(hintText).copyWith(
        prefixIcon: const Icon(
          Icons.search_rounded,
          color: DashboardColors.textMuted,
        ),
      ),
      onChanged: onChanged,
    );
  }
}

class AdminFilterOption<T> {
  const AdminFilterOption({required this.value, required this.label});

  final T value;
  final String label;
}

class AdminFilterDropdown<T> extends StatelessWidget {
  const AdminFilterDropdown({
    super.key,
    required this.label,
    required this.value,
    required this.options,
    required this.onChanged,
  });

  final String label;
  final T value;
  final List<AdminFilterOption<T>> options;
  final ValueChanged<T?> onChanged;

  InputDecoration _decoration() {
    return InputDecoration(
      labelText: label,
      filled: true,
      fillColor: DashboardColors.surface,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: DashboardColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: DashboardColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: DashboardColors.brandCyan,
          width: 1.5,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DropdownButtonFormField<T>(
      key: ValueKey('$label-$value'),
      isExpanded: true,
      initialValue: value,
      itemHeight: kMinInteractiveDimension,
      menuMaxHeight: 320,
      decoration: _decoration(),
      borderRadius: BorderRadius.circular(14),
      dropdownColor: DashboardColors.surface,
      elevation: 8,
      icon: const Icon(
        Icons.keyboard_arrow_down_rounded,
        color: DashboardColors.textMuted,
      ),
      style: theme.textTheme.bodyMedium?.copyWith(
        color: DashboardColors.textPrimary,
        fontWeight: FontWeight.w500,
        fontSize: 14,
        height: 1.25,
      ),
      items: options
          .map(
            (option) => DropdownMenuItem<T>(
              value: option.value,
              child: Text(
                option.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontSize: 14,
                  height: 1.25,
                  color: DashboardColors.textPrimary,
                ),
              ),
            ),
          )
          .toList(),
      selectedItemBuilder: (context) => options
          .map(
            (option) => Align(
              alignment: Alignment.centerLeft,
              child: Text(
                option.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
          .toList(),
      onChanged: onChanged,
    );
  }
}

class AdminFilterChip extends StatelessWidget {
  const AdminFilterChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(right: context.dashSpacing * 0.4),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: context.dashSpacing * 0.65,
            vertical: context.dashSpacing * 0.45,
          ),
          decoration: BoxDecoration(
            color: selected
                ? DashboardColors.brandSoft
                : DashboardColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected
                  ? DashboardColors.brandCyan
                  : DashboardColors.border,
            ),
          ),
          child: Text(
            label,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: selected
                  ? DashboardColors.brandCyan
                  : DashboardColors.textSecondary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

class AdminSystemAnalyticsPeriodControls extends StatelessWidget {
  const AdminSystemAnalyticsPeriodControls({
    super.key,
    required this.periodLabel,
    required this.selectedWeekOffset,
    required this.canGoForward,
    required this.isLoading,
    required this.onPreviousWeek,
    required this.onNextWeek,
    required this.onPresetSelected,
  });

  final String periodLabel;
  final int selectedWeekOffset;
  final bool canGoForward;
  final bool isLoading;
  final VoidCallback onPreviousWeek;
  final VoidCallback onNextWeek;
  final ValueChanged<int> onPresetSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _PeriodNavButton(
          icon: Icons.chevron_left_rounded,
          tooltip: 'Previous week',
          onPressed: isLoading ? null : onPreviousWeek,
        ),
        PopupMenuButton<int>(
          tooltip: 'Select period',
          enabled: !isLoading,
          offset: const Offset(0, 36),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          onSelected: (offset) {
            if (offset != selectedWeekOffset) {
              onPresetSelected(offset);
            }
          },
          itemBuilder: (context) {
            return systemActivityPresetOffsets.entries
                .map(
                  (entry) => PopupMenuItem<int>(
                    value: entry.value,
                    child: Text(entry.key),
                  ),
                )
                .toList();
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
                  SizedBox(
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
                  periodLabel,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: DashboardColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(width: 2),
                Icon(
                  Icons.expand_more_rounded,
                  size: 16,
                  color: DashboardColors.textMuted,
                ),
              ],
            ),
          ),
        ),
        _PeriodNavButton(
          icon: Icons.chevron_right_rounded,
          tooltip: 'Next week',
          onPressed: (!canGoForward || isLoading) ? null : onNextWeek,
        ),
      ],
    );
  }
}

class _PeriodNavButton extends StatelessWidget {
  const _PeriodNavButton({
    required this.icon,
    required this.tooltip,
    required this.onPressed,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onPressed,
      tooltip: tooltip,
      visualDensity: VisualDensity.compact,
      padding: EdgeInsets.zero,
      constraints: const BoxConstraints.tightFor(width: 32, height: 32),
      icon: Icon(
        icon,
        size: 22,
        color: onPressed == null
            ? DashboardColors.textMuted.withValues(alpha: 0.45)
            : DashboardColors.textSecondary,
      ),
    );
  }
}

class AdminBarChart extends StatefulWidget {
  const AdminBarChart({
    super.key,
    required this.labels,
    required this.fullDayLabels,
    required this.values,
    this.periodKey = 'current-week',
    this.isLoading = false,
  });

  final List<String> labels;
  final List<String> fullDayLabels;
  final List<int> values;
  final String periodKey;
  final bool isLoading;

  @override
  State<AdminBarChart> createState() => _AdminBarChartState();
}

class _AdminBarChartState extends State<AdminBarChart> {
  int? _selectedIndex;

  @override
  void didUpdateWidget(covariant AdminBarChart oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.periodKey != widget.periodKey) {
      _selectedIndex = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final spacing = context.dashSpacing;
    final hasData = widget.values.any((value) => value > 0);
    final maxValue = hasData
        ? widget.values.reduce(math.max).toDouble()
        : 1.0;
    final chartHeight = math.max(context.dashboardSize.height * 0.16, 136.0);
    final dayGap = spacing * 0.28;
    final animationKey = widget.periodKey;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _LegendDot(color: DashboardColors.success, label: 'System Activity'),
        if (_selectedIndex != null && hasData) ...[
          SizedBox(height: spacing * 0.45),
          Text(
            widget.fullDayLabels[_selectedIndex!],
            style: theme.textTheme.labelLarge?.copyWith(
              color: DashboardColors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          Text(
            _activityTooltip(widget.values[_selectedIndex!]),
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
        SizedBox(height: spacing * 0.65),
        SizedBox(
          height: chartHeight,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: List.generate(widget.labels.length, (index) {
                  final count = widget.values[index];
                  final heightFactor =
                      _normalizedHeight(count.toDouble(), maxValue);

                  return Expanded(
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: dayGap),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Expanded(
                            child: LayoutBuilder(
                              builder: (context, constraints) {
                                final barWidth = constraints.maxWidth * 0.45;

                                return GestureDetector(
                                  behavior: HitTestBehavior.opaque,
                                  onTap: hasData
                                      ? () {
                                          setState(() {
                                            _selectedIndex =
                                                _selectedIndex == index
                                                    ? null
                                                    : index;
                                          });
                                        }
                                      : null,
                                  child: Align(
                                    alignment: Alignment.bottomCenter,
                                    child: _Bar(
                                      key: ValueKey('$animationKey-$index'),
                                      width: barWidth,
                                      heightFactor: heightFactor,
                                      color: DashboardColors.success,
                                      isSelected: _selectedIndex == index,
                                      animate: !widget.isLoading,
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                          SizedBox(height: spacing * 0.3),
                          Text(
                            widget.labels[index],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: _selectedIndex == index && hasData
                                  ? DashboardColors.success
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
              if (!hasData && !widget.isLoading)
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: spacing),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'No system activity during this period.',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: DashboardColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      SizedBox(height: spacing * 0.35),
                      Text(
                        'Try selecting another week.',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: DashboardColors.textMuted,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              if (widget.isLoading)
                Container(
                  color: DashboardColors.surface.withValues(alpha: 0.72),
                  alignment: Alignment.center,
                  child: SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      color: DashboardColors.brandCyan,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  double _normalizedHeight(double value, double maxValue) {
    if (value <= 0 || maxValue <= 0) {
      return 0;
    }

    return (value / maxValue).clamp(0.12, 1);
  }

  String _activityTooltip(int count) {
    final label = count == 1 ? 'event' : 'events';
    return 'System Activity: $count $label';
  }
}

class _LegendDot extends StatelessWidget {
  const _LegendDot({required this.color, required this.label});

  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: DashboardColors.textSecondary,
            fontWeight: FontWeight.w600,
            height: 1.2,
          ),
        ),
      ],
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({
    super.key,
    required this.heightFactor,
    required this.color,
    required this.width,
    this.isSelected = false,
    this.animate = true,
  });

  final double heightFactor;
  final Color color;
  final double width;
  final bool isSelected;
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

        return Align(
          alignment: Alignment.bottomCenter,
          child: AnimatedContainer(
            duration: animate ? const Duration(milliseconds: 350) : Duration.zero,
            curve: Curves.easeOutCubic,
            width: width,
            height: barHeight,
            decoration: BoxDecoration(
              color: isSelected ? color : color.withValues(alpha: 0.88),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(8),
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: color.withValues(alpha: 0.25),
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

class AdminBottomNav extends StatelessWidget {
  const AdminBottomNav({super.key, this.currentIndex, this.onTap});

  final DashboardNavItem? currentIndex;
  final ValueChanged<DashboardNavItem>? onTap;

  @override
  Widget build(BuildContext context) {
    return DashboardBottomNav(
      currentIndex: currentIndex,
      onTap: onTap,
      accentColor: DashboardColors.brandCyan,
    );
  }
}
