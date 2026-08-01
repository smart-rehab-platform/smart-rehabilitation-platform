import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/constants/admin_dashboard_colors.dart';
import '../../../core/constants/api_constants.dart';
import 'dashboard_bottom_nav.dart';
import 'dashboard_layout.dart';

class AdminSurfaceCard extends StatelessWidget {
  const AdminSurfaceCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.tint = AdminDashboardColors.primary,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final Color tint;

  @override
  Widget build(BuildContext context) {
    final content = AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      padding: padding ?? const EdgeInsets.all(20),
      child: child,
    );

    final card = DecoratedBox(
      decoration: BoxDecoration(
        color: AdminDashboardColors.surface,
        borderRadius: AdminDecorations.cardRadius,
        border: Border.all(color: AdminDashboardColors.border),
        boxShadow: AdminDecorations.cardShadow(tint),
      ),
      child: onTap == null
          ? content
          : Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onTap,
                borderRadius: AdminDecorations.cardRadius,
                splashColor: AdminDashboardColors.primary.withValues(
                  alpha: 0.08,
                ),
                highlightColor: AdminDashboardColors.primary.withValues(
                  alpha: 0.04,
                ),
                child: content,
              ),
            ),
    );

    return card;
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
                      color: AdminDashboardColors.textSecondary,
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
                      color: AdminDashboardColors.textPrimary,
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
                        color: AdminDashboardColors.textMuted,
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
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w800,
              color: AdminDashboardColors.textPrimary,
            ),
          ),
        ),
        if (onActionTap != null)
          TextButton(
            onPressed: onActionTap,
            style: TextButton.styleFrom(
              foregroundColor: AdminDashboardColors.primary,
            ),
            child: Text(
              actionLabel,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: AdminDashboardColors.primary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
      ],
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
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w800,
            color: AdminDashboardColors.textPrimary,
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 6),
          Text(
            subtitle!,
            softWrap: true,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AdminDashboardColors.textSecondary,
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
    return AdminSurfaceCard(
      tint: AdminDashboardColors.danger,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const AdminIconCircle(
                icon: Icons.error_outline_rounded,
                color: AdminDashboardColors.danger,
                background: AdminDashboardColors.redSoft,
                size: 40,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          FilledButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}

class AdminEmptyCard extends StatelessWidget {
  const AdminEmptyCard({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return AdminSurfaceCard(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AdminDashboardColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}

class AdminLoadingCard extends StatelessWidget {
  const AdminLoadingCard({super.key, this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(),
            if (message != null) ...[
              const SizedBox(height: 16),
              Text(
                message!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AdminDashboardColors.textSecondary,
                ),
              ),
            ],
          ],
        ),
      ),
    );
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
      color: isAlt
          ? AdminDashboardColors.slateSoft
          : AdminDashboardColors.surface,
      child: InkWell(
        onTap: onTap,
        hoverColor: AdminDashboardColors.blueSoft,
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
      decoration: InputDecoration(
        hintText: hintText,
        prefixIcon: const Icon(
          Icons.search_rounded,
          color: AdminDashboardColors.textMuted,
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
      fillColor: AdminDashboardColors.surface,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AdminDashboardColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AdminDashboardColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: AdminDashboardColors.primary,
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
      dropdownColor: AdminDashboardColors.surface,
      elevation: 8,
      icon: const Icon(
        Icons.keyboard_arrow_down_rounded,
        color: AdminDashboardColors.textMuted,
      ),
      style: theme.textTheme.bodyMedium?.copyWith(
        color: AdminDashboardColors.textPrimary,
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
                  color: AdminDashboardColors.textPrimary,
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
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        selectedColor: AdminDashboardColors.blueSoft,
        checkmarkColor: AdminDashboardColors.primary,
        labelStyle: Theme.of(context).textTheme.labelLarge?.copyWith(
          color: selected
              ? AdminDashboardColors.primary
              : AdminDashboardColors.textSecondary,
          fontWeight: FontWeight.w600,
        ),
        side: BorderSide(
          color: selected
              ? AdminDashboardColors.primary
              : AdminDashboardColors.border,
        ),
      ),
    );
  }
}

class AdminBarChart extends StatelessWidget {
  const AdminBarChart({
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
    final spacing = context.dashSpacing;
    final hasUsersData = usersValues.any((value) => value > 0);
    final hasPatientsData = patientsValues.any((value) => value > 0);
    final userMax = hasUsersData ? usersValues.reduce(math.max) : 1.0;
    final patientMax = hasPatientsData ? patientsValues.reduce(math.max) : 1.0;
    final chartHeight = math.max(context.dashboardSize.height * 0.16, 136.0);
    final dayGap = spacing * 0.28;
    final barPairGap = spacing * 0.28;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (hasUsersData || hasPatientsData)
          Row(
            children: [
              if (hasUsersData) ...[
                _LegendDot(color: AdminDashboardColors.primary, label: 'Users'),
                if (hasPatientsData) SizedBox(width: spacing * 0.85),
              ],
              if (hasPatientsData)
                _LegendDot(
                  color: AdminDashboardColors.success,
                  label: 'Patients',
                ),
            ],
          ),
        if (hasUsersData || hasPatientsData) SizedBox(height: spacing * 0.65),
        SizedBox(
          height: chartHeight,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(labels.length, (index) {
              final userHeight = hasUsersData
                  ? _normalizedHeight(usersValues[index], userMax)
                  : 0.0;
              final patientHeight = hasPatientsData
                  ? _normalizedHeight(patientsValues[index], patientMax)
                  : 0.0;

              return Expanded(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: dayGap),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Expanded(
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            final showBoth = hasUsersData && hasPatientsData;
                            final barWidth = showBoth
                                ? ((constraints.maxWidth - barPairGap) / 2) *
                                      0.72
                                : constraints.maxWidth * 0.45;

                            return Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                if (hasUsersData) ...[
                                  _Bar(
                                    width: barWidth,
                                    heightFactor: userHeight,
                                    color: AdminDashboardColors.primary,
                                  ),
                                  if (hasPatientsData)
                                    SizedBox(width: barPairGap),
                                ],
                                if (hasPatientsData)
                                  _Bar(
                                    width: barWidth,
                                    heightFactor: patientHeight,
                                    color: AdminDashboardColors.success,
                                  ),
                              ],
                            );
                          },
                        ),
                      ),
                      SizedBox(height: spacing * 0.3),
                      Text(
                        labels[index],
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: AdminDashboardColors.textMuted,
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

  double _normalizedHeight(double value, double maxValue) {
    if (value <= 0 || maxValue <= 0) {
      return 0;
    }

    return (value / maxValue).clamp(0.12, 1);
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
            color: AdminDashboardColors.textSecondary,
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
    required this.heightFactor,
    required this.color,
    required this.width,
  });

  final double heightFactor;
  final Color color;
  final double width;

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
            duration: const Duration(milliseconds: 350),
            curve: Curves.easeOutCubic,
            width: width,
            height: barHeight,
            decoration: BoxDecoration(
              color: color,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(8),
              ),
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
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: AdminDashboardColors.surface,
        border: const Border(
          top: BorderSide(color: AdminDashboardColors.border),
        ),
        boxShadow: [
          BoxShadow(
            color: AdminDashboardColors.primary.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: context.dashSpacing * 0.25,
            vertical: context.dashSpacing * 0.35,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                icon: Icons.home_rounded,
                label: 'Home',
                isActive: currentIndex == DashboardNavItem.home,
                onTap: () => onTap?.call(DashboardNavItem.home),
                theme: theme,
              ),
              _NavItem(
                icon: Icons.people_outline_rounded,
                label: 'Patients',
                isActive: currentIndex == DashboardNavItem.patients,
                onTap: () => onTap?.call(DashboardNavItem.patients),
                theme: theme,
              ),
              _NavItem(
                icon: Icons.fitness_center_outlined,
                label: 'Exercises',
                isActive: currentIndex == DashboardNavItem.exercises,
                onTap: () => onTap?.call(DashboardNavItem.exercises),
                theme: theme,
              ),
              _NavItem(
                icon: Icons.description_outlined,
                label: 'Reports',
                isActive: currentIndex == DashboardNavItem.reports,
                onTap: () => onTap?.call(DashboardNavItem.reports),
                theme: theme,
              ),
              _NavItem(
                icon: Icons.grid_view_rounded,
                label: 'More',
                isActive: currentIndex == DashboardNavItem.more,
                onTap: () => onTap?.call(DashboardNavItem.more),
                theme: theme,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
    required this.theme,
  });

  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback? onTap;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    final color = isActive
        ? AdminDashboardColors.primary
        : AdminDashboardColors.textMuted;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: context.dashSpacing * 0.25,
          vertical: context.dashSpacing * 0.15,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: context.dashSpacing * 0.55, color: color),
            SizedBox(height: context.dashSpacing * 0.1),
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: color,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
