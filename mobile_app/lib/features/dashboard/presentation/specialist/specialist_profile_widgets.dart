import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/specialist_profile_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';

class SpecialistProfileHeaderCard extends StatelessWidget {
  const SpecialistProfileHeaderCard({
    super.key,
    required this.fullName,
    required this.email,
    this.specialization,
    this.profileImageUrl,
  });

  final String fullName;
  final String email;
  final String? specialization;
  final String? profileImageUrl;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        children: [
          DashboardProfileAvatar(
            initials: dashboardInitials(fullName, fallback: 'SP'),
            imageUrl: profileImageUrl,
            radius: context.dashSpacing * 0.9,
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          Text(
            fullName,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          if (specialization != null && specialization!.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.2),
            Text(
              specialization!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.primary,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.2),
          Text(
            email,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class SpecialistProfessionalInfoCard extends StatelessWidget {
  const SpecialistProfessionalInfoCard({
    super.key,
    required this.professional,
    this.phone,
  });

  final SpecialistProfessionalInfo? professional;
  final String? phone;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final rows = <Widget>[];

    void addRow(String label, String? value) {
      if (value == null || value.trim().isEmpty) {
        return;
      }
      rows.add(ProfileInfoRow(label: label, value: value));
    }

    addRow('Phone', phone);
    addRow('Specialization', professional?.specialization);
    addRow('License Number', professional?.licenseNumber);
    if (professional?.yearsOfExperience != null) {
      addRow(
        'Years of Experience',
        '${professional!.yearsOfExperience}',
      );
    }
    addRow('Bio', professional?.bio);

    if (rows.isEmpty) {
      return DashboardSurfaceCard(
        child: Text(
          'No professional information available.',
          style: theme.textTheme.bodySmall?.copyWith(
            color: DashboardColors.textMuted,
          ),
        ),
      );
    }

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: rows,
      ),
    );
  }
}

class ProfileInfoRow extends StatelessWidget {
  const ProfileInfoRow({
    super.key,
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.55),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: DashboardColors.textMuted,
                  fontWeight: FontWeight.w600,
                ),
          ),
          SizedBox(height: context.dashSpacing * 0.15),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: DashboardColors.textPrimary,
                  height: label == 'Bio' ? 1.45 : 1.2,
                ),
          ),
        ],
      ),
    );
  }
}
