import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/locale/language_selector.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../providers/specialist_features_provider.dart';
import '../../providers/admin_reports_provider.dart';
import '../../widgets/admin_navigation.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/specialist_page_scaffold.dart';
import '../specialist/specialist_scoped_localization_utils.dart';
import '../specialist/specialist_exercises_widgets.dart';
import 'admin_scoped_localization_utils.dart';
import '../../../presence/widgets/online_status_dot.dart';
import '../../utils/support_request_notification_navigation.dart';
import '../../models/specialist_feature_models.dart';
import '../shared/reports_list_widgets.dart';

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
      builder: (context) {
        final l10n = AppLocalizations.of(context)!;
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.photo_library_outlined),
                title: Text(l10n.parentProfilePhotoChooseGallery),
                onTap: () => Navigator.pop(context, _PhotoAction.gallery),
              ),
              ListTile(
                leading: const Icon(Icons.photo_camera_outlined),
                title: Text(l10n.parentProfilePhotoTake),
                onTap: () => Navigator.pop(context, _PhotoAction.camera),
              ),
            ],
          ),
        );
      },
    );

    if (action == null || !mounted) {
      return;
    }

    final picked = await _imagePicker.pickImage(
      source: action == _PhotoAction.camera
          ? ImageSource.camera
          : ImageSource.gallery,
      maxWidth: 1200,
      imageQuality: 85,
    );

    if (picked == null || !mounted) {
      return;
    }

    setState(() => _isUploadingPhoto = true);

    final bytes = await picked.readAsBytes();
    final filename = picked.name.isNotEmpty ? picked.name : 'profile.jpg';
    final success = await ref
        .read(authProvider.notifier)
        .uploadProfileImage(bytes, filename);

    if (!mounted) {
      return;
    }

    setState(() => _isUploadingPhoto = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          success
              ? AppLocalizations.of(context)!.adminProfilePhotoUpdated
              : ref.read(authProvider).errorMessage ??
                    AppLocalizations.of(context)!.parentProfileImageUploadError,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final l10n = AppLocalizations.of(context)!;

    return AdminPageScaffold(
      title: l10n.navProfile,
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
              _ProfileRow(
                label: l10n.fieldFullName,
                value: user?.fullName ?? '—',
              ),
              _ProfileRow(label: l10n.fieldEmail, value: user?.email ?? '—'),
              _ProfileRow(
                label: l10n.fieldRole,
                value: localizedAdminRole(l10n, user?.role ?? 'admin'),
              ),
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
              OutlinedButton.icon(
                onPressed: () => context.push(AppRoutes.adminEditProfile),
                icon: const Icon(Icons.edit_outlined),
                label: Text(l10n.parentProfileEditProfile),
                style: OutlinedButton.styleFrom(
                  foregroundColor: DashboardColors.brandCyan,
                  side: const BorderSide(color: DashboardColors.brandCyan),
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.75,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              FilledButton(
                onPressed: () => AdminNavigation.logout(context, ref),
                child: Text(l10n.commonLogout),
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
    final l10n = AppLocalizations.of(context)!;

    return AdminPageScaffold(
      title: l10n.commonMore,
      currentNav: DashboardNavItem.more,
      body: ListView(
        padding: context.dashPadding,
        children: [
          const LanguageSelector(
            presentation: LanguageSelectorPresentation.settingsTile,
          ),
          _MoreTile(
            icon: Icons.groups_outlined,
            label: l10n.navUsers,
            onTap: () => context.go(AppRoutes.adminUsers),
          ),
          _MoreTile(
            icon: Icons.people_outline_rounded,
            label: l10n.navPatients,
            onTap: () => context.go(AppRoutes.adminPatients),
          ),
          _MoreTile(
            icon: Icons.assignment_ind_outlined,
            label: l10n.navPatientAssignments,
            onTap: () => context.go(AppRoutes.adminPatientAssignments),
          ),
          _MoreTile(
            icon: Icons.inbox_outlined,
            label: l10n.navCaseRequests,
            onTap: () => context.go(AppRoutes.adminCaseRequests),
          ),
          _MoreTile(
            icon: Icons.report_outlined,
            label: l10n.navComplaints,
            onTap: () => context.go(AppRoutes.adminComplaints),
          ),
          _MoreTile(
            icon: Icons.support_agent_outlined,
            label: l10n.supportRequestAdminTitle,
            onTap: () => context.push(AppRoutes.adminSupportRequests),
          ),
          _MoreTile(
            icon: Icons.event_note_outlined,
            label: l10n.navSessions,
            onTap: () => context.go(AppRoutes.adminSessions),
          ),
          _MoreTile(
            icon: Icons.psychology_outlined,
            label: l10n.navAiCenter,
            onTap: () => context.go(AppRoutes.adminAiCenter),
          ),
          _MoreTile(
            icon: Icons.history_rounded,
            label: l10n.navAuditLogs,
            onTap: () => context.go(AppRoutes.adminAuditLogs),
          ),
          _MoreTile(
            icon: Icons.notifications_none_rounded,
            label: l10n.navNotifications,
            onTap: () => context.go(AppRoutes.adminNotifications),
          ),
          _MoreTile(
            icon: Icons.person_outline_rounded,
            label: l10n.navProfile,
            onTap: () => context.push(AppRoutes.adminProfile),
          ),
          _MoreTile(
            icon: Icons.logout_rounded,
            label: l10n.commonLogout,
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
  ConsumerState<AdminExercisesScreen> createState() =>
      _AdminExercisesScreenState();
}

class _AdminExercisesScreenState extends ConsumerState<AdminExercisesScreen> {
  late final TextEditingController _searchController;
  String _selectedCategory = specialistExerciseAllCategoryLabel;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistExercisesProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _openAddExercise() async {
    final created = await context.push<bool>(AppRoutes.adminAddExercise);
    if (!mounted) return;
    if (created == true) {
      await ref.read(specialistExercisesProvider.notifier).refresh();
    }
  }

  Future<void> _openEditExercise(String exerciseId) async {
    final updated = await context.push<bool>(
      AppRoutes.adminEditExercise(exerciseId),
    );
    if (!mounted) return;
    if (updated == true) {
      await ref.read(specialistExercisesProvider.notifier).refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistExercisesProvider);
    final notifier = ref.read(specialistExercisesProvider.notifier);
    final auth = ref.watch(authProvider);
    final l10n = AppLocalizations.of(context)!;

    return AdminPageScaffold(
      title: l10n.navExercises,
      currentNav: DashboardNavItem.exercises,
      wrapBodyInScrollView: false,
      actions: [
        IconButton(
          tooltip: l10n.specialistAddExercise,
          onPressed: _openAddExercise,
          icon: const Icon(Icons.add_rounded),
        ),
      ],
      body: ExerciseLibraryBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage == null
            ? null
            : mapSpecialistExercisesError(l10n, state.errorMessage!),
        onRetry: notifier.refresh,
        items: state.items,
        searchController: _searchController,
        selectedCategory: _selectedCategory,
        onCategoryChanged: (value) => setState(() => _selectedCategory = value),
        onSearchChanged: (_) => setState(() {}),
        itemBuilder: (context, exercise) {
          final canEdit = exercise.canEditBy(
            userId: auth.user?.id,
            role: auth.user?.role,
          );

          return SpecialistExerciseCard(
            exercise: exercise,
            showChevron: true,
            onTap: () =>
                context.push(AppRoutes.adminExerciseDetails(exercise.id)),
            trailing: canEdit
                ? IconButton(
                    tooltip: l10n.commonEdit,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(
                      minWidth: 36,
                      minHeight: 36,
                    ),
                    onPressed: () => _openEditExercise(exercise.id),
                    icon: const Icon(
                      Icons.edit_outlined,
                      color: DashboardColors.brandCyan,
                      size: 20,
                    ),
                  )
                : null,
          );
        },
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
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(adminReportsProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return AdminPageScaffold(
      title: l10n.navReports,
      currentNav: DashboardNavItem.reports,
      body: ReportsListBody(
        searchController: _searchController,
        refreshIndicatorColor: DashboardColors.brandCyan,
        useAdminScope: true,
        onReportTap: (context, report) {
          context.push(
            AppRoutes.adminReportDetails(report.id, isAi: report.isAiReport),
          );
        },
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

class _AdminNotificationsScreenState
    extends ConsumerState<AdminNotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistNotificationsProvider.notifier).initialize();
    });
  }

  Future<void> _onNotificationTap(SpecialistNotificationItem item) async {
    if (!item.isRead) {
      await ref.read(specialistNotificationsProvider.notifier).markAsRead(item.id);
    }
    if (!mounted) return;

    final destination = resolveSupportRequestNotificationDestination(
      item,
      isAdmin: true,
    );
    if (destination != null) {
      await context.push(destination);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistNotificationsProvider);
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return AdminPageScaffold(
      title: l10n.navNotifications,
      showBackButton: true,
      showBottomNav: false,
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage == null
            ? null
            : mapSpecialistNotificationsError(l10n, state.errorMessage!),
        onRetry: () =>
            ref.read(specialistNotificationsProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: l10n.parentNotificationsEmpty,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Text(
                    l10n.navNotifications,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                ),
                if (state.unreadCount > 0)
                  TextButton(
                    onPressed: state.isUpdating
                        ? null
                        : () => ref
                              .read(specialistNotificationsProvider.notifier)
                              .markAllAsRead(),
                    child: Text(l10n.parentNotificationsMarkAllRead),
                  ),
              ],
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            ...state.items.map(
              (item) => Padding(
                padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                child: DashboardSurfaceCard(
                  onTap: () => _onNotificationTap(item),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        item.isRead
                            ? Icons.notifications_none_rounded
                            : Icons.notifications_active_rounded,
                        color: item.isRead
                            ? DashboardColors.textMuted
                            : DashboardColors.brandCyan,
                      ),
                      SizedBox(width: context.dashSpacing * 0.65),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.title,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                fontWeight: item.isRead
                                    ? FontWeight.w500
                                    : FontWeight.w700,
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
                              '${item.type ?? l10n.notificationTypeUpdate} • ${_formatDate(l10n, item.createdAt)}',
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
            ),
          ],
        ),
      ),
    );
  }
}

String _formatDate(AppLocalizations l10n, DateTime? date) {
  if (date == null) {
    return l10n.parentDashboardRecently;
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
            style: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
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
            Icon(icon, color: DashboardColors.brandCyan),
            SizedBox(width: context.dashSpacing * 0.65),
            Expanded(
              child: Text(
                label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: DashboardColors.textPrimary,
                ),
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: DashboardColors.textMuted,
            ),
          ],
        ),
      ),
    );
  }
}
