import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/admin_assignments_models.dart';
import '../../models/parent_links_models.dart';
import '../../providers/admin_patient_assignments_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/admin_ui_components.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';

class PatientAssignmentsScreen extends ConsumerStatefulWidget {
  const PatientAssignmentsScreen({super.key});

  @override
  ConsumerState<PatientAssignmentsScreen> createState() =>
      _PatientAssignmentsScreenState();
}

class _PatientAssignmentsScreenState
    extends ConsumerState<PatientAssignmentsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(adminPatientAssignmentsProvider.notifier).initialize();
    });
  }

  Future<void> _confirmUnlinkSpecialist(PatientSpecialistLink link) async {
    final l10n = AppLocalizations.of(context)!;
    final messenger = ScaffoldMessenger.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => _UnlinkConfirmDialog(
        title: l10n.adminAssignmentsUnlinkSpecialist,
        message: l10n.adminAssignmentsUnlinkSpecialistConfirm(
          link.specialistName,
        ),
        messenger: messenger,
        onConfirm: () => ref
            .read(adminPatientAssignmentsProvider.notifier)
            .unlinkSpecialist(link.specialistId),
      ),
    );

    if (!mounted || confirmed != true) return;
    messenger.showSnackBar(
      SnackBar(content: Text(l10n.adminAssignmentsSpecialistUnlinked)),
    );
  }

  Future<void> _confirmUnlinkParent(PatientGuardianLink guardian) async {
    final l10n = AppLocalizations.of(context)!;
    final messenger = ScaffoldMessenger.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => _UnlinkConfirmDialog(
        title: l10n.adminAssignmentsUnlinkParent,
        message: l10n.adminAssignmentsUnlinkParentConfirm(guardian.parentName),
        messenger: messenger,
        onConfirm: () => ref
            .read(adminPatientAssignmentsProvider.notifier)
            .unlinkParent(guardian.parentId),
      ),
    );

    if (!mounted || confirmed != true) return;
    messenger.showSnackBar(
      SnackBar(content: Text(l10n.adminAssignmentsParentUnlinked)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(adminPatientAssignmentsProvider);
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return AdminPageScaffold(
      title: l10n.navPatientAssignments,
      showBackButton: true,
      currentNav: DashboardNavItem.patients,
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: context.dashPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (state.errorMessage != null)
                    AdminErrorCard(
                      message: state.errorMessage!,
                      onRetry: () => ref
                          .read(adminPatientAssignmentsProvider.notifier)
                          .refresh(),
                    ),
                  if (state.successMessage != null) ...[
                    AdminSurfaceCard(
                      tint: DashboardColors.success,
                      child: Row(
                        children: [
                          Icon(
                            Icons.check_circle_outline_rounded,
                            color: DashboardColors.success,
                            size: context.dashSpacing * 0.65,
                          ),
                          SizedBox(width: context.dashSpacing * 0.6),
                          Expanded(
                            child: Text(
                              state.successMessage!,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.75),
                  ],
                  _DropdownField<PatientOption>(
                    label: l10n.entityPatient,
                    value: state.patients
                        .where((p) => p.id == state.selectedPatientId)
                        .cast<PatientOption?>()
                        .firstOrNull,
                    items: state.patients,
                    itemLabel: (item) => item.name,
                    onChanged: (item) => ref
                        .read(adminPatientAssignmentsProvider.notifier)
                        .selectPatient(item?.id),
                    emptyHint: l10n.adminAssignmentsNoPatients,
                  ),
                  SizedBox(height: context.dashSpacing),
                  AdminSurfaceCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          l10n.adminAssignmentsAssignSpecialist,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.75),
                        _DropdownField<SpecialistUserOption>(
                          label: l10n.roleSpecialist,
                          value: state.specialists
                              .where(
                                (s) =>
                                    s.userId == state.selectedSpecialistUserId,
                              )
                              .cast<SpecialistUserOption?>()
                              .firstOrNull,
                          items: state.specialists,
                          itemLabel: (item) =>
                              item.email != null && item.email!.isNotEmpty
                              ? '${item.name} (${item.email})'
                              : item.name,
                          onChanged: (item) => ref
                              .read(adminPatientAssignmentsProvider.notifier)
                              .selectSpecialist(item?.userId),
                          emptyHint: l10n.adminAssignmentsNoSpecialists,
                        ),
                        SizedBox(height: context.dashSpacing * 0.5),
                        CheckboxListTile(
                          contentPadding: EdgeInsets.zero,
                          visualDensity: VisualDensity.compact,
                          value: state.isPrimarySpecialist,
                          onChanged: (value) => ref
                              .read(adminPatientAssignmentsProvider.notifier)
                              .setPrimarySpecialist(value ?? true),
                          title: Text(
                            l10n.adminAssignmentsPrimarySpecialist,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          activeColor: DashboardColors.brandCyan,
                          controlAffinity: ListTileControlAffinity.leading,
                        ),
                        SizedBox(height: context.dashSpacing * 0.35),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: state.isSubmittingSpecialist
                                ? null
                                : () => ref
                                      .read(
                                        adminPatientAssignmentsProvider
                                            .notifier,
                                      )
                                      .assignSpecialist(),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: DashboardColors.brandCyan,
                              foregroundColor: Colors.white,
                              padding: EdgeInsets.symmetric(
                                vertical: context.dashSpacing * 0.75,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: state.isSubmittingSpecialist
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : Text(
                                    l10n.adminAssignmentsAssignSpecialistAction,
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: context.dashSpacing),
                  AdminSurfaceCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          l10n.adminAssignmentsLinkParent,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.75),
                        _DropdownField<ParentUserOption>(
                          label: l10n.roleParent,
                          value: state.parents
                              .where(
                                (p) => p.userId == state.selectedParentUserId,
                              )
                              .cast<ParentUserOption?>()
                              .firstOrNull,
                          items: state.parents,
                          itemLabel: (item) =>
                              item.email != null && item.email!.isNotEmpty
                              ? '${item.name} (${item.email})'
                              : item.name,
                          onChanged: (item) => ref
                              .read(adminPatientAssignmentsProvider.notifier)
                              .selectParent(item?.userId),
                          emptyHint: l10n.adminAssignmentsNoParents,
                        ),
                        SizedBox(height: context.dashSpacing * 0.75),
                        _DropdownField<String>(
                          label: l10n.adminAssignmentsRelationship,
                          value: state.selectedRelationship,
                          items: parentRelationshipOptions,
                          itemLabel: (item) =>
                              item[0].toUpperCase() + item.substring(1),
                          onChanged: (item) => ref
                              .read(adminPatientAssignmentsProvider.notifier)
                              .selectRelationship(item),
                          emptyHint: l10n.adminAssignmentsSelectRelationship,
                        ),
                        SizedBox(height: context.dashSpacing * 0.5),
                        CheckboxListTile(
                          contentPadding: EdgeInsets.zero,
                          visualDensity: VisualDensity.compact,
                          value: state.isPrimaryContact,
                          onChanged: (value) => ref
                              .read(adminPatientAssignmentsProvider.notifier)
                              .setPrimaryContact(value ?? true),
                          title: Text(
                            l10n.adminAssignmentsPrimaryContact,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          activeColor: DashboardColors.brandCyan,
                          controlAffinity: ListTileControlAffinity.leading,
                        ),
                        SizedBox(height: context.dashSpacing * 0.35),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: state.isSubmittingParent
                                ? null
                                : () => ref
                                      .read(
                                        adminPatientAssignmentsProvider
                                            .notifier,
                                      )
                                      .linkParent(),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: DashboardColors.brandCyan,
                              foregroundColor: Colors.white,
                              padding: EdgeInsets.symmetric(
                                vertical: context.dashSpacing * 0.75,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: state.isSubmittingParent
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : Text(
                                    l10n.adminAssignmentsLinkParentAction,
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.5),
                  Text(
                    l10n.adminAssignmentsChangeHint,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing),
                  Text(
                    l10n.adminAssignmentsAssignedSpecialists,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.5),
                  if (state.isLoadingRelationships)
                    AdminLoadingCard(
                      message: l10n.adminAssignmentsLoadingRelationships,
                    )
                  else if (state.selectedPatientId == null)
                    AdminEmptyCard(message: l10n.adminAssignmentsSelectPatient)
                  else if (state.assignedSpecialists.isEmpty)
                    AdminEmptyCard(
                      message: l10n.adminAssignmentsNoSpecialistsAssigned,
                    )
                  else
                    ...state.assignedSpecialists.map(
                      (link) => Padding(
                        padding: EdgeInsets.only(
                          bottom: context.dashSpacing * 0.6,
                        ),
                        child: AdminSurfaceCard(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              CircleAvatar(
                                backgroundColor: DashboardColors.tealSoft,
                                child: Text(
                                  dashboardAvatarLetter(link.specialistName),
                                  style: TextStyle(
                                    color: DashboardColors.success,
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
                                      link.specialistName,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: theme.textTheme.bodyMedium
                                          ?.copyWith(
                                            fontWeight: FontWeight.w700,
                                          ),
                                    ),
                                    Text(
                                      '${link.isPrimary ? l10n.adminAssignmentsPrimarySpecialist : l10n.roleSpecialist}'
                                      '${link.email != null ? ' • ${link.email}' : ''}',
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color:
                                                DashboardColors.textSecondary,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                tooltip: l10n
                                    .adminAssignmentsUnlinkSpecialistTooltip,
                                onPressed: state.isUnlinking
                                    ? null
                                    : () => _confirmUnlinkSpecialist(link),
                                icon: Icon(
                                  Icons.link_off_rounded,
                                  color: DashboardColors.highPriority,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  SizedBox(height: context.dashSpacing),
                  Text(
                    l10n.adminAssignmentsLinkedParents,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.5),
                  if (state.isLoadingRelationships)
                    const SizedBox.shrink()
                  else if (state.selectedPatientId == null)
                    AdminEmptyCard(message: l10n.adminAssignmentsSelectPatient)
                  else if (state.linkedParents.isEmpty)
                    AdminEmptyCard(
                      message: l10n.adminAssignmentsNoParentsLinked,
                    )
                  else
                    ...state.linkedParents.map(
                      (guardian) => Padding(
                        padding: EdgeInsets.only(
                          bottom: context.dashSpacing * 0.6,
                        ),
                        child: AdminSurfaceCard(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              CircleAvatar(
                                backgroundColor: DashboardColors.blueSoft,
                                child: Text(
                                  dashboardAvatarLetter(guardian.parentName),
                                  style: TextStyle(
                                    color: DashboardColors.brandCyan,
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
                                      guardian.parentName,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: theme.textTheme.bodyMedium
                                          ?.copyWith(
                                            fontWeight: FontWeight.w700,
                                          ),
                                    ),
                                    Text(
                                      '${_formatRelationship(context, guardian.relationship)}'
                                      '${guardian.isPrimaryContact ? ' • ${l10n.adminAssignmentsPrimaryContact}' : ''}',
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color:
                                                DashboardColors.textSecondary,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                tooltip:
                                    l10n.adminAssignmentsUnlinkParentTooltip,
                                onPressed: state.isUnlinking
                                    ? null
                                    : () => _confirmUnlinkParent(guardian),
                                icon: Icon(
                                  Icons.link_off_rounded,
                                  color: DashboardColors.highPriority,
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

class _UnlinkConfirmDialog extends StatefulWidget {
  const _UnlinkConfirmDialog({
    required this.title,
    required this.message,
    required this.messenger,
    required this.onConfirm,
  });

  final String title;
  final String message;
  final ScaffoldMessengerState messenger;
  final Future<String?> Function() onConfirm;

  @override
  State<_UnlinkConfirmDialog> createState() => _UnlinkConfirmDialogState();
}

class _UnlinkConfirmDialogState extends State<_UnlinkConfirmDialog> {
  bool _submitting = false;

  Future<void> _onConfirmPressed() async {
    if (_submitting) return;

    setState(() => _submitting = true);

    final error = await widget.onConfirm();
    if (!mounted) return;

    if (error != null) {
      setState(() => _submitting = false);
      widget.messenger.showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: DashboardColors.highPriority,
        ),
      );
      return;
    }

    Navigator.of(context).pop(true);
  }

  void _onCancelPressed() {
    if (_submitting) return;
    Navigator.of(context).pop(false);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return PopScope(
      canPop: !_submitting,
      child: AlertDialog(
        title: Text(widget.title),
        content: Text(widget.message),
        actions: [
          TextButton(
            onPressed: _submitting ? null : _onCancelPressed,
            child: Text(l10n.commonCancel),
          ),
          FilledButton(
            onPressed: _submitting ? null : _onConfirmPressed,
            style: FilledButton.styleFrom(
              backgroundColor: DashboardColors.highPriority,
            ),
            child: _submitting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(l10n.adminUnlink),
          ),
        ],
      ),
    );
  }
}

class _DropdownField<T> extends StatelessWidget {
  const _DropdownField({
    required this.label,
    required this.value,
    required this.items,
    required this.itemLabel,
    required this.onChanged,
    required this.emptyHint,
  });

  final String label;
  final T? value;
  final List<T> items;
  final String Function(T item) itemLabel;
  final ValueChanged<T?> onChanged;
  final String emptyHint;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (items.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(emptyHint, style: theme.textTheme.bodySmall),
        ],
      );
    }

    return DropdownButtonFormField<T>(
      key: ValueKey('$label-${items.contains(value) ? value : 'none'}'),
      isExpanded: true,
      initialValue: items.contains(value) ? value : null,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: DashboardColors.surface,
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: DashboardColors.border),
        ),
      ),
      items: items
          .map(
            (item) => DropdownMenuItem<T>(
              value: item,
              child: Text(
                itemLabel(item),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
          .toList(),
      selectedItemBuilder: (context) => items
          .map(
            (item) => Align(
              alignment: AlignmentDirectional.centerStart,
              child: Text(
                itemLabel(item),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
          .toList(),
      onChanged: onChanged,
    );
  }
}

String _formatRelationship(BuildContext context, String relationship) {
  final l10n = AppLocalizations.of(context)!;
  if (relationship.isEmpty) {
    return l10n.adminAssignmentsGuardian;
  }
  final normalized = relationship.trim().toLowerCase();
  if (normalized == 'guardian') {
    return l10n.adminAssignmentsGuardian;
  }
  return '${relationship[0].toUpperCase()}${relationship.substring(1)}';
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull {
    final iterator = this.iterator;
    if (!iterator.moveNext()) {
      return null;
    }
    return iterator.current;
  }
}
