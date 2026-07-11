import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/theme/dashboard_theme.dart';
import '../models/parent_links_models.dart';
import '../providers/parent_links_provider.dart';
import '../widgets/dashboard_layout.dart';
import '../widgets/dashboard_surface_card.dart';
import '../widgets/parent_dashboard_cards.dart';
import 'specialist/manage_goals_widgets.dart';

class ManageParentLinksScreen extends ConsumerStatefulWidget {
  const ManageParentLinksScreen({super.key});

  @override
  ConsumerState<ManageParentLinksScreen> createState() =>
      _ManageParentLinksScreenState();
}

class _ManageParentLinksScreenState
    extends ConsumerState<ManageParentLinksScreen> {
  final _patientSearchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentLinksProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _patientSearchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<ParentLinksState>(parentLinksProvider, (previous, next) {
      if (next.errorMessage != null &&
          next.errorMessage != previous?.errorMessage) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(next.errorMessage!)));
        ref.read(parentLinksProvider.notifier).clearMessages();
      }
      if (next.successMessage != null &&
          next.successMessage != previous?.successMessage) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.successMessage!),
            backgroundColor: DashboardColors.success,
          ),
        );
        ref.read(parentLinksProvider.notifier).clearMessages();
      }
    });

    final state = ref.watch(parentLinksProvider);
    final theme = Theme.of(context);
    final filteredPatients = state.filteredPatients;

    return Theme(
      data: DashboardTheme.light,
      child: Scaffold(
        backgroundColor: DashboardColors.background,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => context.pop(),
          ),
          title: const Text('Manage Parent Links'),
        ),
        body: SafeArea(
          child: state.isLoading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: () =>
                      ref.read(parentLinksProvider.notifier).refresh(),
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: context.dashPadding,
                    children: [
                      Text(
                        'Link an existing parent account to one of your assigned patients.',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: DashboardColors.textSecondary,
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.75),
                      TextField(
                        controller: _patientSearchController,
                        onChanged: ref
                            .read(parentLinksProvider.notifier)
                            .setPatientSearchQuery,
                        decoration:
                            goalFieldDecoration(
                              'Search patients by name',
                            ).copyWith(
                              prefixIcon: const Icon(
                                Icons.search_rounded,
                                color: DashboardColors.textMuted,
                              ),
                            ),
                      ),
                      SizedBox(height: context.dashSpacing),
                      if (state.errorMessage != null && state.patients.isEmpty)
                        DashboardErrorCard(
                          message: state.errorMessage!,
                          onRetry: () =>
                              ref.read(parentLinksProvider.notifier).refresh(),
                        )
                      else if (state.patients.isEmpty)
                        const DashboardEmptyCard(
                          message: 'No assigned patients found.',
                        )
                      else if (filteredPatients.isEmpty)
                        const DashboardEmptyCard(
                          message: 'No matching patients found.',
                        )
                      else
                        ...filteredPatients.map(
                          (patient) => Padding(
                            padding: EdgeInsets.only(
                              bottom: context.dashSpacing * 0.75,
                            ),
                            child: _PatientLinkCard(
                              patient: patient,
                              state: state,
                              onLink: () =>
                                  _openParentPicker(context, patient: patient),
                              onUnlink: (guardian) => _confirmUnlink(
                                context,
                                patient: patient,
                                guardian: guardian,
                              ),
                            ),
                          ),
                        ),
                      if (state.isRefreshing)
                        Padding(
                          padding: EdgeInsets.only(top: context.dashSpacing),
                          child: const Center(
                            child: SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  Future<void> _openParentPicker(
    BuildContext context, {
    required PatientOption patient,
  }) async {
    final state = ref.read(parentLinksProvider);
    if (state.parents.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No parent accounts are available.')),
      );
      return;
    }

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return _ParentPickerSheet(
          patient: patient,
          parents: state.parents,
          isSubmitting: state.linkingPatientId == patient.id,
          onConfirm:
              ({
                required String parentUserId,
                required String relationship,
                required bool isPrimaryContact,
              }) async {
                final error = await ref
                    .read(parentLinksProvider.notifier)
                    .linkParent(
                      patientId: patient.id,
                      parentUserId: parentUserId,
                      relationship: relationship,
                      isPrimaryContact: isPrimaryContact,
                    );
                if (error == null && sheetContext.mounted) {
                  Navigator.of(sheetContext).pop();
                }
              },
        );
      },
    );
  }

  Future<void> _confirmUnlink(
    BuildContext context, {
    required PatientOption patient,
    required PatientGuardianLink guardian,
  }) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Unlink parent?'),
          content: Text(
            'Remove ${guardian.parentName} as a linked parent for ${patient.name}?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: Text(
                'Unlink',
                style: TextStyle(color: DashboardColors.highPriority),
              ),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) {
      return;
    }

    await ref
        .read(parentLinksProvider.notifier)
        .unlinkParent(patientId: patient.id, parentUserId: guardian.parentId);
  }
}

