import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'responsive_layout.dart';

class CustomTextField extends StatelessWidget {
  const CustomTextField({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.helperText,
    this.errorText,
    this.prefixIcon,
    this.suffixIcon,
    this.keyboardType,
    this.textInputAction,
    this.onChanged,
    this.onSubmitted,
    this.validator,
    this.autofillHints,
    this.inputFormatters,
    this.maxLines = 1,
    this.readOnly = false,
    this.enabled = true,
    this.obscureText = false,
    this.autocorrect = true,
    this.textCapitalization = TextCapitalization.none,
  });

  final TextEditingController? controller;
  final String? label;
  final String? hint;
  final String? helperText;
  final String? errorText;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final FormFieldValidator<String>? validator;
  final Iterable<String>? autofillHints;
  final List<TextInputFormatter>? inputFormatters;
  final int maxLines;
  final bool readOnly;
  final bool enabled;
  final bool obscureText;
  final bool autocorrect;
  final TextCapitalization textCapitalization;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final decorationTheme = theme.inputDecorationTheme;

    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      onChanged: onChanged,
      onFieldSubmitted: onSubmitted,
      validator: validator,
      autofillHints: autofillHints,
      inputFormatters: inputFormatters,
      maxLines: maxLines,
      readOnly: readOnly,
      enabled: enabled,
      obscureText: obscureText,
      autocorrect: autocorrect,
      textCapitalization: textCapitalization,
      style: theme.textTheme.bodyLarge?.copyWith(
        color: theme.colorScheme.onSurface,
      ),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        helperText: helperText,
        errorText: errorText,
        prefixIcon: prefixIcon,
        suffixIcon: suffixIcon,
        filled: decorationTheme.filled,
        fillColor: decorationTheme.fillColor,
        contentPadding: EdgeInsets.symmetric(
          horizontal: context.spacingUnit,
          vertical: context.spacingUnit * 0.875,
        ),
        border: decorationTheme.border,
        enabledBorder: decorationTheme.enabledBorder,
        focusedBorder: decorationTheme.focusedBorder,
        errorBorder: decorationTheme.errorBorder,
        focusedErrorBorder: decorationTheme.focusedErrorBorder,
        labelStyle: decorationTheme.labelStyle,
        hintStyle: decorationTheme.hintStyle,
        errorStyle: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.error,
        ),
      ),
    );
  }
}
