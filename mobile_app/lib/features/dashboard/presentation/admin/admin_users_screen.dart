import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../data/admin_users_repository.dart';
import '../../providers/admin_dashboard_provider.dart';
import '../../providers/admin_users_provider.dart';
import '../../widgets/admin_navigation.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../../presence/widgets/online_status_dot.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/admin_ui_components.dart';
import 'admin_scoped_localization_utils.dart';

class AdminUsersScreen extends ConsumerStatefulWidget {
  const AdminUsersScreen({super.key, this.initialRoleFilter});

  final String? initialRoleFilter;

  @override
  ConsumerState<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends ConsumerState<AdminUsersScreen> {
  bool _isLoading = true;
  String? _error;
  List<AdminUserRecord> _users = const [];
  String _searchQuery = '';
  String? _roleFilter;

  @override
  void initState() {
    super.initState();
    _roleFilter = widget.initialRoleFilter;
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final repo = ref.read(adminUsersRepositoryProvider);
      final rows = await repo.fetchUsers();
      if (mounted) {
        setState(() {
          _isLoading = false;
          _users = rows;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load users: $error';
        });
      }
    }
  }

  List<AdminUserRecord> get _filteredUsers {
    return _users.where((user) {
      final matchesRole =
          _roleFilter == null ||
          _roleFilter!.isEmpty ||
          user.role.toLowerCase() == _roleFilter!.toLowerCase();
      final query = _searchQuery.trim().toLowerCase();
      final matchesSearch =
          query.isEmpty ||
          user.name.toLowerCase().contains(query) ||
          user.email.toLowerCase().contains(query) ||
          user.role.toLowerCase().contains(query);
      return matchesRole && matchesSearch;
    }).toList();
  }

