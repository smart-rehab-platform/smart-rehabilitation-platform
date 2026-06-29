import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../providers/specialist_features_provider.dart';
import '../../widgets/admin_navigation.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/specialist_page_scaffold.dart';
import '../../../presence/widgets/online_status_dot.dart';

class AdminProfileScreen extends ConsumerStatefulWidget {
  const AdminProfileScreen({super.key});

  @override
  ConsumerState<AdminProfileScreen> createState() => _AdminProfileScreenState();
}

class _AdminProfileScreenState extends ConsumerState<AdminProfileScreen> {
  final ImagePicker _imagePicker = ImagePicker();
  bool _isUploadingPhoto = false;

  Future<void> _changeProfilePhoto() async {
    final action = await showModalBottomSheet<_PhotoAction>(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Choose from gallery'),
              onTap: () => Navigator.pop(context, _PhotoAction.gallery),
            ),
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Take a photo'),
              onTap: () => Navigator.pop(context, _PhotoAction.camera),
            ),
          ],
        ),
      ),
    );

    if (action == null || !mounted) {
      return;
    }

    final picked = await _imagePicker.pickImage(
      source: action == _PhotoAction.camera ? ImageSource.camera : ImageSource.gallery,
      maxWidth: 1200,
      imageQuality: 85,
    );

    if (picked == null || !mounted) {
      return;
    }

    setState(() => _isUploadingPhoto = true);

    final bytes = await picked.readAsBytes();
    final filename = picked.name.isNotEmpty ? picked.name : 'profile.jpg';
    final success = await ref.read(authProvider.notifier).uploadProfileImage(
          bytes,
          filename,
        );

    if (!mounted) {
      return;
    }

    setState(() => _isUploadingPhoto = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          success
              ? 'Profile photo updated successfully.'
              : ref.read(authProvider).errorMessage ?? 'Failed to upload photo.',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;

    return AdminPageScaffold(
      title: 'Profile',
      showBackButton: true,
      showBottomNav: false,
      body: SingleChildScrollView(
        padding: context.dashPadding,
        child: DashboardSurfaceCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: EditableProfileAvatar(
                  initials: dashboardInitials(user?.fullName, fallback: 'AD'),
                  imageUrl: user?.profileImageUrl,
                  isLoading: _isUploadingPhoto,
                  onEditTap: _changeProfilePhoto,
                ),
              ),
              SizedBox(height: context.dashSpacing),
              _ProfileRow(label: 'Full Name', value: user?.fullName ?? '—'),
              _ProfileRow(label: 'Email', value: user?.email ?? '—'),
              _ProfileRow(label: 'Role', value: user?.role ?? 'admin'),
              if (user?.id != null) ...[
                SizedBox(height: context.dashSpacing * 0.35),
                Row(
                  children: [
                    OnlineStatusDot(userId: user!.id!),
                    SizedBox(width: context.dashSpacing * 0.35),
                    PresenceStatusLabel(userId: user.id!),
                  ],
                ),
              ],
              SizedBox(height: context.dashSpacing),
              ElevatedButton(
                onPressed: () => AdminNavigation.logout(context, ref),
                style: ElevatedButton.styleFrom(
                  backgroundColor: DashboardColors.primary,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.75),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Logout'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

enum _PhotoAction { gallery, camera }

class AdminMoreScreen extends ConsumerWidget {
  const AdminMoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AdminPageScaffold(
      title: 'More',
      currentNav: DashboardNavItem.more,
      body: ListView(
        padding: context.dashPadding,
        children: [
          _MoreTile(
            icon: Icons.groups_outlined,
            label: 'Users',
            onTap: () => context.go(AppRoutes.adminUsers),
          ),
          _MoreTile(
            icon: Icons.assignment_ind_outlined,
            label: 'Patient Assignments',
            onTap: () => context.go(AppRoutes.adminPatientAssignments),
          ),
          _MoreTile(
            icon: Icons.notifications_none_rounded,
            label: 'Notifications',
            onTap: () => context.go(AppRoutes.adminNotifications),
          ),
          _MoreTile(
            icon: Icons.person_outline_rounded,
            label: 'Profile',
            onTap: () => context.push(AppRoutes.adminProfile),
          ),
          _MoreTile(
            icon: Icons.logout_rounded,
            label: 'Logout',
            onTap: () => AdminNavigation.logout(context, ref),
          ),
        ],
      ),
    );
  }
}

class AdminExercisesScreen extends ConsumerStatefulWidget {
  const AdminExercisesScreen({super.key});

  @override
  ConsumerState<AdminExercisesScreen> createState() => _AdminExercisesScreenState();
}

class _AdminExercisesScreenState extends ConsumerState<AdminExercisesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistExercisesProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistExercisesProvider);
    final theme = Theme.of(context);

    return AdminPageScaffold(
      title: 'Exercises',
      currentNav: DashboardNavItem.exercises,
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref.read(specialistExercisesProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No exercises available yet.',
        child: Column(
          children: state.items
              .map(
                (exercise) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: DashboardSurfaceCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          exercise.title,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        if (exercise.instructions != null)
                          Text(
                            exercise.instructions!,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: DashboardColors.textSecondary,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              )
              .toList(),
        ),
      ),
    );
  }
}

