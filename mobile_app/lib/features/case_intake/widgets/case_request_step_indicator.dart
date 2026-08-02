import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../dashboard/widgets/dashboard_layout.dart';

const caseRequestFormSteps = <String>[
  'Child',
  'Category',
  'Description',
  'History',
  'Contact',
  'Review',
];

class CaseRequestStepIndicator extends StatelessWidget {
  const CaseRequestStepIndicator({
    super.key,
    required this.currentStep,
    required this.totalSteps,
    this.accentColor = DashboardColors.brandCyan,
  });

  final int currentStep;
  final int totalSteps;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: List.generate(totalSteps, (index) {
            final isComplete = index < currentStep;
            final isCurrent = index == currentStep;
            final color = isComplete || isCurrent
                ? accentColor
                : DashboardColors.border;

            return Expanded(
              child: Container(
                height: 4,
                margin: EdgeInsetsDirectional.only(
                  end: index == totalSteps - 1 ? 0 : context.dashSpacing * 0.2,
                ),
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            );
          }),
        ),
        SizedBox(height: context.dashSpacing * 0.35),
        Text(
          'Step ${currentStep + 1} of $totalSteps: ${caseRequestFormSteps[currentStep]}',
          style: theme.textTheme.labelLarge?.copyWith(
            color: DashboardColors.textSecondary,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}