class _PatientLinkCard extends StatelessWidget {
  const _PatientLinkCard({
    required this.patient,
    required this.state,
    required this.onLink,
    required this.onUnlink,
  });

  final PatientOption patient;
  final ParentLinksState state;
  final VoidCallback onLink;
  final ValueChanged<PatientGuardianLink> onUnlink;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final guardians = state.guardiansFor(patient.id);
    final primaryGuardian = state.primaryGuardianFor(patient.id);
    final isLoadingGuardians = state.isLoadingGuardiansFor(patient.id);
    final isLinking = state.linkingPatientId == patient.id;
    final isUnlinking = state.unlinkingPatientId == patient.id;
    final isBusy = isLinking || isUnlinking;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                backgroundColor: DashboardColors.purpleSoft,
                child: Text(
                  dashboardAvatarLetter(patient.name, fallback: 'P'),
                  style: const TextStyle(
                    color: DashboardColors.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              SizedBox(width: context.dashSpacing * 0.65),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      patient.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: DashboardColors.textPrimary,
                      ),
                    ),
                    if (patient.subtitle != null)
                      Text(
                        patient.subtitle!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: DashboardColors.textSecondary,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          if (isLoadingGuardians)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            )
          else if (guardians.isEmpty)
            Text(
              'No parent linked',
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            )
          else
            ...guardians.map(
              (guardian) => Padding(
                padding: EdgeInsets.only(bottom: context.dashSpacing * 0.35),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.person_outline_rounded,
                      size: 18,
                      color: DashboardColors.primary,
                    ),
                    SizedBox(width: context.dashSpacing * 0.35),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            guardian.parentName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          if (guardian.email != null &&
                              guardian.email!.isNotEmpty)
                            Text(
                              guardian.email!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textMuted,
                              ),
                            ),
                          Text(
                            _formatRelationship(guardian.relationship) +
                                (guardian.isPrimaryContact
                                    ? ' • Primary contact'
                                    : ''),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: DashboardColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          SizedBox(height: context.dashSpacing * 0.5),
          Wrap(
            spacing: context.dashSpacing * 0.35,
            runSpacing: context.dashSpacing * 0.35,
            children: [
              if (guardians.isEmpty)
                _ActionButton(
                  label: 'Link Parent',
                  icon: Icons.link_rounded,
                  onPressed: isBusy ? null : onLink,
                  isLoading: isLinking,
                )
              else if (primaryGuardian != null)
                _ActionButton(
                  label: 'Unlink Parent',
                  icon: Icons.link_off_rounded,
                  onPressed: isBusy ? null : () => onUnlink(primaryGuardian),
                  isLoading: isUnlinking,
                  isDestructive: true,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.label,
    required this.icon,
    required this.onPressed,
    this.isLoading = false,
    this.isDestructive = false,
  });

  final String label;
  final IconData icon;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isDestructive;

  @override
  Widget build(BuildContext context) {
    final color = isDestructive
        ? DashboardColors.highPriority
        : DashboardColors.primary;

    return OutlinedButton.icon(
      onPressed: isLoading ? null : onPressed,
      icon: isLoading
          ? SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: color),
            )
          : Icon(icon, size: 18, color: color),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        side: BorderSide(color: color.withValues(alpha: 0.4)),
        padding: EdgeInsets.symmetric(
          horizontal: context.dashSpacing * 0.5,
          vertical: context.dashSpacing * 0.35,
        ),
      ),
    );
  }
}

class _ParentPickerSheet extends StatefulWidget {
  const _ParentPickerSheet({
    required this.patient,
    required this.parents,
    required this.isSubmitting,
    required this.onConfirm,
  });

  final PatientOption patient;
  final List<ParentUserOption> parents;
  final bool isSubmitting;
  final Future<void> Function({
    required String parentUserId,
    required String relationship,
    required bool isPrimaryContact,
  })
  onConfirm;

  @override
  State<_ParentPickerSheet> createState() => _ParentPickerSheetState();
}

