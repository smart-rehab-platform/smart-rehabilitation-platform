import 'package:flutter/material.dart';

import '../models/case_intake_request_model.dart';

typedef CaseRequestStatusVisual = ({
  String label,
  Color background,
  Color foreground,
  Color border,
  IconData icon,
});

CaseRequestStatusVisual caseRequestStatusVisual(CaseIntakeStatus? status) {
  switch (status) {
    case CaseIntakeStatus.assigned:
      return (
        label: 'Specialist Assigned',
        background: const Color(0xFFE8F1FF),
        foreground: const Color(0xFF1565C0),
        border: const Color(0xFF1565C0).withValues(alpha: 0.18),
        icon: Icons.person_outline_rounded,
      );
    case CaseIntakeStatus.underAssessment:
      return (
        label: 'Under Assessment',
        background: const Color(0xFFEAF4FF),
        foreground: const Color(0xFF0277BD),
        border: const Color(0xFF0277BD).withValues(alpha: 0.18),
        icon: Icons.fact_check_outlined,
      );
    case CaseIntakeStatus.accepted:
      return (
        label: 'Accepted',
        background: const Color(0xFFEAF8EE),
        foreground: const Color(0xFF2E7D32),
        border: const Color(0xFF2E7D32).withValues(alpha: 0.18),
        icon: Icons.check_circle_outline_rounded,
      );
    case CaseIntakeStatus.rejected:
      return (
        label: 'Rejected',
        background: const Color(0xFFFDECEC),
        foreground: const Color(0xFFD32F2F),
        border: const Color(0xFFD32F2F).withValues(alpha: 0.18),
        icon: Icons.cancel_outlined,
      );
    case CaseIntakeStatus.convertedToPatient:
      return (
        label: 'Profile Created',
        background: const Color(0xFFE8F5E9),
        foreground: const Color(0xFF1B5E20),
        border: const Color(0xFF1B5E20).withValues(alpha: 0.18),
        icon: Icons.child_care_outlined,
      );
    case CaseIntakeStatus.pending:
    default:
      return (
        label: 'Pending Review',
        background: const Color(0xFFFFF8E1),
        foreground: const Color(0xFFF9A825),
        border: const Color(0xFFF9A825).withValues(alpha: 0.22),
        icon: Icons.hourglass_top_rounded,
      );
  }
}

class CaseRequestStatusChip extends StatelessWidget {
  const CaseRequestStatusChip({super.key, required this.status});

  final CaseIntakeStatus? status;

  @override
  Widget build(BuildContext context) {
    final visual = caseRequestStatusVisual(status);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: visual.background,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: visual.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(visual.icon, size: 14, color: visual.foreground),
          const SizedBox(width: 4),
          Text(
            visual.label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: visual.foreground,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
