import 'package:flutter/material.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/constants/dashboard_colors.dart';

class DashboardProfileAvatar extends StatelessWidget {
  const DashboardProfileAvatar({
    super.key,
    required this.initials,
    this.imageUrl,
    this.radius = 20,
    this.isLoading = false,
  });

  final String initials;
  final String? imageUrl;
  final double radius;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final resolvedUrl = ApiConstants.resolveMediaUrl(imageUrl);

    return CircleAvatar(
      radius: radius,
      backgroundColor: DashboardColors.purpleSoft,
      backgroundImage:
          resolvedUrl != null ? NetworkImage(resolvedUrl) : null,
      child: isLoading
          ? SizedBox(
              width: radius,
              height: radius,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: DashboardColors.primary,
              ),
            )
          : resolvedUrl == null
              ? Text(
                  initials,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: DashboardColors.primary,
                    fontWeight: FontWeight.w700,
                    fontSize: radius * 0.72,
                  ),
                )
              : null,
    );
  }
}

class EditableProfileAvatar extends StatelessWidget {
  const EditableProfileAvatar({
    super.key,
    required this.initials,
    this.imageUrl,
    this.radius = 40,
    this.isLoading = false,
    this.onEditTap,
  });

  final String initials;
  final String? imageUrl;
  final double radius;
  final bool isLoading;
  final VoidCallback? onEditTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            DashboardProfileAvatar(
              initials: initials,
              imageUrl: imageUrl,
              radius: radius,
              isLoading: isLoading,
            ),
            Positioned(
              right: 0,
              bottom: 0,
              child: Material(
                color: DashboardColors.primary,
                shape: const CircleBorder(),
                elevation: 2,
                child: InkWell(
                  onTap: isLoading ? null : onEditTap,
                  customBorder: const CircleBorder(),
                  child: const Padding(
                    padding: EdgeInsets.all(8),
                    child: Icon(
                      Icons.camera_alt_rounded,
                      size: 18,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Tap camera to change photo',
          style: theme.textTheme.labelSmall?.copyWith(
            color: DashboardColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