class _ParentPickerSheetState extends State<_ParentPickerSheet> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  String? _selectedParentUserId;
  String _relationship = 'mother';
  bool _isPrimaryContact = true;

  @override
  void initState() {
    super.initState();
    if (widget.parents.isNotEmpty) {
      _selectedParentUserId = widget.parents.first.userId;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<ParentUserOption> get _filteredParents {
    final query = _searchQuery.trim().toLowerCase();
    if (query.isEmpty) {
      return widget.parents;
    }
    return widget.parents
        .where(
          (parent) =>
              parent.name.toLowerCase().contains(query) ||
              (parent.email?.toLowerCase().contains(query) ?? false),
        )
        .toList();
  }

  Future<void> _submit() async {
    final parentUserId = _selectedParentUserId;
    if (parentUserId == null || parentUserId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a parent account.')),
      );
      return;
    }

    final selectedParent = widget.parents.firstWhere(
      (parent) => parent.userId == parentUserId,
    );

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Link parent?'),
          content: Text(
            'Link ${selectedParent.name} as a parent for ${widget.patient.name}?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: const Text('Confirm'),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) {
      return;
    }

    await widget.onConfirm(
      parentUserId: parentUserId,
      relationship: _relationship,
      isPrimaryContact: _isPrimaryContact,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final filteredParents = _filteredParents;
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.85,
        ),
        decoration: const BoxDecoration(
          color: DashboardColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: EdgeInsets.fromLTRB(
                  context.dashSpacing,
                  context.dashSpacing * 0.75,
                  context.dashSpacing,
                  context.dashSpacing * 0.5,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Link Parent',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.25),
                    Text(
                      widget.patient.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.75),
                    TextField(
                      controller: _searchController,
                      onChanged: (value) =>
                          setState(() => _searchQuery = value),
                      decoration: goalFieldDecoration('Search by name or email')
                          .copyWith(
                            prefixIcon: const Icon(
                              Icons.search_rounded,
                              color: DashboardColors.textMuted,
                            ),
                          ),
                    ),
                  ],
                ),
              ),
              Flexible(
                child: filteredParents.isEmpty
                    ? const Padding(
                        padding: EdgeInsets.all(24),
                        child: DashboardEmptyCard(
                          message: 'No matching parents found.',
                        ),
                      )
                    : ListView.builder(
                        shrinkWrap: true,
                        itemCount: filteredParents.length,
                        itemBuilder: (context, index) {
                          final parent = filteredParents[index];
                          final isSelected =
                              _selectedParentUserId == parent.userId;

                          return ListTile(
                            selected: isSelected,
                            selectedTileColor: DashboardColors.purpleSoft
                                .withValues(alpha: 0.5),
                            onTap: () {
                              setState(
                                () => _selectedParentUserId = parent.userId,
                              );
                            },
                            leading: Icon(
                              isSelected
                                  ? Icons.radio_button_checked_rounded
                                  : Icons.radio_button_off_rounded,
                              color: isSelected
                                  ? DashboardColors.primary
                                  : DashboardColors.textMuted,
                            ),
                            title: Text(
                              parent.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            subtitle: parent.email != null
                                ? Text(
                                    parent.email!,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  )
                                : null,
                          );
                        },
                      ),
              ),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: context.dashSpacing),
                child: DropdownButtonFormField<String>(
                  initialValue: _relationship,
                  isExpanded: true,
                  decoration: goalFieldDecoration('Relationship'),
                  items: parentRelationshipOptions
                      .map(
                        (option) => DropdownMenuItem(
                          value: option,
                          child: Text(
                            option[0].toUpperCase() + option.substring(1),
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() => _relationship = value);
                    }
                  },
                ),
              ),
              CheckboxListTile(
                contentPadding: EdgeInsets.symmetric(
                  horizontal: context.dashSpacing,
                ),
                value: _isPrimaryContact,
                onChanged: (value) {
                  setState(() => _isPrimaryContact = value ?? true);
                },
                title: const Text('Primary contact'),
                activeColor: DashboardColors.primary,
                controlAffinity: ListTileControlAffinity.leading,
              ),
              Padding(
                padding: EdgeInsets.fromLTRB(
                  context.dashSpacing,
                  0,
                  context.dashSpacing,
                  context.dashSpacing,
                ),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: widget.isSubmitting ? null : _submit,
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
                    child: widget.isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Link Parent'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

String _formatRelationship(String relationship) {
  if (relationship.isEmpty) {
    return 'Guardian';
  }
  return '${relationship[0].toUpperCase()}${relationship.substring(1)}';
}