class AdminReportsScreen extends ConsumerStatefulWidget {
  const AdminReportsScreen({super.key});

  @override
  ConsumerState<AdminReportsScreen> createState() => _AdminReportsScreenState();
}

class _AdminReportsScreenState extends ConsumerState<AdminReportsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistReportsProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistReportsProvider);
    final theme = Theme.of(context);

    return AdminPageScaffold(
      title: 'Reports',
      currentNav: DashboardNavItem.reports,
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref.read(specialistReportsProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No reports found.',
        child: Column(
          children: state.items
              .map(
                (report) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: DashboardSurfaceCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          report.title,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        if (report.patientName != null || report.reportType != null)
                          Text(
                            [
                              if (report.patientName != null) report.patientName,
                              if (report.reportType != null) report.reportType,
                            ].whereType<String>().join(' • '),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: DashboardColors.textSecondary,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              )
              .toList(),
        ),
      ),
    );
  }
}

class AdminNotificationsScreen extends ConsumerStatefulWidget {
  const AdminNotificationsScreen({super.key});

  @override
  ConsumerState<AdminNotificationsScreen> createState() =>
      _AdminNotificationsScreenState();
}

class _AdminNotificationsScreenState extends ConsumerState<AdminNotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistNotificationsProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistNotificationsProvider);
    final theme = Theme.of(context);

    return AdminPageScaffold(
      title: 'Notifications',
      showBackButton: true,
      actions: [
        if (state.unreadCount > 0)
          TextButton(
            onPressed: state.isUpdating
                ? null
                : () => ref.read(specialistNotificationsProvider.notifier).markAllAsRead(),
            child: const Text('Mark all as read'),
          ),
      ],
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref.read(specialistNotificationsProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No notifications yet.',
        child: Column(
          children: state.items
              .map(
                (item) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: DashboardSurfaceCard(
                    onTap: () => ref
                        .read(specialistNotificationsProvider.notifier)
                        .markAsRead(item.id),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          item.isRead
                              ? Icons.notifications_none_rounded
                              : Icons.notifications_active_rounded,
                          color: item.isRead
                              ? DashboardColors.textMuted
                              : DashboardColors.primary,
                        ),
                        SizedBox(width: context.dashSpacing * 0.65),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.title,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight:
                                      item.isRead ? FontWeight.w500 : FontWeight.w700,
                                ),
                              ),
                              if (item.body != null)
                                Text(
                                  item.body!,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: DashboardColors.textSecondary,
                                  ),
                                ),
                              Text(
                                '${item.type ?? 'Update'} • ${_formatDate(item.createdAt)}',
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: DashboardColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
              .toList(),
        ),
      ),
    );
  }
}

String _formatDate(DateTime? date) {
  if (date == null) {
    return 'Recently';
  }
  return '${date.day}/${date.month}/${date.year}';
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.labelSmall),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _MoreTile extends StatelessWidget {
  const _MoreTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
      child: DashboardSurfaceCard(
        onTap: onTap,
        child: Row(
          children: [
            Icon(icon, color: DashboardColors.primary),
            SizedBox(width: context.dashSpacing * 0.65),
            Expanded(child: Text(label)),
            Icon(Icons.chevron_right_rounded, color: DashboardColors.textMuted),
          ],
        ),
      ),
    );
  }
}
