import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../data/admin_users_repository.dart';
import '../../providers/admin_dashboard_provider.dart';
import '../../providers/admin_users_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../../presence/widgets/online_status_dot.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/admin_ui_components.dart';

class AdminUsersScreen extends ConsumerStatefulWidget {
  const AdminUsersScreen({super.key});

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
      final matchesRole = _roleFilter == null ||
          _roleFilter!.isEmpty ||
          user.role.toLowerCase() == _roleFilter!.toLowerCase();
      final query = _searchQuery.trim().toLowerCase();
      final matchesSearch = query.isEmpty ||
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
        _showSnack('User updated successfully.', messenger: messenger);
      } else {
        if (result.fullName.isEmpty ||
            result.email.isEmpty ||
            result.password.length < 8) {
          _showSnack(
            'Please provide name, email, and a password of at least 8 characters.',
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
        _showSnack('User created successfully.', messenger: messenger);
      }
      await _load();
    } on DioException catch (error) {
      if (!mounted) return;
      _showSnack(repo.readErrorMessage(error), isError: true, messenger: messenger);
    } catch (error) {
      if (!mounted) return;
      _showSnack('Failed to save user: $error', isError: true, messenger: messenger);
    }
  }

  Future<void> _toggleStatus(AdminUserRecord user) async {
    final messenger = ScaffoldMessenger.of(context);
    final repo = ref.read(adminUsersRepositoryProvider);
    final willDeactivate = user.isActive;

    final success = await showDialog<bool>(
      context: context,
      builder: (_) => _ToggleUserStatusDialog(
        willDeactivate: willDeactivate,
        onConfirm: () => repo.updateStatus(
          id: user.id,
          isActive: !user.isActive,
        ),
        readErrorMessage: repo.readErrorMessage,
        messenger: messenger,
      ),
    );

    if (!mounted || success != true) return;

    _showSnack(
      willDeactivate ? 'User deactivated.' : 'User activated.',
      messenger: messenger,
    );
    await _load();
  }

  Future<void> _confirmDelete(AdminUserRecord user) async {
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
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: DashboardColors.highPriority),
            child: const Text('Delete'),
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
      _showSnack('User deleted successfully.');
      await _load();
    } on DioException catch (error) {
      _showSnack(repo.readErrorMessage(error), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final filtered = _filteredUsers;

    return AdminPageScaffold(
      title: 'Users',
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
                      hintText: 'Search by name, email, or role',
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
                        label: 'All',
                        selected: _roleFilter == null,
                        onTap: () => setState(() => _roleFilter = null),
                      ),
                      _RoleChip(
                        label: 'Admin',
                        selected: _roleFilter == 'admin',
                        onTap: () => setState(() => _roleFilter = 'admin'),
                      ),
                      _RoleChip(
                        label: 'Specialist',
                        selected: _roleFilter == 'specialist',
                        onTap: () => setState(() => _roleFilter = 'specialist'),
                      ),
                      _RoleChip(
                        label: 'Parent',
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
                            child: AdminErrorCard(message: _error!, onRetry: _load),
                          ),
                        )
                      : filtered.isEmpty
                          ? Center(
                              child: Padding(
                                padding: context.dashPadding,
                                child: const AdminEmptyCard(message: 'No users found.'),
                              ),
                            )
                          : ListView.builder(
                              padding: context.dashPadding,
                              itemCount: filtered.length,
                              itemBuilder: (context, index) {
                                final user = filtered[index];
                                return Padding(
                                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                                  child: AdminSurfaceCard(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Stack(
                                              clipBehavior: Clip.none,
                                              children: [
                                                CircleAvatar(
                                                  backgroundColor: adminRoleColor(user.role)
                                                      .withValues(alpha: 0.15),
                                                  child: Text(
                                                    dashboardAvatarLetter(user.name),
                                                    style: TextStyle(
                                                      color: adminRoleColor(user.role),
                                                      fontWeight: FontWeight.w700,
                                                    ),
                                                  ),
                                                ),
                                                Positioned(
                                                  right: -2,
                                                  bottom: -2,
                                                  child: OnlineStatusDot(userId: user.id),
                                                ),
                                              ],
                                            ),
                                            SizedBox(width: context.dashSpacing * 0.65),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    user.name,
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                    style: theme.textTheme.bodyMedium?.copyWith(
                                                      fontWeight: FontWeight.w700,
                                                    ),
                                                  ),
                                                  Text(
                                                    user.email,
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                    style: theme.textTheme.bodySmall?.copyWith(
                                                      color: DashboardColors.textSecondary,
                                                    ),
                                                  ),
                                                  Text(
                                                    '${_formatRoleLabel(user.role)} • ${user.isActive ? 'Active' : 'Inactive'}',
                                                    style: theme.textTheme.labelSmall?.copyWith(
                                                      color: user.isActive
                                                          ? DashboardColors.primary
                                                          : DashboardColors.textMuted,
                                                    ),
                                                  ),
                                                  PresenceStatusLabel(userId: user.id),
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
                                              onPressed: () => _openUserForm(user: user),
                                              icon: const Icon(Icons.edit_outlined, size: 16),
                                              label: const Text('Edit'),
                                            ),
                                            OutlinedButton.icon(
                                              onPressed: () => _toggleStatus(user),
                                              icon: Icon(
                                                user.isActive
                                                    ? Icons.pause_circle_outline
                                                    : Icons.play_circle_outline,
                                                size: 16,
                                              ),
                                              label: Text(user.isActive ? 'Deactivate' : 'Activate'),
                                            ),
                                            OutlinedButton.icon(
                                              onPressed: () => _confirmDelete(user),
                                              icon: const Icon(Icons.delete_outline, size: 16),
                                              label: const Text('Delete'),
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

String _formatRoleLabel(String role) {
  if (role.isEmpty) {
    return 'User';
  }
  return '${role[0].toUpperCase()}${role.substring(1)}';
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
  State<_ToggleUserStatusDialog> createState() => _ToggleUserStatusDialogState();
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
      widget.messenger.showSnackBar(
        SnackBar(
          content: Text('Failed to update user status: $error'),
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
    final willDeactivate = widget.willDeactivate;

    return PopScope(
      canPop: !_submitting,
      child: AlertDialog(
        title: Text(willDeactivate ? 'Deactivate User' : 'Activate User'),
        content: Text(
          willDeactivate
              ? 'Are you sure you want to deactivate this user? They may lose access to the platform.'
              : 'Are you sure you want to activate this user?',
        ),
        actions: [
          TextButton(
            onPressed: _submitting ? null : _onCancelPressed,
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: _submitting ? null : _onConfirmPressed,
            style: willDeactivate
                ? FilledButton.styleFrom(backgroundColor: DashboardColors.highPriority)
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
                : Text(willDeactivate ? 'Deactivate' : 'Activate'),
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
    return AlertDialog(
      title: Text(_isEdit ? 'Edit User' : 'Add User'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Full Name'),
            ),
            TextField(
              controller: _emailController,
              enabled: !_isEdit,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            if (!_isEdit) ...[
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password'),
              ),
            ],
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(labelText: 'Phone (optional)'),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _selectedRole,
              decoration: const InputDecoration(labelText: 'Role'),
              items: const [
                DropdownMenuItem(value: 'admin', child: Text('Admin')),
                DropdownMenuItem(value: 'specialist', child: Text('Specialist')),
                DropdownMenuItem(value: 'parent', child: Text('Parent')),
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
        TextButton(
          onPressed: _cancel,
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _submit,
          child: Text(_isEdit ? 'Save' : 'Create'),
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
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        selectedColor: DashboardColors.blueSoft,
        checkmarkColor: DashboardColors.primary,
      ),
    );
  }
}