import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/specialist_edit_treatment_plan_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';

class EditTreatmentPlanPatientHeader extends StatelessWidget {
  const EditTreatmentPlanPatientHeader({super.key, required this.patientName});

  final String patientName;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        children: [
          CircleAvatar(
            radius: context.dashSpacing * 0.9,
            backgroundColor: DashboardColors.blueSoft,
            child: Text(
              dashboardAvatarLetter(patientName),
              style: theme.textTheme.headlineSmall?.copyWith(
                color: const Color(0xFF3B82F6),
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          Text(
            patientName,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class PlanStatusSelector extends StatelessWidget {
  const PlanStatusSelector({
    super.key,
    required this.status,
    required this.onChanged,
  });

  final TreatmentPlanStatus status;
  final ValueChanged<TreatmentPlanStatus> onChanged;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: context.dashSpacing * 0.45,
      runSpacing: context.dashSpacing * 0.45,
      children: TreatmentPlanStatus.values.map((value) {
        final selected = status == value;
        return InkWell(
          onTap: () => onChanged(value),
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: EdgeInsets.symmetric(
              horizontal: context.dashSpacing * 0.65,
              vertical: context.dashSpacing * 0.5,
            ),
            decoration: BoxDecoration(
              color: selected
                  ? DashboardColors.purpleSoft
                  : DashboardColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: selected
                    ? DashboardColors.primary
                    : DashboardColors.border,
              ),
            ),
            child: Text(
              value.label,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: selected
                        ? DashboardColors.primary
                        : DashboardColors.textSecondary,
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class PlanDatePickerField extends StatelessWidget {
  const PlanDatePickerField({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
    this.allowClear = false,
  });

  final String label;
  final DateTime? value;
  final ValueChanged<DateTime?> onChanged;
  final bool allowClear;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final display = value != null
        ? DateFormat('MMM d, yyyy').format(value!)
        : 'Select date';

    return DashboardSurfaceCard(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: value ?? DateTime.now(),
          firstDate: DateTime(2015),
          lastDate: DateTime(2100),
        );
        if (picked != null) {
          onChanged(picked);
        }
      },
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: DashboardColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.2),
                Text(
                  display,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: DashboardColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
          if (allowClear && value != null)
            IconButton(
              onPressed: () => onChanged(null),
              icon: const Icon(Icons.clear_rounded),
              color: DashboardColors.textMuted,
            ),
          Icon(
            Icons.calendar_today_outlined,
            color: DashboardColors.primary,
            size: context.dashSpacing * 0.55,
          ),
        ],
      ),
    );
  }
}

InputDecoration _planFieldDecoration(String hint) {
  return InputDecoration(
    hintText: hint,
    filled: true,
    fillColor: DashboardColors.surface,
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
      borderSide: const BorderSide(color: DashboardColors.primary),
    ),
  );
}

Widget buildPlanTitleField({
  required TextEditingController controller,
  required ValueChanged<String> onChanged,
}) {
  return TextField(
    controller: controller,
    onChanged: onChanged,
    decoration: _planFieldDecoration('Treatment plan title'),
  );
}