  void _showSnack(
    String message, {
    bool isError = false,
    ScaffoldMessengerState? messenger,
  }) {
    (messenger ?? ScaffoldMessenger.of(context)).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? DashboardColors.highPriority : null,
      ),
    );
  }

  Future<void> _openUserForm({AdminUserRecord? user}) async {
    final isEdit = user != null;
    final l10n = AppLocalizations.of(context)!;
    final messenger = ScaffoldMessenger.of(context);
    final result = await showDialog<_AdminUserFormResult>(
      context: context,
      builder: (dialogContext) => _AdminUserFormDialog(user: user),
    );

    if (!mounted) return;
    if (result == null) return;

    final repo = ref.read(adminUsersRepositoryProvider);

    try {
      if (isEdit) {
        await repo.updateUser(
          id: user.id,
          fullName: result.fullName,
          phone: result.phone,
          role: result.role,
        );
        if (!mounted) return;
        _showSnack(l10n.adminUsersUpdatedSuccess, messenger: messenger);
      } else {
        if (result.fullName.isEmpty ||
            result.email.isEmpty ||
            result.password.length < 8) {
          _showSnack(
            l10n.adminUsersValidationRequired,
            isError: true,
            messenger: messenger,
          );
          return;
        }

        await repo.createUser(
          fullName: result.fullName,
          email: result.email,
          password: result.password,
          phone: result.phone,
          role: result.role,
        );
        if (!mounted) return;
        _showSnack(l10n.adminUsersCreatedSuccess, messenger: messenger);
      }
      await _load();
    } on DioException catch (error) {
      if (!mounted) return;
      _showSnack(
        repo.readErrorMessage(error),
        isError: true,
        messenger: messenger,
      );
    } catch (error) {
      if (!mounted) return;
      _showSnack(
        l10n.adminUsersSaveFailed('$error'),
        isError: true,
        messenger: messenger,
      );
    }
  }

  Future<void> _toggleStatus(AdminUserRecord user) async {
    final l10n = AppLocalizations.of(context)!;
    final messenger = ScaffoldMessenger.of(context);
    final repo = ref.read(adminUsersRepositoryProvider);
    final willDeactivate = user.isActive;

    final success = await showDialog<bool>(
      context: context,
      builder: (_) => _ToggleUserStatusDialog(
        willDeactivate: willDeactivate,
        onConfirm: () =>
            repo.updateStatus(id: user.id, isActive: !user.isActive),
        readErrorMessage: repo.readErrorMessage,
        messenger: messenger,
      ),
    );

    if (!mounted || success != true) return;

    _showSnack(
      willDeactivate
          ? l10n.adminUsersUserDeactivated
          : l10n.adminUsersUserActivated,
      messenger: messenger,
    );
    await _load();
  }

  Future<void> _confirmDelete(AdminUserRecord user) async {
    final l10n = AppLocalizations.of(context)!;
    final currentUserId = ref.read(authProvider).user?.id;
    final isSelf = currentUserId != null && currentUserId == user.id;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(isSelf ? 'Delete your account?' : 'Delete user?'),
        content: Text(
          isSelf
              ? 'You are about to delete your own admin account. This action cannot be undone.'
              : 'Are you sure you want to delete ${user.name}? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(l10n.commonCancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: DashboardColors.highPriority,
            ),
            child: Text(l10n.commonDelete),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) {
      return;
    }

    final repo = ref.read(adminUsersRepositoryProvider);
    try {
      await repo.deleteUser(user.id);
      _showSnack(l10n.adminUsersDeletedSuccess);
      await _load();
    } on DioException catch (error) {
      _showSnack(repo.readErrorMessage(error), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final filtered = _filteredUsers;
    final errorMessage = _error == null
        ? null
        : mapAdminUsersError(l10n, _error!);

    return AdminPageScaffold(
      title: l10n.navUsers,
      showBackButton: true,
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openUserForm(),
        backgroundColor: DashboardColors.primary,
        child: const Icon(Icons.person_add_alt_1_rounded, color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: AdminLoadingCard())
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: context.dashPadding.copyWith(bottom: 0),
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: l10n.adminUsersSearchHint,
                      prefixIcon: const Icon(Icons.search_rounded),
                      filled: true,
                      fillColor: DashboardColors.surface,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(color: DashboardColors.border),
                      ),
                    ),
                    onChanged: (value) => setState(() => _searchQuery = value),
                  ),
                ),
                SizedBox(
                  height: 52,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: EdgeInsets.symmetric(
                      horizontal: context.dashPadding.left,
                      vertical: context.dashSpacing * 0.35,
                    ),
                    children: [
                      _RoleChip(
                        label: l10n.filterAll,
                        selected: _roleFilter == null,
                        onTap: () => setState(() => _roleFilter = null),
                      ),
                      _RoleChip(
                        label: l10n.roleAdmin,
                        selected: _roleFilter == 'admin',
                        onTap: () => setState(() => _roleFilter = 'admin'),
                      ),
                      _RoleChip(
                        label: l10n.roleSpecialist,
                        selected: _roleFilter == 'specialist',
                        onTap: () => setState(() => _roleFilter = 'specialist'),
                      ),
                      _RoleChip(
                        label: l10n.roleParent,
                        selected: _roleFilter == 'parent',
                        onTap: () => setState(() => _roleFilter = 'parent'),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: _error != null
                      ? Center(
                          child: Padding(
                            padding: context.dashPadding,
                            child: AdminErrorCard(
                              message: errorMessage!,
                              onRetry: _load,
                            ),
                          ),
                        )
                      : filtered.isEmpty
                      ? Center(
                          child: Padding(
                            padding: context.dashPadding,
                            child: AdminEmptyCard(
                              message: l10n.adminDashboardNoUsers,
                            ),
                          ),
                        )
                      : ListView.builder(
                          padding: context.dashPadding,
                          itemCount: filtered.length,
                          itemBuilder: (context, index) {
                            final user = filtered[index];
                            return Padding(
                              padding: EdgeInsets.only(
                                bottom: context.dashSpacing * 0.6,
                              ),
                              child: AdminSurfaceCard(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Stack(
                                          clipBehavior: Clip.none,
                                          children: [
                                            DashboardProfileAvatar(
                                              initials: dashboardAvatarLetter(
                                                user.name,
                                              ),
                                              imageUrl: user.profileImageUrl,
                                              backgroundColor: adminRoleColor(
                                                user.role,
                                              ).withValues(alpha: 0.15),
                                              foregroundColor: adminRoleColor(
                                                user.role,
                                              ),
                                            ),
                                            PositionedDirectional(
                                              end: -2,
                                              bottom: -2,
                                              child: OnlineStatusDot(
                                                userId: user.id,
                                              ),
                                            ),
                                          ],
                                        ),
                                        SizedBox(
                                          width: context.dashSpacing * 0.65,
                                        ),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                user.name,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: theme
                                                    .textTheme
                                                    .bodyMedium
                                                    ?.copyWith(
                                                      fontWeight:
                                                          FontWeight.w700,
                                                    ),
                                              ),
                                              Text(
                                                user.email,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: theme.textTheme.bodySmall
                                                    ?.copyWith(
                                                      color: DashboardColors
                                                          .textSecondary,
                                                    ),
                                              ),
                                              Text(
                                                '${localizedAdminRole(l10n, user.role)} • ${user.isActive ? l10n.statusActive : l10n.statusInactive}',
                                                style: theme
                                                    .textTheme
                                                    .labelSmall
                                                    ?.copyWith(
                                                      color: user.isActive
                                                          ? DashboardColors
                                                                .primary
                                                          : DashboardColors
                                                                .textMuted,
                                                    ),
                                              ),
                                              PresenceStatusLabel(
                                                userId: user.id,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: context.dashSpacing * 0.5),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 8,
                                      children: [
                                        OutlinedButton.icon(
                                          onPressed: () =>
                                              _openUserForm(user: user),
                                          icon: const Icon(
                                            Icons.edit_outlined,
                                            size: 16,
                                          ),
                                          label: Text(l10n.commonEdit),
                                        ),
                                        OutlinedButton.icon(
                                          onPressed: () => _toggleStatus(user),
                                          icon: Icon(
                                            user.isActive
                                                ? Icons.pause_circle_outline
                                                : Icons.play_circle_outline,
                                            size: 16,
                                          ),
                                          label: Text(
                                            user.isActive
                                                ? l10n.adminDeactivate
                                                : l10n.adminActivate,
                                          ),
                                        ),
                                        OutlinedButton.icon(
                                          onPressed: () => _confirmDelete(user),
                                          icon: const Icon(
                                            Icons.delete_outline,
                                            size: 16,
                                          ),
                                          label: Text(l10n.commonDelete),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}

class _ToggleUserStatusDialog extends StatefulWidget {
  const _ToggleUserStatusDialog({
    required this.willDeactivate,
    required this.onConfirm,
    required this.readErrorMessage,
    required this.messenger,
  });

  final bool willDeactivate;
  final Future<void> Function() onConfirm;
  final String Function(DioException error) readErrorMessage;
  final ScaffoldMessengerState messenger;

  @override
  State<_ToggleUserStatusDialog> createState() =>
      _ToggleUserStatusDialogState();
}

class _ToggleUserStatusDialogState extends State<_ToggleUserStatusDialog> {
  bool _submitting = false;

  Future<void> _onConfirmPressed() async {
    if (_submitting) return;

    setState(() => _submitting = true);

    try {
      await widget.onConfirm();
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } on DioException catch (error) {
      if (!mounted) return;
      setState(() => _submitting = false);
      widget.messenger.showSnackBar(
        SnackBar(
          content: Text(widget.readErrorMessage(error)),
          backgroundColor: DashboardColors.highPriority,
        ),
      );
    } catch (error) {
      if (!mounted) return;
      setState(() => _submitting = false);
      final l10n = AppLocalizations.of(context)!;
      widget.messenger.showSnackBar(
        SnackBar(
          content: Text(l10n.adminUsersUpdateStatusFailed('$error')),
          backgroundColor: DashboardColors.highPriority,
        ),
      );
    }
  }

  void _onCancelPressed() {
    if (_submitting) return;
    Navigator.of(context).pop(false);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final willDeactivate = widget.willDeactivate;

    return PopScope(
      canPop: !_submitting,
      child: AlertDialog(
        title: Text(
          willDeactivate
              ? l10n.adminUsersDeactivateTitle
              : l10n.adminUsersActivateTitle,
        ),
        content: Text(
          willDeactivate
              ? l10n.adminUsersDeactivateConfirm
              : l10n.adminUsersActivateConfirm,
        ),
        actions: [
          TextButton(
            onPressed: _submitting ? null : _onCancelPressed,
            child: Text(l10n.commonCancel),
          ),
          FilledButton(
            onPressed: _submitting ? null : _onConfirmPressed,
            style: willDeactivate
                ? FilledButton.styleFrom(
                    backgroundColor: DashboardColors.highPriority,
                  )
                : null,
            child: _submitting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(
                    willDeactivate ? l10n.adminDeactivate : l10n.adminActivate,
                  ),
          ),
        ],
      ),
    );
  }
}

class _AdminUserFormResult {
  const _AdminUserFormResult({
    required this.fullName,
    required this.email,
    required this.password,
    required this.phone,
    required this.role,
  });

  final String fullName;
  final String email;
  final String password;
  final String phone;
  final String role;
}

class _AdminUserFormDialog extends StatefulWidget {
  const _AdminUserFormDialog({this.user});

  final AdminUserRecord? user;

  @override
  State<_AdminUserFormDialog> createState() => _AdminUserFormDialogState();
}

class _AdminUserFormDialogState extends State<_AdminUserFormDialog> {
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  late final TextEditingController _passwordController;
  late String _selectedRole;

  bool get _isEdit => widget.user != null;

  @override
  void initState() {
    super.initState();
    final user = widget.user;
    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
    _passwordController = TextEditingController();
    _selectedRole = user?.role ?? 'parent';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _cancel() {
    _dismiss();
  }

  void _submit() {
    final result = _AdminUserFormResult(
      fullName: _nameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text.trim(),
      phone: _phoneController.text.trim(),
      role: _selectedRole,
    );
    _dismiss(result);
  }

  /// Clears focus while still mounted, then pops. Avoids deferred focus
  /// cleanup looking up ancestors on the deactivating dialog route.
  void _dismiss([_AdminUserFormResult? result]) {
    final navigator = Navigator.of(context);
    FocusManager.instance.primaryFocus?.unfocus();
    FocusManager.instance.applyFocusChangesIfNeeded();
    navigator.pop(result);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return AlertDialog(
      title: Text(_isEdit ? l10n.adminUsersEditUserTitle : l10n.adminUsersAddUserTitle),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _nameController,
              decoration: InputDecoration(labelText: l10n.fieldFullName),
            ),
            TextField(
              controller: _emailController,
              enabled: !_isEdit,
              decoration: InputDecoration(labelText: l10n.fieldEmail),
            ),
            if (!_isEdit) ...[
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: l10n.adminUsersPasswordField,
                ),
              ),
            ],
            TextField(
              controller: _phoneController,
              decoration: InputDecoration(labelText: l10n.adminUsersPhoneOptional),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _selectedRole,
              decoration: InputDecoration(labelText: l10n.adminUsersRoleField),
              items: [
                DropdownMenuItem(value: 'admin', child: Text(l10n.roleAdmin)),
                DropdownMenuItem(
                  value: 'specialist',
                  child: Text(l10n.roleSpecialist),
                ),
                DropdownMenuItem(value: 'parent', child: Text(l10n.roleParent)),
              ],
              onChanged: (value) {
                if (value != null) {
                  _selectedRole = value;
                }
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: _cancel, child: Text(l10n.commonCancel)),
        FilledButton(
          onPressed: _submit,
          child: Text(_isEdit ? l10n.commonSave : l10n.commonCreate),
        ),
      ],
    );
  }
}

class _RoleChip extends StatelessWidget {
  const _RoleChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsetsDirectional.only(end: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: selected
                  ? DashboardColors.primary
                  : DashboardColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: selected
                  ? null
                  : Border.all(color: DashboardColors.border),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (selected) ...[
                  const Icon(Icons.check, size: 16, color: Colors.white),
                  const SizedBox(width: 6),
                ],
                Text(
                  label,
                  maxLines: 1,
                  softWrap: false,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: selected
                        ? Colors.white
                        : DashboardColors.textPrimary,
                    fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
