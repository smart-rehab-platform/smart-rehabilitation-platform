import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../presence/widgets/online_status_dot.dart';
import 'dashboard_layout.dart';
import 'dashboard_profile_avatar.dart';
import 'dashboard_profile_field.dart';
import 'dashboard_surface_card.dart';

class SharedProfileCard extends ConsumerWidget {
  const SharedProfileCard({
    super.key,
    required this.initials,
    required this.fields,
    required this.onLogout,
    this.imageUrl,
    this.initialsFallback = 'SR',
    this.presenceUserId,
    this.onEditPressed,
    this.editProfileLabel,
    this.logoutLabel,
    this.accentColor = DashboardColors.brandCyan,
    this.cardTint = DashboardColors.brandCyan,
    this.useBrandLogoutGradient = false,
  });

  final String initials;
  final String initialsFallback;
  final String? imageUrl;
  final List<DashboardProfileFieldEntry> fields;
  final String? presenceUserId;
  final VoidCallback? onEditPressed;
  final String? editProfileLabel;
  final String? logoutLabel;
  final VoidCallback onLogout;
  final Color accentColor;
  final Color cardTint;
  final bool useBrandLogoutGradient;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DashboardSurfaceCard(
      tint: cardTint,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: DashboardProfileAvatar(
              initials: dashboardInitials(initials, fallback: initialsFallback),
              imageUrl: imageUrl,
              radius: 40,
            ),
          ),
          SizedBox(height: context.dashSpacing),
          ...fields.map((field) => DashboardProfileField.fromEntry(field)),
          if (presenceUserId != null && presenceUserId!.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Row(
              children: [
                OnlineStatusDot(userId: presenceUserId!),
                SizedBox(width: context.dashSpacing * 0.35),
                PresenceStatusLabel(userId: presenceUserId!),
              ],
            ),
          ],
          SizedBox(height: context.dashSpacing),
          if (onEditPressed != null) ...[
            OutlinedButton.icon(
              onPressed: onEditPressed,
              icon: const Icon(Icons.edit_outlined),
              label: Text(editProfileLabel ?? 'Edit Profile'),
              style: OutlinedButton.styleFrom(
                foregroundColor: accentColor,
                side: BorderSide(color: accentColor),
                padding: EdgeInsets.symmetric(
                  vertical: context.dashSpacing * 0.75,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
          ],
          if (useBrandLogoutGradient)
            _BrandGradientButton(
              onPressed: onLogout,
              label: logoutLabel ?? 'Logout',
              verticalPadding: context.dashSpacing * 0.75,
            )
          else
            ElevatedButton(
              onPressed: onLogout,
              style: ElevatedButton.styleFrom(
                backgroundColor: accentColor,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(
                  vertical: context.dashSpacing * 0.75,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: Text(logoutLabel ?? 'Logout'),
            ),
        ],
      ),
    );
  }
}

class _BrandGradientButton extends StatefulWidget {
  const _BrandGradientButton({
    required this.onPressed,
    required this.label,
    required this.verticalPadding,
  });

  final VoidCallback onPressed;
  final String label;
  final double verticalPadding;

  @override
  State<_BrandGradientButton> createState() => _BrandGradientButtonState();
}

class _BrandGradientButtonState extends State<_BrandGradientButton> {
  static const _pressDuration = Duration(milliseconds: 135);
  bool _pressed = false;

  void _setPressed(bool value) {
    if (_pressed == value) {
      return;
    }
    setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => _setPressed(true),
      onTapUp: (_) => _setPressed(false),
      onTapCancel: () => _setPressed(false),
      onTap: widget.onPressed,
      child: AnimatedScale(
        scale: _pressed ? 0.975 : 1,
        duration: _pressDuration,
        curve: Curves.easeInOut,
        child: AnimatedContainer(
          duration: _pressDuration,
          curve: Curves.easeInOut,
          decoration: BoxDecoration(
            gradient: DashboardColors.brandPrimaryGradient,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: DashboardColors.brandCyan.withValues(alpha: 0.22),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
              if (_pressed)
                BoxShadow(
                  color: DashboardColors.brandCyan.withValues(alpha: 0.11),
                  blurRadius: 22,
                  spreadRadius: 1,
                ),
            ],
          ),
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: widget.verticalPadding),
            child: Center(
              child: Text(
                widget.label,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

List<DashboardProfileFieldEntry> buildRequiredProfileFields({
  required String fullName,
  required String email,
  required String role,
}) {
  return [
    DashboardProfileFieldEntry(label: 'Full Name', value: fullName),
    DashboardProfileFieldEntry(label: 'Email', value: email),
    DashboardProfileFieldEntry(label: 'Role', value: role),
  ];
}

DashboardProfileFieldEntry? optionalProfileField(
  String label,
  String? value, {
  bool multiline = false,
}) {
  final normalized = nonEmptyProfileValue(value);
  if (normalized == null) {
    return null;
  }
  return DashboardProfileFieldEntry(
    label: label,
    value: normalized,
    multiline: multiline,
  );
}

void appendOptionalProfileField(
  List<DashboardProfileFieldEntry> fields,
  String label,
  String? value, {
  bool multiline = false,
}) {
  final entry = optionalProfileField(label, value, multiline: multiline);
  if (entry != null) {
    fields.add(entry);
  }
}
