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
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';

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

  void _showSnack(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? DashboardColors.highPriority : null,
      ),
    );
  }

  Future<void> _openUserForm({AdminUserRecord? user}) async {
    final isEdit = user != null;
    final nameController = TextEditingController(text: user?.name ?? '');
    final emailController = TextEditingController(text: user?.email ?? '');
    final phoneController = TextEditingController(text: user?.phone ?? '');
    final passwordController = TextEditingController();
    var selectedRole = user?.role ?? 'parent';

    final saved = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text(isEdit ? 'Edit User' : 'Add User'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: nameController,
                      decoration: const InputDecoration(labelText: 'Full Name'),
                    ),
                    TextField(
                      controller: emailController,
                      enabled: !isEdit,
                      decoration: const InputDecoration(labelText: 'Email'),
                    ),
                    if (!isEdit) ...[
                      TextField(
                        controller: passwordController,
                        obscureText: true,
                        decoration: const InputDecoration(labelText: 'Password'),
                      ),
                    ],
                    TextField(
                      controller: phoneController,
                      decoration: const InputDecoration(labelText: 'Phone (optional)'),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: selectedRole,
                      decoration: const InputDecoration(labelText: 'Role'),
                      items: const [
                        DropdownMenuItem(value: 'admin', child: Text('Admin')),
                        DropdownMenuItem(value: 'specialist', child: Text('Specialist')),
                        DropdownMenuItem(value: 'parent', child: Text('Parent')),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setDialogState(() => selectedRole = value);
                        }
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(dialogContext).pop(false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(dialogContext).pop(true),
                  child: Text(isEdit ? 'Save' : 'Create'),
                ),
              ],
            );
          },
        );
      },
    );

    if (saved != true || !mounted) {
      nameController.dispose();
      emailController.dispose();
      phoneController.dispose();
      passwordController.dispose();
      return;
    }

    final repo = ref.read(adminUsersRepositoryProvider);

    try {
      if (isEdit) {
        await repo.updateUser(
          id: user.id,
          fullName: nameController.text.trim(),
          phone: phoneController.text.trim(),
          role: selectedRole,
        );
        _showSnack('User updated successfully.');
      } else {
        if (nameController.text.trim().isEmpty ||
            emailController.text.trim().isEmpty ||
            passwordController.text.trim().length < 8) {
          _showSnack('Please provide name, email, and a password of at least 8 characters.', isError: true);
          return;
        }

        await repo.createUser(
          fullName: nameController.text.trim(),
          email: emailController.text.trim(),
          password: passwordController.text.trim(),
          phone: phoneController.text.trim(),
          role: selectedRole,
        );
        _showSnack('User created successfully.');
      }
      await _load();
    } on DioException catch (error) {
      _showSnack(repo.readErrorMessage(error), isError: true);
    } catch (error) {
      _showSnack('Failed to save user: $error', isError: true);
    } finally {
      nameController.dispose();
      emailController.dispose();
      phoneController.dispose();
      passwordController.dispose();
    }
  }

  Future<void> _toggleStatus(AdminUserRecord user) async {
    final repo = ref.read(adminUsersRepositoryProvider);
    try {
      await repo.updateStatus(id: user.id, isActive: !user.isActive);
      _showSnack(user.isActive ? 'User deactivated.' : 'User activated.');
      await _load();
    } on DioException catch (error) {
      _showSnack(repo.readErrorMessage(error), isError: true);
    }
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
          ? const Center(child: DashboardLoadingCard())
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
                            child: DashboardErrorCard(message: _error!, onRetry: _load),
                          ),
                        )
                      : filtered.isEmpty
                          ? Center(
                              child: Padding(
                                padding: context.dashPadding,
                                child: const DashboardEmptyCard(message: 'No users found.'),
                              ),
                            )
                          : ListView.builder(
                              padding: context.dashPadding,
                              itemCount: filtered.length,
                              itemBuilder: (context, index) {
                                final user = filtered[index];
                                return Padding(
                                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                                  child: DashboardSurfaceCard(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
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
                                                    style: theme.textTheme.bodyMedium?.copyWith(
                                                      fontWeight: FontWeight.w700,
                                                    ),
                                                  ),
                                                  Text(
                                                    user.email,
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
        selectedColor: DashboardColors.purpleSoft,
        checkmarkColor: DashboardColors.primary,
      ),
    );
  }
}