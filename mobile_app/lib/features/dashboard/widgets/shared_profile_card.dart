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
  });

  final String initials;
  final String initialsFallback;
  final String? imageUrl;
  final List<DashboardProfileFieldEntry> fields;
  final String? presenceUserId;
  final VoidCallback? onEditPressed;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DashboardSurfaceCard(
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
          ...fields.map(
            (field) => DashboardProfileField.fromEntry(field),
          ),
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
              label: const Text('Edit Profile'),
              style: OutlinedButton.styleFrom(
                foregroundColor: DashboardColors.primary,
                side: const BorderSide(color: DashboardColors.primary),
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
          ElevatedButton(
            onPressed: onLogout,
            style: ElevatedButton.styleFrom(
              backgroundColor: DashboardColors.primary,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                vertical: context.dashSpacing * 0.75,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            child: const Text('Logout'),
          ),
        ],
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
