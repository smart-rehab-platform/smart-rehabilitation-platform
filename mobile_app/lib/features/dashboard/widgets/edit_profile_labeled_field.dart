import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/constants/dashboard_colors.dart';
import 'dashboard_layout.dart';

/// Persistent label + input row for Edit Profile forms.
class EditProfileLabeledField extends StatelessWidget {
  const EditProfileLabeledField({
    super.key,
    required this.label,
    required this.controller,
    this.onChanged,
    this.keyboardType,
    this.textInputAction,
    this.minLines = 1,
    this.maxLines = 1,
    this.inputFormatters,
  });

  final String label;
  final TextEditingController controller;
  final ValueChanged<String>? onChanged;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final int minLines;
  final int maxLines;
  final List<TextInputFormatter>? inputFormatters;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          label,
          style: theme.textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w600,
            color: DashboardColors.textPrimary,
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.35),
        TextField(
          controller: controller,
          onChanged: onChanged,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          minLines: minLines,
          maxLines: maxLines,
          inputFormatters: inputFormatters,
          decoration: editProfileFieldDecoration(),
        ),
      ],
    );
  }
}

InputDecoration editProfileFieldDecoration() {
  return InputDecoration(
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
      borderSide: const BorderSide(color: DashboardColors.brandCyan),
    ),
  );
}
